import { Hono } from "hono";
import { db } from "../db";
import * as biomeTypes from "../types/biome";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query<Pick<biomeTypes.BiomeRow, "id" | "name">, []>(`
        SELECT id, name
        FROM biomes
        ORDER BY id
    `).all();

    return c.json(rows);
});

data.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    //base level
    const base = db
    .query<biomeTypes.BiomeRow, [number]>(`
        SELECT id, name, play_cost, color, bit_effect
        FROM biomes WHERE id = ?
    `).get(id);

    //error handle
    if (!base) {
        return c.json({ error: "Biome not found" }, 404);
    }

    //effects
    const effects = db
    .query<biomeTypes.BiomeEffectRow, [number]>(`
        SELECT id, text FROM biome_effects WHERE biome_id = ?
    `).all(id);

    //triggers
      const triggers = db
    .query<biomeTypes.BiomeTriggerRow, [number]>(`
        SELECT effect_id, trigger, available
        FROM biome_effect_triggers
        WHERE effect_id IN (SELECT id FROM biome_effects WHERE biome_id = ?)
    `).all(id);

    //traits
    const traits = db
    .query<biomeTypes.BiomeTraitRow, [number]>(`
        SELECT trait FROM biome_traits WHERE biome_id = ?
    `)
    .all(id)
    .map((t) => t.trait);

    //keywords
    const keywords = db
    .query<biomeTypes.BiomeKeywordRow, [number]>(`
        SELECT keyword FROM biome_keywords WHERE biome_id = ?
    `)
    .all(id)
    .map((k: any) => k.keyword);

    //connect effects and triggers
    const effectsWithTriggers = effects.map((effect) => ({
    trigger: triggers
        .filter((t) => t.effect_id === effect.id)
        .map((t) => t.trigger),
    available: triggers.find((t) => t.effect_id === effect.id)?.available ?? null,
    text: effect.text,
    }));

    return c.json({
    cardType: "biome",
    stats: {
        name: base.name,
        playCost: base.play_cost,
        color: base.color,
        effects: effectsWithTriggers,
        traits,
        bitEffect: base.bit_effect,
        keywords,
    },
    });
});



//POST

//PATCH

//DELETE

export default data;