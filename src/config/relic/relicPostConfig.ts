import { validateSchema } from "../../util/validation";
import { relicSchema } from "./relicSchema";

import { replaceEffects, replaceKeywords } from "../../util/dbHelpers";

export const relicPostConfig = {
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
		validateSchema(relicSchema, s, errors);
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
