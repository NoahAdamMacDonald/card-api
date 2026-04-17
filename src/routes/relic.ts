import { Hono } from "hono";
import { db } from "../db";
import * as relicTypes from "../types/relic";

import { createCard } from "../util/createCard";
import { relicConfig } from "../config/relic/relicPostConfig";

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
data.post("/", (c) => createCard(c, relicConfig));

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