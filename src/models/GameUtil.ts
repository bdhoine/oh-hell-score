import {Game, PlayerBet, Round} from "../@types/state";

export const isUnfinished = (game: Game) => {
    if (game.roundState.rounds.length === 0) {
        return false;
    }

    const tricksPerRound = game.roundState.rounds.map((round: Round) => {
        return {
            round,
            totalTrick: round.playerBets.reduce((accumulator, current: PlayerBet) => {
                return accumulator + current.trick
            }, 0)
        };
    })
    // Only unfinished if not every round does not match total cards BUT do not count as unfinished if all rounds were empty
    return !tricksPerRound.every(_ => _.totalTrick === _.round.cards) && !tricksPerRound.every(_ => _.totalTrick === 0);
}
