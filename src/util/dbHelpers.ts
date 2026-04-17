import { db } from "../db";

//Replace existing list with new one


/**
 * Replace all existing values in a list with new ones.
 *
 * @param {string} table - The table to replace values in.
 * @param {string} idField - The field in the table that corresponds to the id.
 * @param {number} id - The id of the row to replace values in.
 * @param {string[]} values - The new values to insert into the table.
 * @param {string} valueField - The field in the table that corresponds to the values.
 */
export function replaceList(
    table: string,
    idField: string,
    id: number,
    values: string[],
    valueField: string
) {
    db.query(`DELETE FROM ${table} WHERE ${idField} = ?`).run(id);

    if (!values || values.length === 0) return;

    for (const value of values) {
        db.query(`
        INSERT INTO ${table} (${idField}, ${valueField}) VALUES (?, ?)
    `).run(id, value);
    }
}

/**
 * Replace all existing effects in a beast/relic/program/biome with new ones.
 *
 * @param {string} type - The type of the effects to replace.
 * @param {number} id - The id of the beast/relic/program/biome to replace effects in.
 * @param {Object[]} effects - An array of objects containing the text, trigger, and available fields of the effects.
 */
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

    if (!effects || effects.length === 0) return;

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

/**
 * Replace all existing keywords in a table with new ones.
 *
 * @param {string} table - The table to replace keywords in.
 * @param {string} idField - The field in the table that corresponds to the id.
 * @param {number} id - The id of the row to replace keywords in.
 * @param {string[]} keywords - The new keywords to insert into the table.
 */
export function replaceKeywords(
    table: string,
    idField: string,
    id: number,
    keywords: string[]
) {
    replaceList(table, idField, id, keywords, "keyword");
}

/**
 * Replace all existing restrictions in a beast with new ones.
 *
 * @param {number} id - The id of the beast to replace restrictions in.
 * @param {string[]} restrictions - The new restrictions to insert into the beast.
 */
export function replaceRestrictions(
    id: number,
    restrictions: string[]
) {
    replaceList("beast_restrictions", "beast_id", id, restrictions, "restriction");
}

/**
 * Replace all existing soul effects in a beast with new ones.
 *
 * @param {number} id - The id of the beast to replace soul effects in.
 * @param {Object[]} soulEffects - The new soul effects to insert into the beast.
 * Each object should have the following properties:
 * - trigger: string - The trigger of the effect.
 * - available: string | null - The available status of the effect.
 * - text: string - The text of the effect.
 */
export function replaceSoulEffects(
    id: number,
    soulEffects: { trigger: string; available: string | null; text: string }[]
) {
    db.query(`DELETE FROM beast_soul_effects WHERE beast_id = ?`).run(id);

    if (!soulEffects || soulEffects.length === 0) return;

    for (const s of soulEffects) {
        db.query(`
            INSERT INTO beast_soul_effects (beast_id, trigger, available, text)
            VALUES (?, ?, ?, ?)
        `).run(id, s.trigger, s.available ?? null, s.text);
    }
}

/**
 * Replace the special ability of a beast with a new one.
 *
 * @param {number} id - The id of the beast to replace the special ability of.
 * @param {Object | null} special - The new special ability to insert into the beast.
 * If null, the existing special ability will be deleted.
 * The object should contain the following properties:
 * - name: string - The name of the special ability.
 * - text: string - The text of the special ability.
 */
export function replaceSpecial(
    id: number,
    special: { name: string; text: string } | null
) {
    db.query(`DELETE FROM beast_special WHERE beast_id = ?`).run(id);

    if (!special) return;

    if (!special.name || !special.text) return;

    if (special) {
        db.query(`
            INSERT INTO beast_special (beast_id, name, text)
            VALUES (?, ?, ?)
        `).run(id, special.name, special.text);
    }
}

