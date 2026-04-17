import {
	applyStringUpdate,
	applyNumberUpdate,
	validateSchema,
} from "../../util/validation";

import { biomeSchema } from "./biomeSchema";

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
		validateSchema(biomeSchema, s, errors);
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
