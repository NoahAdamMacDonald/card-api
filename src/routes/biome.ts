import { Hono } from "hono";
import { db } from "../db";
import * as biomeTypes from "../types/biome";

import { createCard } from "../util/createCard";
import { biomeConfig } from "../config/biomeConfig";

import { 
    successResponse, 
    errorResponse,
    collectErrors,
    validatePositiveNumber,
    validateRequired,
    validateStringArray,
    validateEffectsArray,
    applyNumberUpdate,
    applyStringUpdate
} from "../util/validation";

import { 
    replaceEffects,
    replaceKeywords,
    replaceList
} from "../util/dbHelpers";

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
data.post("/", (c) => createCard(c, biomeConfig));

//PATCH
data.patch("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => null);

    const exists = checkBiomeExist(c, id);
    if (!exists) return exists;

    if (!body?.stats) {
        return c.json(
            errorResponse([{ type: "missing required fields", fields: ["stats"] }]),
            400
        );
    }

    const s = body.stats;

    const updates: string[] = [];
    const params: any[] = [];
    const updatedFields: string[] = [];
    const errors: any[] = [];

    applyStringUpdate("name", s.name, {
        sqlField: "name",
        parent: "stats",
        updates,
        params,
        updatedFields
    });

    applyNumberUpdate("playCost", s.playCost, {
        sqlField: "play_cost",
        parent: "stats",
        updates,
        params,
        updatedFields,
        errors
    });

    applyStringUpdate("color", s.color, {
        sqlField: "color",
        parent: "stats",
        updates,
        params,
        updatedFields
    });

    applyStringUpdate("bitEffect", s.bitEffect, {
        sqlField: "bit_effect",
        parent: "stats",
        updates,
        params,
        updatedFields
    });

    validateNestedBiomeStats(s, errors);

    if (errors.length > 0) {
        return c.json(errorResponse(errors), 400);
    }

    if (s.effects !== undefined) {
        replaceEffects("biome", id, s.effects);
        updatedFields.push("stats.effects");
    }

    if (s.traits !== undefined) {
        replaceList("biome_traits", "biome_id", id, s.traits, "trait");
        updatedFields.push("stats.traits");
    }

    if (s.keywords !== undefined) {
        replaceKeywords("biome_keywords", "biome_id", id, s.keywords);
        updatedFields.push("stats.keywords");
    }

    if (updates.length > 0) {
        params.push(id);
        db.query<unknown, any[]>(`
            UPDATE biomes SET ${updates.join(", ")} WHERE id = ?
        `).run(...params);
    }

    return c.json({
        message: "Successfully updated Biome",
        updatedFields,
        success: true
    });
});



//DELETE
data.delete("/:id", (c) => {
    const id = Number(c.req.param("id"));

    const exists = checkBiomeExist(c, id);
    if (!exists) return exists;

    //Delete
    db.query<unknown, [number]>(
        `DELETE FROM biomes WHERE id = ?`
    ).run(id);

    return c.json({
        message: "Successfully deleted Biome",
        success: true
    });
});

//Helper
function checkBiomeExist(c: any, id: number) {
    const exists = db.query<biomeTypes.BiomeRow, [number]>(`
        SELECT id FROM biomes WHERE id = ?
    `).get(id);

    if (!exists) {
        return c.json({ error: "Biome not found", success: false }, 404);
    }

    return exists;
}

function validateNestedBiomeStats(s: any, errors: any[]) {
    if (s.effects !== undefined) {
        const effCheck = validateEffectsArray(s.effects);
        if (effCheck) errors.push(effCheck);
    }

    if (s.traits !== undefined) {
        const traitCheck = validateStringArray("traits", s.traits);
        if (traitCheck) errors.push(traitCheck);
    }

    if (s.keywords !== undefined) {
        const keyCheck = validateStringArray("keywords", s.keywords);
        if (keyCheck) errors.push(keyCheck);
    }
}


export default data;