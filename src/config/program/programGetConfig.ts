export const programGetConfig = {
	table: "programs",
	notFoundMessage: "Program not found",

	base: {
		sql: `
      SELECT id, name, image, play_cost, color, bit_effect
      FROM programs WHERE id = ?
    `,
	},

	nested: [
		{
			field: "effects",
			sql: `SELECT id, text FROM program_effects WHERE program_id = ?`,
			map: (rows: any[]) => rows,
		},
		{
			field: "triggers",
			sql: `
        SELECT effect_id, trigger, available
        FROM program_effect_triggers
        WHERE effect_id IN (SELECT id FROM program_effects WHERE program_id = ?)
      `,
			map: (rows: any[]) => rows,
		},
		{
			field: "traits",
			sql: `SELECT trait FROM program_traits WHERE program_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.trait),
		},
		{
			field: "keywords",
			sql: `SELECT keyword FROM program_keywords WHERE program_id = ?`,
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
			cardType: "program",
			stats: {
				name: base.name,
				playCost: base.play_cost,
				image: base.image,
				color: base.color,
				bitEffect: base.bit_effect,
				effects: effectsWithTriggers,
				traits: nested.traits,
				keywords: nested.keywords,
			},
		};
	},
};
