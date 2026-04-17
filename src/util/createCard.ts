import { db } from "../db";

import {
    errorResponse,
    successResponse,
    collectErrors,
} from './validation'

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