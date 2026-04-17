import { db } from "../db";
import { checkExists } from "./checkExists";


/**
 * Retrieves a card by its id from the database with the given configuration.
 * 
 * The configuration object should contain the following properties:
 * - table: the name of the table to retrieve the card from
 * - notFoundMessage: the error message to return if the card is not found
 * - base: an object containing the SQL query to retrieve the base row and the parameters to insert
 * - nested: an array of objects containing the following properties:
 *   - field: the name of the field in the request body.stats object that contains the nested list
 *   - sql: the SQL query to retrieve the nested list
 *   - map: an optional function that takes the nested list as an argument and returns a mapped version of the list
 * - format: an optional function that takes the base row and nested results as arguments and returns a formatted version of the card
 * 
 * If the card is not found, a 404 response will be returned with the notFoundMessage.
 * 
 * If the card is successfully retrieved, a 200 response will be returned with the formatted card.
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

    //Build
    const result = config.format(base, nestedResults);

    //Filter fields
    const fieldsParam = c.req.query("fields");
    if (fieldsParam) {
        const fields = fieldsParam.split(",").map((f: string) => f.trim());

        const filteredStats: any = {};
        for (const f of fields) {
            if (result.stats[f] !== undefined) {
                filteredStats[f] = result.stats[f];
            }
        }

        return c.json({
            id,
            cardType: result.cardType,
            stats: filteredStats,
        });
    }

    //return all fields
    return c.json({
        id,
        cardType: result.cardType,
        stats: result.stats,
    });
}