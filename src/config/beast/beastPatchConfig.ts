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
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial
} from "../../util/dbHelpers";

export const beastPatchConfig = {
	table: "beasts",
	notFoundMessage: "Beast not found",
	successMessage: "Successfully updated Beast",

	baseFields: [
		{ name: "name", sqlField: "name", apply: applyStringUpdate },
		{ name: "playCost", sqlField: "play_cost", apply: applyNumberUpdate },
		{ name: "level", sqlField: "level", apply: applyNumberUpdate },
		{ name: "BTS", sqlField: "bts", apply: applyNumberUpdate },
		{ name: "evoCost", sqlField: "evo_cost", apply: applyNumberUpdate },
		{ name: "evoColor", sqlField: "evo_color", apply: applyStringUpdate },
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
		if (s.restrictions !== undefined) {
			const r = validateStringArray("restrictions", s.restrictions);
			if (r) errors.push(r);
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
	},

	nested: [
		{
			field: "effects",
			handler: (id: number, v: any) => replaceEffects("beast", id, v),
		},
		{
			field: "traits",
			handler: (id: number, v: any) =>
				replaceList("beast_traits", "beast_id", id, v, "trait"),
		},
		{
			field: "keywords",
			handler: (id: number, v: any) =>
				replaceKeywords("beast_keywords", "beast_id", id, v),
		},
		{
			field: "restrictions",
			handler: (id: number, v: any) => replaceRestrictions(id, v),
		},
		{
			field: "soulEffects",
			handler: (id: number, v: any) => replaceSoulEffects(id, v),
		},
		{
			field: "special",
			handler: (id: number, v: any) => replaceSpecial(id, v),
		},
	],
};
