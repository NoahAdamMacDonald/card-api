import { validateSchema } from "../../util/validation";
import { biomeSchema } from "./biomeSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const biomePostConfig = {
	required: ["name", "playCost", "color", "bitEffect"],
	successMessage: "Successfully added new Biome",

	insert: {
		sql: `
            INSERT INTO biomes (name, play_cost, color, bit_effect)
            VALUES (?, ?, ?, ?)
        `,
		params: (s: any) => [s.name, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
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
