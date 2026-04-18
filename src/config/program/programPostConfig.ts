import { validateSchema } from "../../util/validation";
import { programSchema } from "./programSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const programPostConfig = {
	required: ["name", "playCost", "color", "bitEffect"],
	successMessage: "Successfully added new Program",

	insert: {
		sql: `
            INSERT INTO programs (name, image, play_cost, color, bit_effect)
            VALUES (?, ?, ?, ?, ?)
        `,
		params: (s: any) => [s.name, s.image, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
		validateSchema(programSchema, s, errors);
	},

	nested: [
		{
			field: "effects",
			handler: (id: number, v: any) => replaceEffects("program", id, v),
		},
		{
			field: "traits",
			handler: (id: number, v: any) =>
				replaceList("program_traits", "program_id", id, v, "trait"),
		},
		{
			field: "keywords",
			handler: (id: number, v: any) =>
				replaceKeywords("program_keywords", "program_id", id, v),
		},
	],
};
