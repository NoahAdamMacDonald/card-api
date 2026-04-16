export interface ProgramRow {
    id: number;
    name: string;
    play_cost: number;
    color: string;
    bit_effect: string;
}

export interface ProgramEffectRow {
    id: number;
    text: string;
}

export interface ProgramTriggerRow {
    effect_id: number;
    trigger: string;
    available: string | null;
}

export interface ProgramTraitRow {
    trait: string;
}

export interface ProgramKeywordRow {
    keyword: string;
}
