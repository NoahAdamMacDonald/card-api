import {
	applyStringUpdate,
	applyNumberUpdate,
	validateSchema,
} from "../../util/validation";

import { programSchema } from "./programSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
} from "../../util/dbHelpers";

export const programPatchConfig = {
	table: "programs",
	notFoundMessage: "Program not found",
	successMessage: "Successfully updated Program",

	baseFields: [
		{ name: "name", sqlField: "name", apply: applyStringUpdate },
		{ name: "playCost", sqlField: "play_cost", apply: applyNumberUpdate },
		{ name: "color", sqlField: "color", apply: applyStringUpdate },
		{ name: "bitEffect", sqlField: "bit_effect", apply: applyStringUpdate },
	],

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
