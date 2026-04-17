import {
	replaceEffects,
	replaceList,
	replaceRestrictions,
	replaceSoulEffects,
	replaceSpecial,
	replaceKeywords,
} from "../../util/dbHelpers";

import {
	validatePositiveNumber,
	validateEffectsArray,
	validateStringArray,
	validateString
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
		const nameErr = validateString("name", s.name);
		if (nameErr) errors.push(nameErr);

		const evoColorErr = validateString("evoColor", s.evoColor);
		if (evoColorErr) errors.push(evoColorErr);

		

		const pc = validatePositiveNumber("playCost", s.playCost);
		if (pc) errors.push(pc);

		const lvl = validatePositiveNumber("level", s.level);
		if (lvl) errors.push(lvl);

		const bts = validatePositiveNumber("bts", s.bts);
		if (bts) errors.push(bts);

		const ec = validatePositiveNumber("evoCost", s.evoCost);
		if (ec) errors.push(ec);

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
				replaceKeywords("beast_keywords", "beast_id", id, v),
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
