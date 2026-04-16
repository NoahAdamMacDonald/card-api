import { Hono } from "hono";
import { db } from "../db";
import { successResponse, errorResponse } from "../util/validation";

import * as beastTypes from "../types/beast";
import { stringBufferToString } from "hono/utils/html";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query<Pick<beastTypes.BeastRow, "id" | "name">, []>(`
        SELECT id, name
        FROM beasts
        ORDER BY id
    `).all();

    return c.json(rows);
});

data.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    //base level
    const base = db
    .query<beastTypes.BeastRow, [number]>(`
        SELECT id, name, play_cost, level, bts, evo_cost, evo_color
        FROM beasts where id = ?
    `).get(id);

    //error handle
    if (!base) {
        return c.json({ error: "Beast not found" }, 404);
    }
    
    //effects
    const effects = db
    .query<beastTypes.BeastEffectRow, [number]>(`SELECT id, text FROM beast_effects WHERE beast_id = ?`).all(id);

    //effects triggers
    const triggers = db
    .query<beastTypes.BeastTriggerRow, [number]>(`
        SELECT effect_id, trigger 
        FROM beast_effect_triggers 
        WHERE effect_id IN (SELECT id FROM beast_effects WHERE beast_id = ?) 
    `).all(id);

    //special
    const special = db
    .query<beastTypes.BeastSpecialRow, number>(`
        SELECT name, text FROM beast_special WHERE beast_id = ?
    `).get(id);

    //soul effects
    const soulEffects = db
    .query<beastTypes.BeastSoulEffectRow, [number]>(`
        SELECT trigger, available, text
        FROM beast_soul_effects
        WHERE beast_id = ?
    `).all(id);

    //traits
    const traits = db
    .query<beastTypes.BeastTraitRow, [number]>(`SELECT trait from beast_traits WHERE beast_id = ?`)
    .all(id)
    .map((t: any) => t.trait);

    //restrictions
    const restrictions = db
    .query<beastTypes.BeastRestrictionRow, [number]>(`SELECT restriction FROM beast_restrictions WHERE beast_id = ?`)
    .all(id)
    .map((r: any) => r.restriction);

    //keywords
    const keywords = db
    .query<beastTypes.BeastKeywordRow, [number]>(
        `SELECT keyword FROM beast_keywords WHERE beast_id = ?`
    ).all(id)
    .map((k: any) => k.keyword);

    //connect effects and triggers
    const effectsWithTriggers = effects.map((effect: any) => ({
    trigger: triggers
        .filter((t: any) => t.effect_id === effect.id)
        .map((t: any) => t.trigger),
    text: effect.text,
    }));

    //return
      return c.json({
    cardType: "beast",
    stats: {
        name: base.name,
        playCost: base.play_cost,
        level: base.level,
        BTS: base.bts,
        evoCost: base.evo_cost,
        evoColor: base.evo_color,
        effects: effectsWithTriggers,
        special: special ?? null,
        soulEffects,
        restrictions,
        traits,
        keywords,
    },
  });
});

//POST
data.post("/", async (c) => {
    const body = await c.req.json().catch(()=>null);

    if(!body?.stats) {
        return c.json(
            errorResponse([
                {type: "missing required fields", fields: ["stats"]}
            ]),
            400
        );
    }

    const s = body.stats;

    //required fields
    const missingFields = [];
    if(!s.name) missingFields.push("name")
    if (s.playCost == null) missingFields.push("playCost");

    //validation check
    const invalidFields = [];
    if (typeof s.playCost !== "number" || s.playCost <= 0) {
        invalidFields.push({
            field: "playCost",
            value: String(s.playCost),
            reason: "must be Integer greater than 0"
        });
    }

    if (missingFields.length > 0 || invalidFields.length > 0) {
        const errors = [];

        if (missingFields.length > 0) {
            errors.push({
                type: "missing required fields",
                fields: missingFields
            });
        }

        if (invalidFields.length > 0) {
            errors.push({
                type: "Invalid Value",
                fields: invalidFields
            });
        }
        return c.json(errorResponse(errors), 400);
    }

    //add new beast
    db.query<unknown, [string, number, number, number, number, string]>(`
        INSERT INTO beasts (name, play_cost, level, bts, evo_cost, evo_color)
        VALUES (?, ?, ?, ?, ?, ?)    
    `).run(
    s.name,
    s.playCost,
    s.level ?? 0,
    s.BTS ?? 0,
    s.evoCost ?? 0,
    s.evoColor ?? "colorless"
    );

    return c.json(successResponse("Successfully added new Beast"), 201);
});

//PATCH

//DELETE

export default data;