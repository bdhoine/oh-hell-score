export interface Round {
    cards: number;
    state: PlayerState[];
}

export interface PlayerState {
    player: string;
    bid: number;
    trick: number;
    score: number;
}
