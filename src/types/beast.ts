export interface BeastRow {
    id: number;
    name: string;
    play_cost: number;
    level: number;
    bts: number;
    evo_cost: number;
    evo_color: string;
}

export interface BeastEffectRow {
    id: number;
    text: string;
}

export interface BeastTriggerRow {
    effect_id: number;
    trigger: string;
}

export interface BeastSpecialRow {
    name: string;
    text: string;
}

export interface BeastSoulEffectRow {
    trigger: string;
    available: string | null;
    text: string;
}

export interface BeastTraitRow {
    trait: string;
}

export interface BeastRestrictionRow {
    restriction: string;
}

export interface BeastKeywordRow {
    keyword: string;
}
