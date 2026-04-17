import { Hono } from "hono";
import { db } from "../db";
import * as programTypes from "../types/program";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { programPostConfig } from "../config/program/programPostConfig";
import { programGetConfig } from "../config/program/programGetConfig";
import { programDeleteConfig } from "../config/program/programDeleteConfig";
import { programPatchConfig } from "../config/program/programPatchConfig";


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
data.patch("/:id", (c) => updateCard(c, programPatchConfig));

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
