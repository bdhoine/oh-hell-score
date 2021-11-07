import { SettingsReducer } from "../../@types/reducers";
import { CardsConfiguration, GameAction, Settings } from "../../@types/state";
import { GameType } from "../../models/GameType";

const settingsReducer: SettingsReducer = (state: Settings, action: GameAction) => {
    const { type } = action;
    switch (type) {
        case 'SET_MAX_CARDS':
            return {
                ...state,
                maxCards: action.maxCards,
            }
        case 'UPDATE_MAX_CARDS':
            const cardsConfig: CardsConfiguration = getCardsConfiguration(action.totalPlayers, state.maxCards, state.gameType)
            return {
                ...state,
                maxCards: cardsConfig.maxCards,
                possibleCardsToPlay: cardsConfig.possibleCardsToPlay
            }
        case 'UPDATE_GAME_TYPE':
            return {
                ...state,
                gameType: action.gameType
            }
        case 'SET_GAME':
            if (action.game) {
                return action.game.settings;
            }
            return state
        default:
            return state
    }
}

const isOdd = (value: number) => value % 2 === 1;

const isValidCardsAmount = (amountOfCards: number, gameType: GameType) => {
    return (gameType === GameType.ODD && isOdd(amountOfCards))
        || ((gameType === GameType.EVEN && !isOdd(amountOfCards)) || gameType === GameType.ALL)
}

const roundCardsToPlay = (maxCards: number, gameType: GameType) => {
    if (!isValidCardsAmount(maxCards, gameType)) {
        maxCards--;
    }
    return maxCards;
}

const getClosestMaxCards = (currentCardsAmount: number, maxCardsToPlay: number[], gameType: GameType) => {
    let closest = currentCardsAmount;
    if (closest > maxCardsToPlay[maxCardsToPlay.length - 1]) {
        closest = maxCardsToPlay[maxCardsToPlay.length - 1];
    } else if (!isValidCardsAmount(currentCardsAmount, gameType)) {
        if (currentCardsAmount + 1 <= maxCardsToPlay[maxCardsToPlay.length - 1]) {
            closest++;
        } else {
            closest--;
        }
    }
    return closest;
}

const generateCards = (amount: number): number[] => {
    return Array(amount - 1).fill(0).map((x, i) => i + 2)
}

const getCardsConfiguration = (totalPlayers: number, currentMaxCards: number, gameType: GameType): CardsConfiguration => {
    let maxCards = totalPlayers > 0 ? Math.floor(52 / totalPlayers) : 52;
    maxCards = roundCardsToPlay(maxCards, gameType);
    let cards = [];
    if (gameType === GameType.ODD) {
        cards = generateCards(maxCards).filter((num) => isOdd(num))
    } else if (gameType === GameType.EVEN) {
        cards = generateCards(maxCards - 1).filter((num) => !isOdd(num))
    } else {
        cards = Array(maxCards).fill(0).map((x, i) => i + 1);
    }
    return {
        maxCards: getClosestMaxCards(currentMaxCards, cards, gameType),
        possibleCardsToPlay: cards
    }
}

export default settingsReducer;
