import { Hono } from "hono";
import { db } from "../db";
import * as programTypes from "../types/program";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";

//config
import { programPostConfig } from "../config/program/programPostConfig";
import { programGetConfig } from "../config/program/programGetConfig";
import { programDeleteConfig } from "../config/program/programDeleteConfig";


import {
	successResponse,
	errorResponse,
	collectErrors,
	validatePositiveNumber,
	validateRequired,
	validateStringArray,
	validateEffectsArray,
	applyNumberUpdate,
	applyStringUpdate,
} from "../util/validation";

import { replaceEffects, replaceKeywords, replaceList } from "../util/dbHelpers";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query<Pick<programTypes.ProgramRow, "id" | "name">, []>(
			`
        SELECT id, name
        FROM programs
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, programGetConfig));

//POST
data.post("/", (c) => createCard(c, programPostConfig));

//PATCH
data.patch("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const body = await c.req.json().catch(() => null);

	const exists = checkProgramExist(c, id);
	if (!exists) return exists;

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

	// Base stat updates
	applyStringUpdate("name", s.name, {
		sqlField: "name",
		parent: "stats",
		updates,
		params,
		updatedFields,
	});

	applyNumberUpdate("playCost", s.playCost, {
		sqlField: "play_cost",
		parent: "stats",
		updates,
		params,
		updatedFields,
		errors,
	});

	applyStringUpdate("color", s.color, {
		sqlField: "color",
		parent: "stats",
		updates,
		params,
		updatedFields,
	});

	applyStringUpdate("bitEffect", s.bitEffect, {
		sqlField: "bit_effect",
		parent: "stats",
		updates,
		params,
		updatedFields,
	});

	validateNestedProgramStats(s, errors);

	if (errors.length > 0) {
		return c.json(errorResponse(errors), 400);
	}

	if (s.effects !== undefined) {
		replaceEffects("program", id, s.effects);
		updatedFields.push("stats.effects");
	}

	if (s.traits !== undefined) {
		replaceList("program_traits", "program_id", id, s.traits, "trait");
		updatedFields.push("stats.traits");
	}

	if (s.keywords !== undefined) {
		replaceKeywords("program_keywords", "program_id", id, s.keywords);
		updatedFields.push("stats.keywords");
	}

	if (updates.length > 0) {
		params.push(id);
		db.query<unknown, any[]>(
			`
            UPDATE programs SET ${updates.join(", ")} WHERE id = ?
        `,
		).run(...params);
	}

	return c.json({
		message: "Successfully updated Program",
		updatedFields,
		success: true,
	});
});

//DELETE
data.delete("/:id", (c) => deleteCard(c, programDeleteConfig));

//Helper
function checkProgramExist(c: any, id: number) {
	const exists = db
		.query<programTypes.ProgramRow, [number]>(
			`
        SELECT id FROM programs WHERE id = ?
    `,
		)
		.get(id);

	if (!exists) {
		return c.json({ error: "Program not found", success: false }, 404);
	}

	return exists;
}

function validateNestedProgramStats(s: any, errors: any[]) {
	if (s.effects !== undefined) {
		const effCheck = validateEffectsArray(s.effects);
		if (effCheck) errors.push(effCheck);
	}

	if (s.traits !== undefined) {
		const traitCheck = validateStringArray("traits", s.traits);
		if (traitCheck) errors.push(traitCheck);
	}

	if (s.keywords !== undefined) {
		const keyCheck = validateStringArray("keywords", s.keywords);
		if (keyCheck) errors.push(keyCheck);
	}
}

export default data;
