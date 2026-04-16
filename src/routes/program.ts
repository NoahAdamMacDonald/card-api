import { Hono } from "hono";
import { db } from "../db";
import * as programTypes from "../types/program";
import { successResponse, errorResponse } from "../util/validation";
const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query<Pick<programTypes.ProgramRow, "id" | "name">, []>(`
        SELECT id, name
        FROM programs
        ORDER BY id
    `).all();

    return c.json(rows);
});

data.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    //base level
    const base = db
    .query<programTypes.ProgramRow, [number]>(`
        SELECT id, name, play_cost, color, bit_effect
        FROM programs WHERE id = ?
    `).get(id);

    //error handle
    if (!base) {
        return c.json({ error: "Program not found" }, 404);
    }

    //effects
    const effects = db
    .query<programTypes.ProgramEffectRow, [number]>(`
        SELECT id, text FROM program_effects WHERE program_id = ?
    `).all(id);

    //triggers
      const triggers = db
    .query<programTypes.ProgramTriggerRow, [number]>(`
        SELECT effect_id, trigger, available
        FROM program_effect_triggers
        WHERE effect_id IN (SELECT id FROM program_effects WHERE program_id = ?)
    `).all(id);

    //traits
    const traits = db
    .query<programTypes.ProgramTraitRow, [number]>(`
        SELECT trait FROM program_traits WHERE program_id = ?
    `)
    .all(id)
    .map((t) => t.trait);

    //keywords
    const keywords = db
    .query<programTypes.ProgramKeywordRow, [number]>(`
        SELECT keyword FROM program_keywords WHERE program_id = ?
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
    cardType: "program",
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
data.post("/", async (c) => {
    const body = await c.req.json().catch(() => null);

    if (!body?.stats) {
        return c.json(
            errorResponse([{ type: "missing required fields", fields: ["stats"] }]),
            400
        );
    }

    const s = body.stats;

    //Required Fields
    const missingFields = [];
    if (!s.name) missingFields.push("name");
    if (s.playCost == null) missingFields.push("playCost");
    if (!s.color) missingFields.push("color");
    if (!s.bitEffect) missingFields.push("bitEffect");


    //Validation check
    const invalidFields = [];

    if (typeof s.playCost !== "number" || s.playCost <= 0) {
        invalidFields.push({
            field: "playCost",
            value: String(s.playCost),
            reason: "must be Integer greater than 0"
        });
    }

    if (missingFields.length || invalidFields.length) {
        const errors = [];
        if (missingFields.length) {
            errors.push({ type: "missing required fields", fields: missingFields });
        }

        if (invalidFields.length) {
            errors.push({ type: "Invalid Value", fields: invalidFields });
        }

        return c.json(errorResponse(errors), 400);
    }

    db.query<unknown, [string, number, string, string]>(`
        INSERT INTO programs (name, play_cost, color, bit_effect)
        VALUES (?, ?, ?, ?)
    `).run(s.name, s.playCost, s.color, s.bitEffect);

    return c.json(successResponse("Successfully added new Program"), 201);
});

//PATCH

//DELETE

export default data;