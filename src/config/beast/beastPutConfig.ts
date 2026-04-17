import { validateSchema } from "../../util/validation";
import { beastSchema } from "./beastSchema";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial,
} from "../../util/dbHelpers";

export const beastPutConfig = {
	table: "beasts",
	notFoundMessage: "Beast not found",
	successMessage: "Successfully replaced Beast",

	required: ["name", "playCost", "level", "bts", "evoCost", "evoColor"],

	replace: {
		sql: `
            UPDATE beasts
            SET name = ?, play_cost = ?, level = ?, bts = ?, evo_cost = ?, evo_color = ?
            WHERE id = ?
        `,
		params: (s: any) => [
			s.name,
			s.playCost,
			s.level,
			s.bts,
			s.evoCost,
			s.evoColor,
		],
	},

	validate(s: any, errors: any[]) {
		validateSchema(beastSchema, s, errors);
	},

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
