import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";

//config
import { beastPostConfig } from "../config/beast/beastPostConfig";
import { beastGetConfig } from "../config/beast/beastGetConfig";

//TODO: remove these imports after switching to util helpers
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

import {
	replaceEffects,
	replaceKeywords,
	replaceList,
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial,
} from "../util/dbHelpers";

import * as beastTypes from "../types/beast";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query<Pick<beastTypes.BeastRow, "id" | "name">, []>(
			`
        SELECT id, name
        FROM beasts
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, beastGetConfig));

//POST
data.post("/", (c) => createCard(c, beastPostConfig));

//PATCH
data.patch("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const body = await c.req.json().catch(() => null);

	const exists = checkBeastExist(c, id);
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

	//Apply updates
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

	applyNumberUpdate("level", s.level, {
		sqlField: "level",
		parent: "stats",
		updates,
		params,
		updatedFields,
		errors,
	});

	applyNumberUpdate("BTS", s.BTS, {
		sqlField: "bts",
		parent: "stats",
		updates,
		params,
		updatedFields,
		errors,
	});

	applyNumberUpdate("evoCost", s.evoCost, {
		sqlField: "evo_cost",
		parent: "stats",
		updates,
		params,
		updatedFields,
		errors,
	});

	applyStringUpdate("evoColor", s.evoColor, {
		sqlField: "evo_color",
		parent: "stats",
		updates,
		params,
		updatedFields,
	});

	validateNestedBeastStats(s, errors);

	if (errors.length > 0) {
		return c.json(errorResponse(errors), 400);
	}

	if (s.effects !== undefined) {
		replaceEffects("beast", id, s.effects);
		updatedFields.push("stats.effects");
	}

	if (s.traits !== undefined) {
		replaceList("beast_traits", "beast_id", id, s.traits, "trait");
		updatedFields.push("stats.traits");
	}

	if (s.keywords !== undefined) {
		replaceKeywords("beast_keywords", "beast_id", id, s.keywords);
		updatedFields.push("stats.keywords");
	}

	if (s.restrictions !== undefined) {
		replaceRestrictions(id, s.restrictions);
		updatedFields.push("stats.restrictions");
	}

	if (s.soulEffects !== undefined) {
		replaceSoulEffects(id, s.soulEffects);
		updatedFields.push("stats.soulEffects");
	}

	if (s.special !== undefined) {
		replaceSpecial(id, s.special);
		updatedFields.push("stats.special");
	}

	if (updates.length > 0) {
		params.push(id);
		db.query<unknown, any[]>(
			`
            UPDATE beasts SET ${updates.join(", ")} WHERE id = ?
        `,
		).run(...params);
	}

	return c.json({
		message: "Successfully updated Beast",
		updatedFields,
		success: true,
	});
});

//DELETE
data.delete("/:id", (c) => {
	const id = Number(c.req.param("id"));

	const exists = checkBeastExist(c, id);
	if (!exists) return exists;

	//Delete
	db.query<unknown, [number]>(`DELETE FROM beasts WHERE id = ?`).run(id);

	return c.json({
		message: "Successfully deleted Beast",
		success: true,
	});
});

//Helpers
function checkBeastExist(c: any, id: number) {
	const exists = db
		.query<beastTypes.BeastRow, [number]>(
			`
        SELECT id FROM beasts WHERE id = ?
    `,
		)
		.get(id);

	if (!exists) {
		return c.json({ error: "Beast not found", success: false }, 404);
	}
	return exists;
}

function validateNestedBeastStats(s: any, errors: any[]) {
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

	if (s.restrictions !== undefined) {
		const restCheck = validateStringArray("restrictions", s.restrictions);
		if (restCheck) errors.push(restCheck);
	}

	if (s.soulEffects !== undefined && !Array.isArray(s.soulEffects)) {
		errors.push({
			type: "Invalid Value",
			fields: [
				{
					field: "soulEffects",
					value: JSON.stringify(s.soulEffects),
					reason: "must be an array",
				},
			],
		});
	}
}

export default data;
