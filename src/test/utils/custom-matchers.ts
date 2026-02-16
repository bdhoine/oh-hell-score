import type { Round, PlayerBet } from '../../@types/state';

/**
 * Custom Jest matchers for domain-specific assertions
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidRoundStructure(): R;
      toBeValidPlayerName(): R;
      toHaveValidPlayerBet(): R;
    }
  }
}

expect.extend({
  toHaveValidRoundStructure(received: Round) {
    const pass =
      typeof received === 'object' &&
      typeof received.cards === 'number' &&
      received.cards > 0 &&
      typeof received.dealer === 'string' &&
      received.dealer.length > 0 &&
      Array.isArray(received.playerBets) &&
      received.playerBets.length > 0 &&
      received.playerBets.every((bet: PlayerBet) =>
        typeof bet.player === 'string' &&
        typeof bet.bid === 'number' &&
        typeof bet.trick === 'number' &&
        typeof bet.score === 'number' &&
        typeof bet.penalty === 'number'
      );

    return {
      pass,
      message: () =>
        pass
          ? `Expected round not to have valid structure`
          : `Expected round to have valid structure with cards, dealer, and playerBets array`,
    };
  },

  toBeValidPlayerName(received: string) {
    const trimmed = received.trim();
    const pass = typeof received === 'string' && trimmed.length > 0;

    return {
      pass,
      message: () =>
        pass
          ? `Expected "${received}" not to be a valid player name`
          : `Expected "${received}" to be a valid player name (non-empty string after trim)`,
    };
  },

  toHaveValidPlayerBet(received: PlayerBet) {
    const pass =
      typeof received === 'object' &&
      typeof received.player === 'string' &&
      received.player.length > 0 &&
      typeof received.bid === 'number' &&
      received.bid >= 0 &&
      typeof received.trick === 'number' &&
      received.trick >= 0 &&
      typeof received.score === 'number' &&
      typeof received.penalty === 'number';

    return {
      pass,
      message: () =>
        pass
          ? `Expected PlayerBet not to be valid`
          : `Expected PlayerBet to have valid structure with player, bid, trick, score, and penalty`,
    };
  },
});

export {};
