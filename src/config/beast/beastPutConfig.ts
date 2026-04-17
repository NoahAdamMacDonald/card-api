import {
	validatePositiveNumber,
	validateEffectsArray,
	validateStringArray,
} from "../../util/validation";

import {
	replaceEffects,
	replaceList,
	replaceKeywords,
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
		const pc = validatePositiveNumber("playCost", s.playCost);
		if (pc) errors.push(pc);

		const lvl = validatePositiveNumber("level", s.level);
		if (lvl) errors.push(lvl);

		const bts = validatePositiveNumber("bts", s.bts);
		if (bts) errors.push(bts);

		const ec = validatePositiveNumber("evoCost", s.evoCost);
		if (ec) errors.push(ec);
	},

	validateNested(s: any, errors: any[]) {
		const eff = validateEffectsArray(s.effects);
		if (eff) errors.push(eff);

		const traits = validateStringArray("traits", s.traits);
		if (traits) errors.push(traits);

		const keywords = validateStringArray("keywords", s.keywords);
		if (keywords) errors.push(keywords);

		const restrictions = validateStringArray("restrictions", s.restrictions);
		if (restrictions) errors.push(restrictions);
	},

	nested: [
		{
			field: "effects",
			handler: (id: number, v: any) => replaceEffects("beast", id, v),
		},
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
		{
			field: "restrictions",
			handler: (id: number, v: any) =>
				replaceList(
					"beast_restrictions",
					"beast_id",
					id,
					v,
					"restriction",
				),
		},
		{
			field: "soulEffects",
			handler: (id: number, v: any) =>
				replaceList("beast_soul_effects", "beast_id", id, v, "text"),
		},
		{
			field: "special",
			handler: (id: number, v: any) =>
				replaceList("beast_special", "beast_id", id, [v], "text"),
		},
	],
};
