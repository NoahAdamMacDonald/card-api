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

export const programPutConfig = {
    table: "programs",
    notFoundMessage: "Program not found",
    successMessage: "Successfully replaced Program",

    required: ["name", "playCost", "color", "bitEffect"],

    replace: {
        sql: `
            UPDATE programs
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

        const traits = validateStringArray("traits", s.traits);
        if (traits) errors.push(traits);

        const keywords = validateStringArray("keywords", s.keywords);
        if (keywords) errors.push(keywords);
    },

    nested: [
        {
            field: "effects",
            handler: (id: number, v: any) => replaceEffects("program", id, v)
        },
        {
            field: "traits",
            handler: (id: number, v: any) =>
                replaceList("program_traits", "program_id", id, v, "trait")
        },
        {
            field: "keywords",
            handler: (id: number, v: any) =>
                replaceKeywords("program_keywords", "program_id", id, v)
        }
    ]
};
