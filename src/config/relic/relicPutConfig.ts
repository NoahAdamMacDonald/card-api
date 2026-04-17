import { validateSchema } from "../../util/validation";
import { relicSchema } from "./relicSchema";

import { replaceEffects, replaceKeywords } from "../../util/dbHelpers";

export const relicPutConfig = {
	table: "relics",
	notFoundMessage: "Relic not found",
	successMessage: "Successfully replaced Relic",

	required: ["name", "playCost", "color", "bitEffect"],

	replace: {
		sql: `
            UPDATE relics
            SET name = ?, play_cost = ?, color = ?, bit_effect = ?
            WHERE id = ?
        `,
		params: (s: any) => [s.name, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
		validateSchema(relicSchema, s, errors);
	},

	validateNested(s: any, errors: any[]) {
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
