import { db } from "../db";

import {
    errorResponse,
    successResponse,
    collectErrors,
} from './validation'

/**
 * Creates a new card based on the provided request body and configuration.
 * 
 * The configuration object should contain the following properties:
 * - required: an array of required fields in the request body.stats object
 * - insert: an object containing the SQL query to insert the base row and an array of parameters to insert
 * - nested: an array of objects containing the following properties:
 *   - field: the name of the field in the request body.stats object that contains the nested list
 *   - handler: a function that takes the id of the newly inserted base row and the nested list as arguments
 * - validate: an optional function that takes the request body.stats object and an array of errors as arguments
 * - successMessage: an optional string that will be returned in the response if the card is successfully created
 * 
 * If the request body is invalid or if any of the required fields are missing, a 400 response will be returned with an error message.
 * 
 * If the card is successfully created, a 200 response will be returned with a success message.
 */
export async function createCard(c: any, config: any) {
    const body = await c.req.json().catch(() => null);

    //Require stats field for all
    if(!body?.stats) {
        return c.json(
            errorResponse([{ type: "missing required fields", fields: ["stats"] }]),
            400
        );
    }

    const s = body.stats;
    const errors: any[] = [];

    //Validate required fields
    for(const field of config.required) {
        if(s[field] === undefined || s[field] === null) {
            errors.push({
                type: "missing required fields",
                fields: [field]
            });
        }
    }

    //Custom Validation
    if(config.validate) {
        config.validate(s, errors);
    }

    if(errors.length > 0) {
        return c.json(errorResponse(collectErrors(...errors)), 400);
    }

    //insert base row
    const results = db.query(config.insert.sql).run(...config.insert.params(s));
    const id = results.lastInsertRowid as number;

    //insert nested lists
    for(const nested of config.nested) {
        if(s[nested.field] !== undefined) {
            nested.handler(id, s[nested.field]);
        }
    }

    return c.json(successResponse(config.successMessage), 200);
}