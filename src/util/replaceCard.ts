import { db } from "../db";
import { checkExists } from "./checkExists";
import { errorResponse, collectErrors } from "./validation";

export async function replaceCard(c: any, config: any) {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => null);

    const exists = checkExists(c, config.table, id, config.notFoundMessage);
    if (!exists || exists instanceof Response) return exists;
}