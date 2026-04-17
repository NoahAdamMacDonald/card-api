import {
    validatePositiveNumber,
    validateEffectsArray,
    validateStringArray
} from "../../util/validation";

import {
    replaceEffects,
    replaceKeywords
} from "../../util/dbHelpers";

export const relicPutConfig = {
    table: "relics",
    notFoundMessage: "Relic not found",
    successMessage: "Successfully replaced Relic",

    required: ["name", "playCost", "color", "bitEffect"],

    replace: {
        sql: `
            UPDATE relics
            SET name = ?, play_cost = ?, color = ?, bit_effect = ?
            WHERE id = ?
        `,
        params: (s: any) => [
            s.name,
            s.playCost,
            s.color,
            s.bitEffect
        ]
    },

    validate(s: any, errors: any[]) {
        const pc = validatePositiveNumber("playCost", s.playCost);
        if (pc) errors.push(pc);
    },

    validateNested(s: any, errors: any[]) {
        const eff = validateEffectsArray(s.effects);
        if (eff) errors.push(eff);

        const keywords = validateStringArray("keywords", s.keywords);
        if (keywords) errors.push(keywords);
    },

    nested: [
        {
            field: "effects",
            handler: (id: number, v: any) => replaceEffects("relic", id, v)
        },
        {
            field: "keywords",
            handler: (id: number, v: any) =>
                replaceKeywords("relic_keywords", "relic_id", id, v)
        }
    ]
};
