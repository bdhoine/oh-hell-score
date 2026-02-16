import { isUnfinished } from '../../models/GameUtil';
import { createMockGame, createMockRound } from '../../test/utils/mock-data';

describe('GameUtil', () => {
  describe('isUnfinished', () => {
    it('should return false if no rounds exist', () => {
      const game = createMockGame();
      game.roundState.rounds = [];

      expect(isUnfinished(game)).toBe(false);
    });

    it('should return true if some rounds have incorrect trick totals', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 2;
      round1.playerBets[1].trick = 0;
      // Total tricks = 2, but round has 3 cards
      game.roundState.rounds = [round1];

      expect(isUnfinished(game)).toBe(true);
    });

    it('should return false if all rounds match total cards', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 2;
      round1.playerBets[1].trick = 1;
      // Total tricks = 3, matches round cards
      const round2 = createMockRound(2, 'Bob', ['Alice', 'Bob']);
      round2.playerBets[0].trick = 1;
      round2.playerBets[1].trick = 1;
      // Total tricks = 2, matches round cards
      game.roundState.rounds = [round1, round2];

      expect(isUnfinished(game)).toBe(false);
    });

    it('should return false if all rounds have 0 tricks', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 0;
      round1.playerBets[1].trick = 0;
      const round2 = createMockRound(2, 'Bob', ['Alice', 'Bob']);
      round2.playerBets[0].trick = 0;
      round2.playerBets[1].trick = 0;
      game.roundState.rounds = [round1, round2];

      // All 0 means game hasn't started, not unfinished
      expect(isUnfinished(game)).toBe(false);
    });

    it('should return true if some rounds are complete and others are not', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 2;
      round1.playerBets[1].trick = 1;
      // Total tricks = 3, matches round cards (complete)
      const round2 = createMockRound(2, 'Bob', ['Alice', 'Bob']);
      round2.playerBets[0].trick = 0;
      round2.playerBets[1].trick = 0;
      // Total tricks = 0, doesn't match round cards (incomplete)
      game.roundState.rounds = [round1, round2];

      expect(isUnfinished(game)).toBe(true);
    });

    it('should return true if tricks exceed cards in round', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 3;
      round1.playerBets[1].trick = 2;
      // Total tricks = 5, exceeds round cards (3) - invalid state
      game.roundState.rounds = [round1];

      expect(isUnfinished(game)).toBe(true);
    });

    it('should handle single round with correct tricks', () => {
      const game = createMockGame();
      const round1 = createMockRound(5, 'Alice', ['Alice', 'Bob', 'Carol']);
      round1.playerBets[0].trick = 2;
      round1.playerBets[1].trick = 2;
      round1.playerBets[2].trick = 1;
      // Total tricks = 5, matches round cards
      game.roundState.rounds = [round1];

      expect(isUnfinished(game)).toBe(false);
    });

    it('should handle single round with incorrect tricks', () => {
      const game = createMockGame();
      const round1 = createMockRound(5, 'Alice', ['Alice', 'Bob', 'Carol']);
      round1.playerBets[0].trick = 1;
      round1.playerBets[1].trick = 1;
      round1.playerBets[2].trick = 1;
      // Total tricks = 3, doesn't match round cards (5)
      game.roundState.rounds = [round1];

      expect(isUnfinished(game)).toBe(true);
    });

    it('should handle multiple players with varying tricks', () => {
      const game = createMockGame();
      const round1 = createMockRound(7, 'Alice', ['Alice', 'Bob', 'Carol', 'Dave']);
      round1.playerBets[0].trick = 3;
      round1.playerBets[1].trick = 2;
      round1.playerBets[2].trick = 1;
      round1.playerBets[3].trick = 1;
      // Total tricks = 7, matches round cards
      game.roundState.rounds = [round1];

      expect(isUnfinished(game)).toBe(false);
    });

    it('should return true if first round empty but second has data', () => {
      const game = createMockGame();
      const round1 = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round1.playerBets[0].trick = 0;
      round1.playerBets[1].trick = 0;
      // First round not started
      const round2 = createMockRound(2, 'Bob', ['Alice', 'Bob']);
      round2.playerBets[0].trick = 1;
      round2.playerBets[1].trick = 1;
      // Second round complete (shouldn't happen in normal flow)
      game.roundState.rounds = [round1, round2];

      expect(isUnfinished(game)).toBe(true);
    });
  });
});
