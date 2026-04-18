import { validateSchema } from "../../util/validation";
import { programSchema } from "./programSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const programPutConfig = {
	table: "programs",
	notFoundMessage: "Program not found",
	successMessage: "Successfully replaced Program",

	required: ["name", "playCost", "color", "bitEffect"],

	replace: {
		sql: `
            UPDATE programs
            SET name = ?, image = ?, play_cost = ?, color = ?, bit_effect = ?
            WHERE id = ?
        `,
		params: (s: any) => [s.name, s.image, s.playCost, s.color, s.bitEffect],
	},

	validate(s: any, errors: any[]) {
		validateSchema(programSchema, s, errors);
	},

	validateNested(s: any, errors: any[]) {
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
