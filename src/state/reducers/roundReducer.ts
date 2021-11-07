import {RoundReducer} from "../../@types/reducers";
import {GameAction, Round, RoundConfig, Rounds, Settings} from "../../@types/state";
import {GameType} from "../../models/GameType";

const roundReducer: RoundReducer = (state: Rounds, action: GameAction) => {
    const {type} = action;
    switch (type) {
        case 'GENERATE_ROUNDS': {
            return {
                ...state,
                rounds: generateRounds(action.settings, action.players, action.dealer)
            }
        }
        case 'NEXT_ROUND': {
            let rounds = [...state.rounds];
            updateScores(rounds, state.activeRound);
            return {
                ...state,
                activeRound: state.activeRound + 1,
                rounds,
            }
        }
        case 'CALCULATE_ROUND_SCORE': {
            let rounds = [...state.rounds];
            updateScores(rounds, state.activeRound);
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
            const rounds = [...state.rounds];
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
            const rounds = [...state.rounds];
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
        default:
            return state
    }
}

const updateScores = (rounds: Round[], roundIndex: number) => {
    const playerBets = rounds[roundIndex].playerBets;
    for (let playerBetIndex = 0; playerBetIndex < playerBets.length; playerBetIndex++) {
        let playerBet = playerBets[playerBetIndex];
        if (playerBet.bid === playerBet.trick) {
            playerBet.score = 10 + playerBet.trick;
        } else {
            playerBet.score = Math.abs(playerBet.bid - playerBet.trick) * -1;
        }
    }
}

const nextPlayer = (players: string[], dealer: string) => {
    let index = players.indexOf(dealer);
    if (index + 1 === players.length) {
        return players[0];
    }
    return players[index + 1];
}

const orderPlayers = (players: string[], dealer: string) => {
    let index = players.indexOf(dealer);
    if (index === players.length - 1) {
        return players;
    }
    let orderedPlayers = players.slice(index + 1);
    return orderedPlayers.concat(players.slice(0, index + 1));
}

const generateRound = (cards: number, players: string[], dealer: string): Round => {
    let round: Round = {
        cards,
        dealer,
        playerBets: []
    }

    let orderedPlayers = orderPlayers(players, dealer);

    orderedPlayers.forEach((player) => {

        round.playerBets.push({
            player: player,
            bid: 0,
            trick: 0,
            score: 0
        });
    });

    return round;
}

const getRoundConfiguration = (gameType: GameType): RoundConfig => {
    switch (gameType) {
        case GameType.EVEN:
            return {
                step: 2,
                start: 2,
            }
        case GameType.ODD:
            return {
                step: 2,
                start: 1,
            }
        default:
            return {
                step: 1,
                start: 1,
            }
    }
}

const generateRounds = (settings: Settings, players: string[], dealer: string): Round[] => {
    let upRounds: Round[] = [];
    let backRounds = [];

    for (let i = 0; settings.possibleCardsToPlay[i] <= settings.maxCards; i++) {
        upRounds.push(generateRound(settings.possibleCardsToPlay[i], players, dealer));
        dealer = nextPlayer(players, dealer);
    }

    for (let i = upRounds.length - 1; i >= 0; i--) {
        let round = upRounds[i];
        backRounds.push(generateRound(round.cards, players, dealer));
        dealer = nextPlayer(players, dealer);
    }
    return [...upRounds, ...backRounds];
}


export default roundReducer;
