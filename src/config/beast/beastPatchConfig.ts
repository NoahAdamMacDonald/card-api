import {
	applyStringUpdate,
	applyNumberUpdate,
	validateSchema,
} from "../../util/validation";

import { beastSchema } from "./beastSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial,
} from "../../util/dbHelpers";

export const beastPatchConfig = {
	table: "beasts",
	notFoundMessage: "Beast not found",
	successMessage: "Successfully updated Beast",

	baseFields: [
		{ name: "name", sqlField: "name", apply: applyStringUpdate },
		{ name: "image", sqlField: "image", apply: applyStringUpdate },
		{ name: "playCost", sqlField: "play_cost", apply: applyNumberUpdate },
		{ name: "level", sqlField: "level", apply: applyNumberUpdate },
		{ name: "bts", sqlField: "bts", apply: applyNumberUpdate },
		{ name: "evoCost", sqlField: "evo_cost", apply: applyNumberUpdate },
		{ name: "evoColor", sqlField: "evo_color", apply: applyStringUpdate },
		{ name: "bitEffect", sqlField: "bit_effect", apply: applyStringUpdate },
	],

	validateNested(s: any, errors: any[]) {
		validateSchema(beastSchema, s, errors);
	},

	nested: [
		{ field: "effects", handler: (id: number, v: any) => replaceEffects("beast", id, v) },
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
		{ field: "restrictions", handler: (id: number, v: any) => replaceRestrictions(id, v) },
		{ field: "soulEffects", handler: (id: number, v: any) => replaceSoulEffects(id, v) },
		{ field: "special", handler: (id: number, v: any) => replaceSpecial(id, v) },
	],
};
