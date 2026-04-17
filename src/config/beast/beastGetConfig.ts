export const beastGetConfig = {
	table: "beasts",
	notFoundMessage: "Beast not found",

	base: {
		sql: `
      SELECT id, name, play_cost, level, bts, evo_cost, evo_color
      FROM beasts WHERE id = ?
    `,
	},

	nested: [
		{
			field: "effects",
			sql: `SELECT id, text FROM beast_effects WHERE beast_id = ?`,
			map: (rows: any[]) => rows,
		},
		{
			field: "triggers",
			sql: `
        SELECT effect_id, trigger 
        FROM beast_effect_triggers 
        WHERE effect_id IN (SELECT id FROM beast_effects WHERE beast_id = ?)
      `,
			map: (rows: any[]) => rows,
		},
		{
			field: "special",
			sql: `SELECT name, text FROM beast_special WHERE beast_id = ?`,
			map: (rows: any[]) => rows[0] ?? null,
		},
		{
			field: "soulEffects",
			sql: `
        SELECT trigger, available, text
        FROM beast_soul_effects
        WHERE beast_id = ?
      `,
			map: (rows: any[]) => rows,
		},
		{
			field: "traits",
			sql: `SELECT trait FROM beast_traits WHERE beast_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.trait),
		},
		{
			field: "restrictions",
			sql: `SELECT restriction FROM beast_restrictions WHERE beast_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.restriction),
		},
		{
			field: "keywords",
			sql: `SELECT keyword FROM beast_keywords WHERE beast_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.keyword),
		},
	],

	format(base: any, nested: any) {
		const effectsWithTriggers = nested.effects.map((effect: any) => ({
			trigger: nested.triggers
				.filter((t: any) => t.effect_id === effect.id)
				.map((t: any) => t.trigger),
			text: effect.text,
		}));

		return {
			cardType: "beast",
			stats: {
				name: base.name,
				playCost: base.play_cost,
				level: base.level,
				BTS: base.bts,
				evoCost: base.evo_cost,
				evoColor: base.evo_color,
				effects: effectsWithTriggers,
				special: nested.special,
				soulEffects: nested.soulEffects,
				restrictions: nested.restrictions,
				traits: nested.traits,
				keywords: nested.keywords,
			},
		};
	},
};
