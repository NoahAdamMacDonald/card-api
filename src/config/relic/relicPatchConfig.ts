import {
	applyStringUpdate,
	applyNumberUpdate,
	validateEffectsArray,
	validateStringArray,
} from "../../util/validation";

import { replaceEffects, replaceKeywords } from "../../util/dbHelpers";

export const relicPatchConfig = {
	table: "relics",
	notFoundMessage: "Relic not found",
	successMessage: "Successfully updated Relic",

	baseFields: [
		{ name: "name", sqlField: "name", apply: applyStringUpdate },
		{ name: "playCost", sqlField: "play_cost", apply: applyNumberUpdate },
		{ name: "color", sqlField: "color", apply: applyStringUpdate },
		{ name: "bitEffect", sqlField: "bit_effect", apply: applyStringUpdate },
	],

	validateNested(s: any, errors: any[]) {
		if (s.effects !== undefined) {
			const e = validateEffectsArray(s.effects);
			if (e) errors.push(e);
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
