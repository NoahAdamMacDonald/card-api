export const relicGetConfig = {
	table: "relics",
	notFoundMessage: "Relic not found",

	base: {
		sql: `
      SELECT id, name, play_cost, color, bit_effect
      FROM relics WHERE id = ?
    `,
	},

	nested: [
		{
			field: "effects",
			sql: `SELECT id, text FROM relic_effects WHERE relic_id = ?`,
			map: (rows: any[]) => rows,
		},
		{
			field: "triggers",
			sql: `
        SELECT effect_id, trigger, available
        FROM relic_effect_triggers
        WHERE effect_id IN (SELECT id FROM relic_effects WHERE relic_id = ?)
      `,
			map: (rows: any[]) => rows,
		},
		{
			field: "keywords",
			sql: `SELECT keyword FROM relic_keywords WHERE relic_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.keyword),
		},
	],

	format(base: any, nested: any) {
		const effectsWithTriggers = nested.effects.map((effect: any) => ({
			trigger: nested.triggers
				.filter((t: any) => t.effect_id === effect.id)
				.map((t: any) => t.trigger),
			available:
				nested.triggers.find((t: any) => t.effect_id === effect.id)
					?.available ?? null,
			text: effect.text,
		}));

		return {
			cardType: "relic",
			stats: {
				name: base.name,
				playCost: base.play_cost,
				color: base.color,
				bitEffect: base.bit_effect,
				effects: effectsWithTriggers,
				keywords: nested.keywords,
			},
		};
	},
};
