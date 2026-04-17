import { Hono } from "hono";
import { db } from "../db";
import * as relicTypes from "../types/relic";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { relicPostConfig } from "../config/relic/relicPostConfig";
import { relicGetConfig } from "../config/relic/relicGetConfig";
import { relicDeleteConfig } from "../config/relic/relicDeleteConfig";
import { relicPatchConfig } from "../config/relic/relicPatchConfig";

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

//PATCH
data.patch("/:id", (c) => updateCard(c, relicPatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, relicDeleteConfig));

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
