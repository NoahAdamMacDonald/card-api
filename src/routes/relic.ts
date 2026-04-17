import { Hono } from "hono";
import { db } from "../db";
import * as relicTypes from "../types/relic";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";

//config
import { relicPostConfig } from "../config/relic/relicPostConfig";
import { relicGetConfig } from "../config/relic/relicGetConfig";

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

import { replaceEffects, replaceKeywords } from "../util/dbHelpers";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query(
			`
        SELECT id, name
        FROM relics
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, relicGetConfig));

//POST
data.post("/", (c) => createCard(c, relicPostConfig));

//DELETE
data.delete("/:id", (c) => {
	const id = Number(c.req.param("id"));

	const exists = checkRelicExist(c, id);
	if (!exists) return exists;

	//Delete
	db.query<unknown, [number]>(`DELETE FROM relics WHERE id = ?`).run(id);

	return c.json({
		message: "Successfully deleted Relic",
		success: true,
	});
});

//helpers
function checkRelicExist(c: any, id: number) {
	const exists = db
		.query<relicTypes.RelicRow, [number]>(
			`
        SELECT id FROM relics WHERE id = ?
    `,
		)
		.get(id);

	if (!exists) {
		return c.json({ error: "Relic not found", success: false }, 404);
	}

	return exists;
}

function validateNestedRelicStats(s: any, errors: any[]) {
	if (s.effects !== undefined) {
		const effCheck = validateEffectsArray(s.effects);
		if (effCheck) errors.push(effCheck);
	}

	if (s.keywords !== undefined) {
		const keyCheck = validateStringArray("keywords", s.keywords);
		if (keyCheck) errors.push(keyCheck);
	}
}

export default data;
