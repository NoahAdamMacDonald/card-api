import { replaceEffects, replaceList, replaceKeywords } from "../util/dbHelpers";

import {
	validatePositiveNumber,
	validateEffectsArray,
	validateStringArray,
} from "../util/validation";

export const programConfig = {
	required: ["name", "playCost", "color", "bitEffect"],
	successMessage: "Successfully added new Program",

	insert: {
		sql: `
      INSERT INTO programs (name, play_cost, color, bit_effect)
      VALUES (?, ?, ?, ?)
    `,
		params: (s: any) => [s.name, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
		const base = validatePositiveNumber("playCost", s.playCost);
		if (base) errors.push(base);

		if (s.effects !== undefined) {
			const eff = validateEffectsArray(s.effects);
			if (eff) errors.push(eff);
		}

		if (s.traits !== undefined) {
			const t = validateStringArray("traits", s.traits);
			if (t) errors.push(t);
		}

		if (s.keywords !== undefined) {
			const k = validateStringArray("keywords", s.keywords);
			if (k) errors.push(k);
		}
	},

	nested: [
		{
			field: "effects",
			handler: (id: number, v: any) => replaceEffects("program", id, v),
		},
		{
			field: "traits",
			handler: (id: number, v: any) =>
				replaceList("program_traits", "program_id", id, v, "trait"),
		},
		{
			field: "keywords",
			handler: (id: number, v: any) =>
				replaceKeywords("program_keywords", "program_id", id, v),
		},
	],
};
