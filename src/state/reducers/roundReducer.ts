import type {RoundReducer} from "../../@types/reducers";
import type {GameAction, Round, Rounds, Settings} from "../../@types/state";

const clone = (obj: unknown) => {
  return JSON.parse(JSON.stringify(obj));
}

const roundReducer: RoundReducer = (state: Rounds, action: GameAction) => {
  const {type} = action;
  switch (type) {
    case 'GENERATE_ROUNDS': {
      return {
        ...state,
        rounds: generateRounds(action.settings, action.players, action.dealer),
        bonus: action.settings.bonus,
        penaltyPerTrick: action.settings.penaltyPerTrick,
      }
    }
    case 'NEXT_ROUND': {
      const rounds: Round[] = clone(state.rounds);
      updateScores(rounds, state.activeRound, state.bonus, state.penaltyPerTrick);
      return {
        ...state,
        activeRound: state.activeRound + 1,
        rounds,
      }
    }
    case 'CALCULATE_ROUND_SCORE': {
      const rounds: Round[] = clone(state.rounds);
      updateScores(rounds, state.activeRound, state.bonus, state.penaltyPerTrick);
      return {
        ...state,
        rounds,
      }
    }
    case 'PREVIOUS_ROUND': {
      return {
        ...state,
        activeRound: state.activeRound - 1,
      }
    }
    case 'SET_ROUND': {
      return {
        ...state,
        activeRound: action.round,
      }
    }
    case 'SET_GAME': {
      if (action.game) {
        return action.game.roundState;
      }
      return state;
    }
    case 'SET_BID': {
      const rounds: Round[] = clone(state.rounds);
      const activeRound = rounds[state.activeRound];
      const playerBet = activeRound.playerBets.find(bet => bet.player === action.player);
      if (playerBet) {
        playerBet.bid = action.amount;
        playerBet.trick = action.amount;
      }

      return {
        ...state,
        rounds,
      }
    }
    case 'SET_TRICK': {
      const rounds: Round[] = clone(state.rounds);
      const activeRound = rounds[state.activeRound];
      const playerBet = activeRound.playerBets.find(bet => bet.player === action.player);
      if (playerBet) {
        playerBet.trick = action.amount;
      }

      return {
        ...state,
        rounds,
      }
    }
    case 'REMOVE_PLAYER': {
      const rounds: Round[] = clone(state.rounds);
      for (const round of rounds) {
        round.playerBets = round.playerBets.filter(bet => bet.player !== action.name);
      }
      return {
        ...state,
        rounds,
      }
    }
    case 'SET_PENALTY': {
      const rounds: Round[] = clone(state.rounds);
      const activeRound = rounds[state.activeRound];
      const playerBet = activeRound.playerBets.find(bet => bet.player === action.player);
      if (playerBet) {
        playerBet.penalty = playerBet.penalty - action.amount;
      }

      return {
        ...state,
        rounds,
      }
    }
    default:
      return state
  }
  
}

const updateScores = (rounds: Round[], roundIndex: number, bonus: number, penaltyPerTrick: number) => {
  const playerBets = rounds[roundIndex].playerBets;
  for (const playerBet of playerBets) {
    if (playerBet.bid === playerBet.trick) {
      playerBet.score = bonus + playerBet.trick;
    } else {
      playerBet.score = Math.abs(playerBet.bid - playerBet.trick) * -penaltyPerTrick;
    }
  }
}

const nextPlayer = (players: string[], dealer: string) => {
  const index = players.indexOf(dealer);
  if (index + 1 === players.length) {
    return players[0];
  }
  return players[index + 1];
}

const orderPlayers = (players: string[], dealer: string) => {
  const index = players.indexOf(dealer);
  if (index === players.length - 1) {
    return players;
  }
  const orderedPlayers = players.slice(index + 1);
  return orderedPlayers.concat(players.slice(0, index + 1));
}

const generateRound = (cards: number, players: string[], dealer: string): Round => {
  const round: Round = {
    cards,
    dealer,
    playerBets: []
  }

  const orderedPlayers = orderPlayers(players, dealer);

  orderedPlayers.forEach((player) => {

    round.playerBets.push({
      player: player,
      bid: 0,
      trick: 0,
      score: 0,
      penalty: 0
    });
  });

  return round;
}
const generateRounds = (settings: Settings, players: string[], dealer: string): Round[] => {
  const upRounds: Round[] = [];
  const backRounds = [];

  for (let i = 0; settings.possibleCardsToPlay[i] <= settings.maxCards; i++) {
    upRounds.push(generateRound(settings.possibleCardsToPlay[i], players, dealer));
    dealer = nextPlayer(players, dealer);
  }

  for (let i = upRounds.length - 1; i >= 0; i--) {
    const round = upRounds[i];
    backRounds.push(generateRound(round.cards, players, dealer));
    dealer = nextPlayer(players, dealer);
  }
  return [...upRounds, ...backRounds];
}


export default roundReducer;
