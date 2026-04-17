import {
    validatePositiveNumber,
    validateEffectsArray,
    validateStringArray
} from "../../util/validation";

import {
    replaceEffects,
    replaceList,
    replaceKeywords
} from "../../util/dbHelpers";

export const biomePutConfig = {
    table: "biomes",
    notFoundMessage: "Biome not found",
    successMessage: "Successfully replaced Biome",

    required: ["name", "playCost", "color", "bitEffect"],

    replace: {
        sql: `
            UPDATE biomes
            SET name = ?, play_cost = ?, color = ?, bit_effect = ?
            WHERE id = ?
        `,
        params: (s: any) => [s.name, s.playCost, s.color, s.bitEffect]
    },

    validate(s: any, errors: any[]) {
        const base = validatePositiveNumber("playCost", s.playCost);
        if (base) errors.push(base);
    },

    validateNested(s: any, errors: any[]) {
        const eff = validateEffectsArray(s.effects);
        if (eff) errors.push(eff);

        const t = validateStringArray("traits", s.traits);
        if (t) errors.push(t);

        const k = validateStringArray("keywords", s.keywords);
        if (k) errors.push(k);
    },

    nested: [
        {
            field: "effects",
            handler: (id: number, v: any) => replaceEffects("biome", id, v)
        },
        {
            field: "traits",
            handler: (id: number, v: any) =>
                replaceList("biome_traits", "biome_id", id, v, "trait")
        },
        {
            field: "keywords",
            handler: (id: number, v: any) =>
                replaceKeywords("biome_keywords", "biome_id", id, v)
        }
    ]
};
    