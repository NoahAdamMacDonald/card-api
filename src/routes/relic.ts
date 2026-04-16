import { Hono } from "hono";
import { db } from "../db";
import * as relicTypes from "../types/relic";

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
    replaceKeywords
} from "../util/dbHelpers";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query(`
        SELECT id, name
        FROM relics
        ORDER BY id
    `).all();

    return c.json(rows);
});

data.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    //base level
    const base = db
    .query<relicTypes.RelicRow, [number]>(`
        SELECT id, name, play_cost, color, bit_effect
        FROM relics WHERE id = ?
    `).get(id);

    //error handle
    if (!base) {
        return c.json({ error: "Relic not found" }, 404);
    }

    //effects
    const effects = db
    .query<relicTypes.RelicEffectRow, [number]>(`
        SELECT id, text FROM relic_effects WHERE relic_id = ?
    `).all(id);

    //triggers
    const triggers = db
    .query<relicTypes.RelicTriggerRow, [number]>(`
        SELECT effect_id, trigger, available
        FROM relic_effect_triggers
        WHERE effect_id IN (SELECT id FROM relic_effects WHERE relic_id = ?)  
    `).all(id);

    //keywords
    const keywords = db
    .query<relicTypes.RelicKeywordRow, [number]>(`
        SELECT keyword FROM relic_keywords WHERE relic_id = ?
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
    cardType: "relic",
    stats: {
    name: base.name,
        playCost: base.play_cost,
        color: base.color,
        effects: effectsWithTriggers,
        bitEffect: base.bit_effect,
        keywords,
    },
    });
});

//POST
data.post("/", async (c) => {
    const body = await c.req.json().catch(() => null);

    if (!body?.stats) {
        return c.json(
            errorResponse([{ type: "missing required fields", fields: ["stats"] }]),
            400
        );
    }

    const s = body.stats;

    const errors = collectErrors(
        validateRequired(s, ["name", "playCost", "color", "bitEffect"]),
        validatePositiveNumber("playCost", s.playCost)
    );

    validateNestedRelicStats(s, errors);

    if (errors.length > 0) {
        return c.json(errorResponse(errors), 400);
    }

    const result = db.query<
        unknown,
        [string, number, string, string]
    >(`
        INSERT INTO relics (name, play_cost, color, bit_effect)
        VALUES (?, ?, ?, ?)
    `).run(s.name, s.playCost, s.color, s.bitEffect);

    const relicId = result.lastInsertRowid as number;

    if (s.effects) {
        replaceEffects("relic", relicId, s.effects);
    }

    if (s.keywords) {
        replaceKeywords("relic_keywords", "relic_id", relicId, s.keywords);
    }

    return c.json(successResponse("Successfully added new Relic"), 201);
});


//PATCH
data.patch("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json().catch(() => null);

    const exists = checkRelicExist(c, id);
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

    validateNestedRelicStats(s, errors);

    if (errors.length > 0) {
        return c.json(errorResponse(errors), 400);
    }

    //Nested updates
    if (s.effects !== undefined) {
        replaceEffects("relic", id, s.effects);
        updatedFields.push("stats.effects");
    }

    if (s.keywords !== undefined) {
        replaceKeywords("relic_keywords", "relic_id", id, s.keywords);
        updatedFields.push("stats.keywords");
    }

    //Send update
    if (updates.length > 0) {
        params.push(id);
        db.query<unknown, any[]>(`
            UPDATE relics SET ${updates.join(", ")} WHERE id = ?
        `).run(...params);
    }

    return c.json({
        message: "Successfully updated Relic",
        updatedFields,
        success: true
    });
});


//DELETE
data.delete("/:id", (c) => {
    const id = Number(c.req.param("id"));

    const exists = checkRelicExist(c, id);
    if (!exists) return exists;

    //Delete
    db.query<unknown, [number]>(
        `DELETE FROM relics WHERE id = ?`
    ).run(id);

    return c.json({
        message: "Successfully deleted Relic",
        success: true
    });
});

//helpers
function checkRelicExist(c: any, id: number) {
    const exists = db.query<relicTypes.RelicRow, [number]>(`
        SELECT id FROM relics WHERE id = ?
    `).get(id);

    if (!exists) {
        return c.json({ error: "Relic not found", success: false }, 404);
    }

    return exists;
}

function validateNestedRelicStats(s: any, errors: any[]) {
    if (s.effects !== undefined) {
        const effCheck = validateEffectsArray(s.effects);
        if (effCheck) errors.push(effCheck);
    }

    if (s.keywords !== undefined) {
        const keyCheck = validateStringArray("keywords", s.keywords);
        if (keyCheck) errors.push(keyCheck);
    }
}


export default data;