import { Hono } from "hono";
import { db } from "../db";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query(`
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
    .query(`
        SELECT id, name, play_cost, level, bts, evo_cost, evo_color
        FROM beasts where id = ?
    `).get(id);

    //error handle
    if (!base) {
        return c.json({ error: "Beast not found" }, 404);
    }
    
    //effects
    const effects = db
    .query(`SELECT id, text FROM beast_effects WHERE beast_id = ?`).all(id);

    //effects triggers
    const triggers = db
    .query(`
        SELECT effect_id, trigger 
        FROM beast_effect_triggers 
        WHERE effect_id IN (SELECT id FROM beast_effects WHERE beast_id = ?) 
    `).all(id);

    //special
    const special = db
    .query(`SELECT name, text FROM beast_special WHERE beast_id = ?`).get(id);

    //soul effects
    const soulEffects = db
    .query(`
        SELECT trigger, available, text
        FROM beast_soul_effects
        WHERE beast_id = ?
    `).all(id);

    //traits
    const traits = db
    .query(`SELECT trait from beast_traits WHERE beast_id = ?`)
    .all(id)
    .map((t: any) => t.trait);

    //restrictions
    const restrictions = db
    .query(`SELECT restriction FROM beast_restrictions WHERE beast_id = ?`)
    .all(id)
    .map((r: any) => r.restriction);

    //keywords
    const keywords = db
    .query(`SELECT keyword FROM beast_keywords WHERE beast_id = ?`)
    .all(id)
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

//PATCH

//DELETE

export default data;