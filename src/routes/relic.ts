import { Hono } from "hono";
import { db } from "../db";
import * as relicTypes from "../types/relic";

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
    const effect = db
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

    
});

//POST

//PATCH

//DELETE

export default data;