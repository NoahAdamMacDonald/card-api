import { db } from "../db";
import { checkExists } from "./checkExists";
import { successResponse, errorResponse, collectErrors } from "./validation";

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