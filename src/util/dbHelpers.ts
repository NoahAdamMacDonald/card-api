import { db } from "../db";

//Replace existing list with new one
export function replaceList(
    table: string,
    idField: string,
    id: number,
    values: string[],
    valueField: string
) {
    db.query(`DELETE FROM ${table} WHERE ${idField} = ?`).run(id);
    for (const value of values) {
        db.query(`
        INSERT INTO ${table} (${idField}, ${valueField}) VALUES (?, ?)
    `).run(id, value);
    }
}

export function replaceEffects(
    type: "beast" | "relic" | "program" | "biome",
    id: number,
    effects: {
        text: string;
        trigger: string[];
        available?: string | null;
    }[]
) {
    const effectTable = `${type}_effects`;
    const triggerTable = `${type}_effect_triggers`;
    const idField = `${type}_id`;

    db.query(`DELETE FROM ${triggerTable} WHERE effect_id IN (SELECT id FROM ${effectTable} WHERE ${idField} = ?)`).run(id);
    db.query(`DELETE FROM ${effectTable} WHERE ${idField} = ?`).run(id);

    //insert new
    for (const effect of effects) {
        const result = db
        .query(`
            INSERT INTO ${effectTable} (${idField}, text) VALUES (?, ?)
        `).run(id, effect.text);

        const effectId = result.lastInsertRowid as number;

        for (const trig of effect.trigger) {
        db.query(`
            INSERT INTO ${triggerTable} (effect_id, trigger, available) VALUES (?, ?, ?)
        `).run(effectId, trig, effect.available ?? null);
        }
    }
}