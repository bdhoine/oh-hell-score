import { GameType } from "./gametype.model";

export interface GameSettings {
    maxCards: number;
    cardsToPlay: GameType;
}