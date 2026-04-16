export interface RelicRow {
    id: number;
    name: string;
    play_cost: number;
    color: string;
    bit_effect: string;
}

export interface RelicEffectRow {
    id: number;
    text: string;
}

export interface RelicTriggerRow {
    effect_id: number;
    trigger: string;
    available: string | null;
}

export interface RelicKeywordRow {
    keyword: string;
}
