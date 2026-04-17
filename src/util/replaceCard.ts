import { db } from "../db";
import { checkExists } from "./checkExists";
import { successResponse, errorResponse, collectErrors } from "./validation";

/**
 * Replaces a card in the database with the provided request body and configuration.
 * 
 * @param {any} c - The request context
 * @param {any} config - The configuration object
 * 
 * The configuration object should contain the following properties:
 * - table: the name of the table to replace the card in
 * - notFoundMessage: the error message to return if the card is not found
 * - required: an array of required fields in the request body.stats object
 * - validate: an optional function that takes the request body.stats object and an array of errors as arguments
 * - validateNested: an optional function that takes the request body.stats object and an array of errors as arguments
 * - replace: an object containing the SQL query to replace the base row and an array of parameters to insert
 * - nested: an array of objects containing the following properties:
 *   - field: the name of the field in the request body.stats object that contains the nested list
 *   - sql: the SQL query to replace the nested list
 *   - handler: a function that takes the id of the newly replaced base row and the nested list as arguments
 * - successMessage: an optional string that will be returned in the response if the card is successfully replaced
 * 
 * If the card is not found, a 404 response will be returned with the notFoundMessage.
 * 
 * If the request body is invalid or if any of the required fields are missing, a 400 response will be returned with an error message.
 * 
 * If the card is successfully replaced, a 200 response will be returned with the success message.
 */
export async function replaceCard(c: any, config: any) {
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
    const errors: any[] = [];

    //Validate Required Fields
    for (const field of config.required) {
        if (s[field] === undefined || s[field] === null) {
            errors.push({
                type: "missing required fields",
                fields: [field],
            });
        }
    }

    //Custom Validation
    if (config.validate) {
        config.validate(s, errors);
    }

    //Nested Validation
    if (config.validateNested) {
		config.validateNested(s, errors);
	}

    if (errors.length > 0) {
        return c.json(errorResponse(collectErrors(...errors)), 400);
    }

    //Replace base row
    db.query(config.replace.sql).run(...config.replace.params(s), id);

    //Replace nested rows
    for (const nested of config.nested) {
        nested.handler(id, s[nested.field] ?? []);
    }

    return c.json(successResponse(config.successMessage));
}