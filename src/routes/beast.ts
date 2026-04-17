import { Hono } from "hono";
import { db } from "../db";

import { createCard } from "../util/createCard";
import { beastConfig } from "../config/beast/beastPostConfig";

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

data.get("/:id", (c) => {
	const id = Number(c.req.param("id"));

	//base level
	const base = db
		.query<beastTypes.BeastRow, [number]>(
			`
        SELECT id, name, play_cost, level, bts, evo_cost, evo_color
        FROM beasts where id = ?
    `,
		)
		.get(id);

	//error handle
	if (!base) {
		return c.json({ error: "Beast not found" }, 404);
	}

	//effects
	const effects = db
		.query<
			beastTypes.BeastEffectRow,
			[number]
		>(`SELECT id, text FROM beast_effects WHERE beast_id = ?`)
		.all(id);

	//effects triggers
	const triggers = db
		.query<beastTypes.BeastTriggerRow, [number]>(
			`
        SELECT effect_id, trigger 
        FROM beast_effect_triggers 
        WHERE effect_id IN (SELECT id FROM beast_effects WHERE beast_id = ?) 
    `,
		)
		.all(id);

	//special
	const special = db
		.query<beastTypes.BeastSpecialRow, number>(
			`
        SELECT name, text FROM beast_special WHERE beast_id = ?
    `,
		)
		.get(id);

	//soul effects
	const soulEffects = db
		.query<beastTypes.BeastSoulEffectRow, [number]>(
			`
        SELECT trigger, available, text
        FROM beast_soul_effects
        WHERE beast_id = ?
    `,
		)
		.all(id);

	//traits
	const traits = db
		.query<beastTypes.BeastTraitRow, [number]>(
			`SELECT trait from beast_traits WHERE beast_id = ?`,
		)
		.all(id)
		.map((t: any) => t.trait);

	//restrictions
	const restrictions = db
		.query<beastTypes.BeastRestrictionRow, [number]>(
			`SELECT restriction FROM beast_restrictions WHERE beast_id = ?`,
		)
		.all(id)
		.map((r: any) => r.restriction);

	//keywords
	const keywords = db
		.query<beastTypes.BeastKeywordRow, [number]>(
			`SELECT keyword FROM beast_keywords WHERE beast_id = ?`,
		)
		.all(id)
		.map((k: any) => k.keyword);

	//connect effects and triggers
	const effectsWithTriggers = effects.map((effect: any) => ({
		trigger: triggers
			.filter((t: any) => t.effect_id === effect.id)
			.map((t: any) => t.trigger),
		text: effect.text,
	}));

	//return
	return c.json({
		cardType: "beast",
		stats: {
			name: base.name,
			playCost: base.play_cost,
			level: base.level,
			BTS: base.bts,
			evoCost: base.evo_cost,
			evoColor: base.evo_color,
			effects: effectsWithTriggers,
			special: special ?? null,
			soulEffects,
			restrictions,
			traits,
			keywords,
		},
	});
});

//POST
data.post("/", (c) => createCard(c, beastConfig));

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
