import { db } from "../db";
import { checkExists } from "./checkExists";


/**
 * Retrieves a card from the database based on the provided id and configuration.
 * 
 * @param {any} c - The request context
 * @param {any} config - The configuration object
 * 
 * The configuration object should contain the following properties:
 * - table: the name of the table to retrieve the card from
 * - notFoundMessage: the error message to return if the card is not found
 * - base: an object containing the SQL query to retrieve the base row and an optional map function to transform the results
 * - nested: an array of objects containing the following properties:
 *   - field: the name of the field in the request body.stats object that contains the nested list
 *   - sql: the SQL query to retrieve the nested list
 *   - map: an optional function to transform the results of the nested list
 * - format: an optional function to transform the results before returning them
 * 
 * If the card is not found, a 404 response will be returned with the notFoundMessage.
 * 
 * If the card is successfully retrieved, a 200 response will be returned with the transformed results.
 */
export function getCardbyId(c: any, config: any) {
    const id = Number(c.req.param("id"));

    const exists = checkExists(c, config.table, id, config.notFoundMessage);
    if (!exists || exists instanceof Response) return exists;

    //base row
    const base = db.query(config.base.sql).get(id);

    //nested
    const nestedResults: any = {}

    for (const nested of config.nested) {
        const rows = db.query(nested.sql).all(id);

        if(nested.map) {
            nestedResults[nested.field] = nested.map(rows);
        } else {
            nestedResults[nested.field] = rows;
        }
    }

    //build
    return c.json(config.format(base, nestedResults));
}