import { validateSchema } from "../../util/validation";
import { beastSchema } from "./beastSchema";

import { replaceEffects } from "../../util/dbHelpers";
import { replaceList } from "../../util/dbHelpers";
import { replaceKeywords } from "../../util/dbHelpers";
import { replaceRestrictions } from "../../util/dbHelpers";
import { replaceSoulEffects } from "../../util/dbHelpers";
import { replaceSpecial } from "../../util/dbHelpers";

export const beastPostConfig = {
	required: ["name", "playCost", "evoCost", "evoColor", "level"],
	successMessage: "Successfully added new Beast",

	insert: {
		sql: `
            INSERT INTO beasts (name, play_cost, level, bts, evo_cost, evo_color)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
		params: (s: any) => [
			s.name,
			s.playCost,
			s.level ?? 0,
			s.bts ?? 0,
			s.evoCost ?? 0,
			s.evoColor ?? "colorless",
		],
	},

	validate(s: any, errors: any[]) {
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
