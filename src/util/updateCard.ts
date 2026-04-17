import { db } from "../db";
import { checkExists } from "./checkExists";
import { errorResponse } from "./validation";

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
    for(const field of config.baseFields) {
        const value = s[field];
        
        if(value===undefined) continue;

        field.apply(value, {
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
        return c.json(errorResponse(errors), 400);
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
        message: config.successMessage,
        updatedFields,
        success: true,
    });
}