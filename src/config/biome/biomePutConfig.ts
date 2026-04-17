import { validateSchema } from "../../util/validation";
import { biomeSchema } from "./biomeSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const biomePutConfig = {
	table: "biomes",
	notFoundMessage: "Biome not found",
	successMessage: "Successfully replaced Biome",

	required: ["name", "playCost", "color", "bitEffect"],

	replace: {
		sql: `
            UPDATE biomes
            SET name = ?, play_cost = ?, color = ?, bit_effect = ?
            WHERE id = ?
        `,
		params: (s: any) => [s.name, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
		validateSchema(biomeSchema, s, errors);
	},

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
