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

export function replaceKeywords(
    table: string,
    idField: string,
    id: number,
    keywords: string[]
) {
    replaceList(table, idField, id, keywords, "keyword");
}

export function replaceRestrictions(
    id: number,
    restrictions: string[]
) {
    replaceList("beast_restrictions", "beast_id", id, restrictions, "restriction");
}

export function replaceSoulEffects(
    id: number,
    soulEffects: { trigger: string; available: string | null; text: string }[]
) {
    db.query(`DELETE FROM beast_soul_effects WHERE beast_id = ?`).run(id);

    for (const s of soulEffects) {
        db.query(`
            INSERT INTO beast_soul_effects (beast_id, trigger, available, text)
            VALUES (?, ?, ?, ?)
        `).run(id, s.trigger, s.available ?? null, s.text);
    }
}

export function replaceSpecial(
    id: number,
    special: { name: string; text: string } | null
) {
    db.query(`DELETE FROM beast_special WHERE beast_id = ?`).run(id);

    if (special) {
        db.query(`
            INSERT INTO beast_special (beast_id, name, text)
            VALUES (?, ?, ?)
        `).run(id, special.name, special.text);
    }
}

