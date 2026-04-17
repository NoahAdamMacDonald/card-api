import { db } from "../db";
import { checkExists } from "./checkExists";


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