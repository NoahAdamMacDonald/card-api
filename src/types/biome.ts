export interface BiomeRow {
    id: number;
    name: string;
    play_cost: number;
    color: string;
    bit_effect: string;
}

export interface BiomeEffectRow {
    id: number;
    text: string;
}

export interface BiomeTriggerRow {
    effect_id: number;
    trigger: string;
    available: string | null;
}

export interface BiomeTraitRow {
    trait: string;
}

export interface BiomeKeywordRow {
    keyword: string;
}
