import { replaceEffects, replaceKeywords } from "../util/dbHelpers";

import {
	validatePositiveNumber,
	validateEffectsArray,
	validateStringArray,
} from "../util/validation";

export const relicConfig = {
	required: ["name", "playCost", "color", "bitEffect"],
	successMessage: "Successfully added new Relic",

	insert: {
		sql: `
      INSERT INTO relics (name, play_cost, color, bit_effect)
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

		if (s.keywords !== undefined) {
			const k = validateStringArray("keywords", s.keywords);
			if (k) errors.push(k);
		}
	},

	nested: [
		{
			field: "effects",
			handler: (id: number, v: any) => replaceEffects("relic", id, v),
		},
		{
			field: "keywords",
			handler: (id: number, v: any) =>
				replaceKeywords("relic_keywords", "relic_id", id, v),
		},
	],
};
