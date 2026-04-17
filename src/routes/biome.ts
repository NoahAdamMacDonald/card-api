import { Hono } from "hono";
import { db } from "../db";
import * as biomeTypes from "../types/biome";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { biomePostConfig } from "../config/biome/biomePostConfig";
import { biomeGetConfig } from "../config/biome/biomeGetConfig";
import { biomeDeleteConfig } from "../config/biome/biomeDeleteConfig";
import { biomePatchConfig } from "../config/biome/biomePatchConfig";

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
		.query<Pick<biomeTypes.BiomeRow, "id" | "name">, []>(
			`
        SELECT id, name
        FROM biomes
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, biomeGetConfig));

//POST
data.post("/", (c) => createCard(c, biomePostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, biomePatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, biomeDeleteConfig));

//Helper
function checkBiomeExist(c: any, id: number) {
	const exists = db
		.query<biomeTypes.BiomeRow, [number]>(
			`
        SELECT id FROM biomes WHERE id = ?
    `,
		)
		.get(id);

	if (!exists) {
		return c.json({ error: "Biome not found", success: false }, 404);
	}

	return exists;
}

function validateNestedBiomeStats(s: any, errors: any[]) {
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
