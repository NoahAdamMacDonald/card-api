import { db } from "../db";
import { checkExists } from "./checkExists";
import { successResponse, errorResponse, collectErrors } from "./validation";

/**
 * Updates a card in the database with the provided request body and configuration.
 * 
 * @param {any} c - The request context
 * @param {any} config - The configuration object
 * 
 * The configuration object should contain the following properties:
 * - table: the name of the table to update the card in
 * - notFoundMessage: the error message to return if the card is not found
 * - baseFields: an array of objects containing the following properties:
 *   - name: the name of the field in the request body.stats object
 *   - apply: a function that takes the field name, value, and an object containing the following properties:
 *     - sqlField: the SQL field to update
 *     - parent: the parent object to update
 *     - updates: an array of updates to apply to the base row
 *     - params: an array of parameters to apply to the base row
 *     - updatedFields: an array of fields that have been updated
 *     - errors: an array of errors that have occurred
 * - validateNested: an optional function that takes the request body.stats object and an array of errors as arguments
 * - nested: an array of objects containing the following properties:
 *   - field: the name of the field in the request body.stats object that contains the nested list
 *   - handler: a function that takes the id of the newly updated base row and the nested list as arguments
 * - successMessage: an optional string that will be returned in the response if the card is successfully updated
 * 
 * If the card is not found, a 404 response will be returned with the notFoundMessage.
 * 
 * If the request body is invalid or if any of the required fields are missing, a 400 response will be returned with an error message.
 * 
 * If the card is successfully updated, a 200 response will be returned with the success message and an array of updated fields.
 */
export async function updateCard(c: any, config: any) {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => null);

    const exists = checkExists(c, config.table, id, config.notFoundMessage);
    if (!exists || exists instanceof Response) return exists;

    //Validate Base
    if (!body?.stats) {
        return c.json(
            errorResponse([
                { type: "missing required fields", fields: ["stats"] },
            ]),
            400,
        );
    }

    const s = body.stats;
    const updates: string[] = [];
    const params: any[] = [];
    const updatedFields: string[] = [];
    const errors: any[] = [];

    //Update base
    for (const field of config.baseFields) {
        const value = s[field.name];

        if (value === undefined) continue;

        field.apply(field.name, value, {
            sqlField: field.sqlField,
            parent: "stats",
            updates,
            params,
            updatedFields,
            errors,
        });
    }



    //Validate Nested
    if(config.validateNested) {
        config.validateNested(s, errors);
    }

    if(errors.length > 0) {
        return c.json(errorResponse(collectErrors(...errors)), 400);
    }

    //Update Nested
    for(const nested of config.nested) {
        if(s[nested.field] !== undefined) {
            nested.handler(id, s[nested.field]);
            updatedFields.push(`stats.${nested.field}`);
        }
    }

    //SQL update
    if (updates.length > 0) {
        params.push(id);
        db.query(
            `UPDATE ${config.table} SET ${updates.join(", ")} WHERE id = ?`,
        ).run(...params);
    }

    return c.json({
        ...successResponse(config.successMessage),
        updatedFields,
    });
}