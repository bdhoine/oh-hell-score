import type {GameType} from "../models/GameType"

type Round = {
  cards: number;
  dealer: string;
  playerBets: PlayerBet[];
}

type RoundConfig = {
  start: number;
  step: number;
}

type PlayerBet = {
  bid: number;
  trick: number;
  player: string;
  score: number;
}

type BidTrickData = {
  amount: number;
  player: string;
}

type TrickAction = {
  type: 'SET_TRICK'
} & BidTrickData

type BidAction = {
  type: 'SET_BID'
} & BidTrickData

type Settings = {
  gameType: GameType;
  maxCards: number;
  possibleCardsToPlay: number[]
}

type RoundAction =
  { type: 'START_ROUND' } |
  { type: 'GENERATE_ROUNDS', dealer: string, players: string[], settings: Settings } |
  { type: 'SET_ROUND', round: number } |
  { type: 'NEXT_ROUND' } |
  { type: 'PREVIOUS_ROUND', round: number } |
  { type: 'CALCULATE_ROUND_SCORE' } |
  BidAction |
  TrickAction

type SetGameAction = { type: 'SET_GAME', game: Game }
type PlayerAction = { type: 'ADD_PLAYER', name: string } |
  { type: 'REMOVE_PLAYER', name: string } |
  { type: 'REORDER_PLAYER', to: number, from: number } |
  { type: 'RENAME_PLAYER', location: number, name: string } |
  SetGameAction

type SettingsAction =
  { type: 'SET_CARDS', max: number }
  | { type: 'UPDATE_MAX_CARDS', totalPlayers: number }
  | { type: 'UPDATE_GAME_TYPE', gameType: GameType }
  | { type: 'SET_MAX_CARDS', maxCards: number }

type GameAction = PlayerAction | RoundAction | SettingsAction | SetGameAction;

type CardsConfiguration = {
  maxCards: number,
  possibleCardsToPlay: number[]
}

type PlayerState = {
  players: string[]
}

type Rounds = {
  activeRound: number
  rounds: Round[]
}

type Game = {
  playerState: PlayerState,
  roundState: Rounds
  settings: Settings;
}

type GameContext = {
  game: Game, dispatch: Dispatch<GameAction>
}

type PlayerScore = {
  player: string;
  score: number;
}
