import { Hono } from "hono";
import { db } from "../db";
import * as programTypes from "../types/program";

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


});


//POST

//PATCH

//DELETE

export default data;