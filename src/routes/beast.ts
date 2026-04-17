import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { beastPostConfig } from "../config/beast/beastPostConfig";
import { beastGetConfig } from "../config/beast/beastGetConfig";
import { beastDeleteConfig } from "../config/beast/beastDeleteConfig";
import { beastPatchConfig } from "../config/beast/beastPatchConfig";

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
data.patch("/:id", (c) => updateCard(c, beastPatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, beastDeleteConfig));

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
