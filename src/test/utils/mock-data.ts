import type { Game, Round, Settings, PlayerBet, PlayerState, Rounds } from '../../@types/state';
import { GameType } from '../../models/GameType';

/**
 * Factory functions for creating consistent test data
 */

export const createMockPlayerBet = (
  player: string,
  overrides?: Partial<PlayerBet>
): PlayerBet => ({
  player,
  bid: 0,
  trick: 0,
  score: 0,
  penalty: 0,
  ...overrides,
});

export const createMockRound = (
  cards: number,
  dealer: string,
  players: string[],
  overrides?: Partial<Round>
): Round => ({
  cards,
  dealer,
  playerBets: players.map((player) => createMockPlayerBet(player)),
  ...overrides,
});

export const createMockSettings = (
  overrides?: Partial<Settings>
): Settings => ({
  maxCards: 7,
  gameType: GameType.ALL,
  possibleCardsToPlay: Array(7).fill(0).map((_, i) => i + 1),
  bonus: 10,
  penaltyPerTrick: 1,
  ...overrides,
});

export const createMockPlayerState = (
  players: string[] = ['Alice', 'Bob', 'Carol'],
  overrides?: Partial<PlayerState>
): PlayerState => ({
  players,
  ...overrides,
});

export const createMockRounds = (
  rounds: Round[] = [],
  overrides?: Partial<Rounds>
): Rounds => ({
  activeRound: 0,
  rounds,
  bonus: 10,
  penaltyPerTrick: 1,
  ...overrides,
});

export const createMockGame = (
  overrides?: Partial<Game>
): Game => ({
  playerState: createMockPlayerState(),
  roundState: createMockRounds(),
  settings: createMockSettings(),
  ...overrides,
});

/**
 * Creates a complete game with rounds generated
 */
export const createMockGameWithRounds = (
  players: string[] = ['Alice', 'Bob', 'Carol'],
  maxCards: number = 3,
  gameType: GameType = GameType.ALL
): Game => {
  const settings = createMockSettings({ maxCards, gameType });
  const rounds: Round[] = [];

  // Generate rounds based on game type
  let cardSequence: number[] = [];
  if (gameType === GameType.ALL) {
    cardSequence = Array.from({ length: maxCards }, (_, i) => i + 1);
  } else if (gameType === GameType.ODD) {
    cardSequence = Array.from({ length: maxCards }, (_, i) => i + 1).filter(n => n % 2 === 1);
  } else if (gameType === GameType.EVEN) {
    cardSequence = Array.from({ length: maxCards }, (_, i) => i + 1).filter(n => n % 2 === 0);
  }

  // Up rounds
  cardSequence.forEach((cards, i) => {
    const dealerIndex = i % players.length;
    rounds.push(createMockRound(cards, players[dealerIndex], players));
  });

  // Down rounds (reverse)
  [...cardSequence].reverse().forEach((cards, i) => {
    const dealerIndex = (cardSequence.length + i) % players.length;
    rounds.push(createMockRound(cards, players[dealerIndex], players));
  });

  return createMockGame({
    playerState: createMockPlayerState(players),
    roundState: createMockRounds(rounds),
    settings,
  });
};
