import {
	replaceEffects,
	replaceList,
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial,
} from "../../util/dbHelpers";

import {
	validatePositiveNumber,
	validateEffectsArray,
	validateStringArray,
} from "../../util/validation";

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
			s.BTS ?? 0,
			s.evoCost ?? 0,
			s.evoColor ?? "colorless",
		],
	},

	validate(s: any, errors: any[]) {
		const base = validatePositiveNumber("playCost", s.playCost);
		if (base) errors.push(base);

		if (s.effects !== undefined) {
			const eff = validateEffectsArray(s.effects);
			if (eff) errors.push(eff);
		}

		if (s.traits !== undefined) {
			const t = validateStringArray("traits", s.traits);
			if (t) errors.push(t);
		}

		if (s.keywords !== undefined) {
			const k = validateStringArray("keywords", s.keywords);
			if (k) errors.push(k);
		}
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
				replaceList("beast_keywords", "beast_id", id, v, "keyword"),
		},
		{
			field: "restrictions",
			handler: (id: number, v: any) => replaceRestrictions(id, v),
		},
		{
			field: "soulEffects",
			handler: (id: number, v: any) => replaceSoulEffects(id, v),
		},
		{
			field: "special",
			handler: (id: number, v: any) => replaceSpecial(id, v),
		},
	],
};
