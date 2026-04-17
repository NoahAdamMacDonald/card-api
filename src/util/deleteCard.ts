import { db } from "../db";
import { checkExists } from "./checkExists";

export function deleteCard(c: any, config: any) {
    const id = Number(c.req.param("id"));

    const exists = checkExists(c, config.table, id, config.notFoundMessage);
    if (!exists || exists instanceof Response) return exists;
    
    db.query(`DELETE FROM ${config.table} WHERE id = ?`).run(id);

    return c.json({
        message: config.successMessage,
        success: true,
    });
}