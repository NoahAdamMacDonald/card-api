export const biomeGetConfig = {
	table: "biomes",
	notFoundMessage: "Biome not found",

	base: {
		sql: `
      SELECT id, name, image, play_cost, color, bit_effect
      FROM biomes WHERE id = ?
    `,
	},

	nested: [
		{
			field: "effects",
			sql: `SELECT id, text FROM biome_effects WHERE biome_id = ?`,
			map: (rows: any[]) => rows,
		},
		{
			field: "triggers",
			sql: `
        SELECT effect_id, trigger, available
        FROM biome_effect_triggers
        WHERE effect_id IN (SELECT id FROM biome_effects WHERE biome_id = ?)
      `,
			map: (rows: any[]) => rows,
		},
		{
			field: "traits",
			sql: `SELECT trait FROM biome_traits WHERE biome_id = ?`,
			map: (rows: any[]) => rows.map((r) => r.trait),
		},
		{
			field: "keywords",
			sql: `SELECT keyword FROM biome_keywords WHERE biome_id = ?`,
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
			cardType: "biome",
			stats: {
				name: base.name,
				image: base.image,
				playCost: base.play_cost,
				color: base.color,
				bitEffect: base.bit_effect,
				effects: effectsWithTriggers,
				traits: nested.traits,
				keywords: nested.keywords,
			},
		};
	},
};
