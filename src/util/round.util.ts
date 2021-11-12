import type {Game, PlayerScore, Round} from "../@types/state";

export const calculatePlayerScore = (rounds: Round[], player: string, maxRoundIndex?: number): number => {
  if (!maxRoundIndex && maxRoundIndex !== 0) {
    maxRoundIndex = rounds.length - 1;
  }
  const limitedRounds = maxRoundIndex < 0 ? [] : rounds.slice(0, maxRoundIndex + 1);

  return limitedRounds.reduce((accumulator, current: Round) => {
    const playerBet = current.playerBets.find(bet => bet.player === player);
    return accumulator + (playerBet?.score ?? 0);
  }, 0);
}

export const calculateFinalScore = (game: Game): PlayerScore[] => {
  return game.playerState.players
    .map(player => {
      return {
        player,
        score: calculatePlayerScore(game.roundState.rounds, player)
      }
    })
    .sort((playerA: PlayerScore, playerB: PlayerScore) => playerB.score - playerA.score);
}
