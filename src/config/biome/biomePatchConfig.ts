import {
	applyStringUpdate,
	applyNumberUpdate,
	validateEffectsArray,
	validateStringArray,
} from "../../util/validation";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const biomePatchConfig = {
	table: "biomes",
	notFoundMessage: "Biome not found",
	successMessage: "Successfully updated Biome",

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
			handler: (id: number, v: any) => replaceEffects("biome", id, v),
		},
		{
			field: "traits",
			handler: (id: number, v: any) =>
				replaceList("biome_traits", "biome_id", id, v, "trait"),
		},
		{
			field: "keywords",
			handler: (id: number, v: any) =>
				replaceKeywords("biome_keywords", "biome_id", id, v),
		},
	],
};
