import type { Rounds, RoundAction } from '../../../@types/state';
import { GameType } from '../../../models/GameType';
import roundReducer from '../../../state/reducers/roundReducer';
import { createMockSettings, createMockRounds, createMockRound, createMockGame } from '../../../test/utils/mock-data';

describe('roundReducer', () => {
  const initialState: Rounds = {
    activeRound: 0,
    rounds: [],
    bonus: 10,
    penaltyPerTrick: 1,
  };

  describe('GENERATE_ROUNDS', () => {
    it('should generate up and down rounds for ALL game type', () => {
      const players = ['Alice', 'Bob'];
      const settings = createMockSettings({ maxCards: 3, gameType: GameType.ALL });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Alice',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      // Should have [1,2,3,3,2,1] = 6 rounds
      expect(result.rounds).toHaveLength(6);
      expect(result.rounds[0].cards).toBe(1);
      expect(result.rounds[1].cards).toBe(2);
      expect(result.rounds[2].cards).toBe(3);
      expect(result.rounds[3].cards).toBe(3);
      expect(result.rounds[4].cards).toBe(2);
      expect(result.rounds[5].cards).toBe(1);
      expect(result.bonus).toBe(settings.bonus);
      expect(result.penaltyPerTrick).toBe(settings.penaltyPerTrick);
    });

    it('should generate only odd rounds for ODD game type', () => {
      const players = ['Alice', 'Bob'];
      const settings = createMockSettings({
        maxCards: 5,
        gameType: GameType.ODD,
        possibleCardsToPlay: [1, 3, 5],
      });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Alice',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      // Should have [1,3,5,5,3,1] = 6 rounds
      expect(result.rounds).toHaveLength(6);
      expect(result.rounds[0].cards).toBe(1);
      expect(result.rounds[1].cards).toBe(3);
      expect(result.rounds[2].cards).toBe(5);
      expect(result.rounds[3].cards).toBe(5);
      expect(result.rounds[4].cards).toBe(3);
      expect(result.rounds[5].cards).toBe(1);
    });

    it('should generate only even rounds for EVEN game type', () => {
      const players = ['Alice', 'Bob'];
      const settings = createMockSettings({
        maxCards: 6,
        gameType: GameType.EVEN,
        possibleCardsToPlay: [2, 4, 6],
      });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Alice',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      // Should have [2,4,6,6,4,2] = 6 rounds
      expect(result.rounds).toHaveLength(6);
      expect(result.rounds[0].cards).toBe(2);
      expect(result.rounds[1].cards).toBe(4);
      expect(result.rounds[2].cards).toBe(6);
      expect(result.rounds[3].cards).toBe(6);
      expect(result.rounds[4].cards).toBe(4);
      expect(result.rounds[5].cards).toBe(2);
    });

    it('should rotate dealer correctly across rounds', () => {
      const players = ['Alice', 'Bob', 'Carol'];
      const settings = createMockSettings({ maxCards: 2, gameType: GameType.ALL });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Alice',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      // Should have [1,2,2,1] = 4 rounds
      // Dealer rotation: Alice, Bob, Carol, Alice
      expect(result.rounds).toHaveLength(4);
      expect(result.rounds[0].dealer).toBe('Alice');
      expect(result.rounds[1].dealer).toBe('Bob');
      expect(result.rounds[2].dealer).toBe('Carol');
      expect(result.rounds[3].dealer).toBe('Alice');
    });

    it('should order players with dealer last', () => {
      const players = ['Alice', 'Bob', 'Carol'];
      const settings = createMockSettings({ maxCards: 1, gameType: GameType.ALL });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Bob',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      // First round dealer is Bob, so order should be: Carol, Alice, Bob
      const round1Players = result.rounds[0].playerBets.map(b => b.player);
      expect(round1Players).toEqual(['Carol', 'Alice', 'Bob']);
    });

    it('should create PlayerBet for each player with initial values', () => {
      const players = ['Alice', 'Bob'];
      const settings = createMockSettings({ maxCards: 1, gameType: GameType.ALL });
      const action: RoundAction = {
        type: 'GENERATE_ROUNDS',
        dealer: 'Alice',
        players,
        settings,
      };

      const result = roundReducer(initialState, action);

      result.rounds[0].playerBets.forEach(bet => {
        expect(bet).toHaveValidPlayerBet();
        expect(bet.bid).toBe(0);
        expect(bet.trick).toBe(0);
        expect(bet.score).toBe(0);
        expect(bet.penalty).toBe(0);
      });
    });
  });

  describe('SET_BID', () => {
    it('should set bid and trick for player', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_BID',
        player: 'Alice',
        amount: 3,
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.bid).toBe(3);
      expect(aliceBet?.trick).toBe(3); // Trick is also set to bid initially
    });

    it('should not mutate original state', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_BID',
        player: 'Alice',
        amount: 3,
      };

      roundReducer(state, action);

      expect(state.rounds[0].playerBets[0].bid).toBe(0);
    });

    it('should only update the specified player', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_BID',
        player: 'Alice',
        amount: 3,
      };

      const result = roundReducer(state, action);

      const bobBet = result.rounds[0].playerBets.find(b => b.player === 'Bob');
      expect(bobBet?.bid).toBe(0);
      expect(bobBet?.trick).toBe(0);
    });
  });

  describe('SET_TRICK', () => {
    it('should update trick count for player', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 2;
      round.playerBets[0].trick = 2;
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_TRICK',
        player: 'Alice',
        amount: 3,
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.trick).toBe(3);
      expect(aliceBet?.bid).toBe(2); // Bid should not change
    });

    it('should not mutate original state', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_TRICK',
        player: 'Alice',
        amount: 3,
      };

      roundReducer(state, action);

      expect(state.rounds[0].playerBets[0].trick).toBe(0);
    });
  });

  describe('SET_PENALTY', () => {
    it('should decrement penalty by amount', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].penalty = 0;
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_PENALTY',
        player: 'Alice',
        amount: 5,
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.penalty).toBe(-5);
    });

    it('should accumulate multiple penalties', () => {
      const round = createMockRound(1, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].penalty = -5;
      const state = createMockRounds([round]);
      const action: RoundAction = {
        type: 'SET_PENALTY',
        player: 'Alice',
        amount: 3,
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.penalty).toBe(-8);
    });
  });

  describe('CALCULATE_ROUND_SCORE', () => {
    it('should award bonus + tricks when bid matches', () => {
      const round = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 3;
      round.playerBets[0].trick = 3;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 1 });
      const action: RoundAction = {
        type: 'CALCULATE_ROUND_SCORE',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.score).toBe(13); // 10 bonus + 3 tricks
    });

    it('should award bonus when bid is 0 and trick is 0', () => {
      const round = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 0;
      round.playerBets[0].trick = 0;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 1 });
      const action: RoundAction = {
        type: 'CALCULATE_ROUND_SCORE',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.score).toBe(10); // 10 bonus + 0 tricks
    });

    it('should apply penalty when bid is higher than tricks', () => {
      const round = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 3;
      round.playerBets[0].trick = 1;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 2 });
      const action: RoundAction = {
        type: 'CALCULATE_ROUND_SCORE',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.score).toBe(-4); // -(|3 - 1| * 2) = -4
    });

    it('should apply penalty when bid is lower than tricks', () => {
      const round = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 1;
      round.playerBets[0].trick = 3;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 2 });
      const action: RoundAction = {
        type: 'CALCULATE_ROUND_SCORE',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.score).toBe(-4); // -(|1 - 3| * 2) = -4
    });

    it('should calculate scores for all players independently', () => {
      const round = createMockRound(3, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 2;
      round.playerBets[0].trick = 2;
      round.playerBets[1].bid = 1;
      round.playerBets[1].trick = 3;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 1 });
      const action: RoundAction = {
        type: 'CALCULATE_ROUND_SCORE',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      const bobBet = result.rounds[0].playerBets.find(b => b.player === 'Bob');
      expect(aliceBet?.score).toBe(12); // 10 + 2
      expect(bobBet?.score).toBe(-2); // -(|1 - 3| * 1)
    });
  });

  describe('NEXT_ROUND', () => {
    it('should increment activeRound', () => {
      const state = createMockRounds(
        [
          createMockRound(1, 'Alice', ['Alice', 'Bob']),
          createMockRound(2, 'Bob', ['Alice', 'Bob']),
        ],
        { activeRound: 0 }
      );
      const action: RoundAction = {
        type: 'NEXT_ROUND',
      };

      const result = roundReducer(state, action);

      expect(result.activeRound).toBe(1);
    });

    it('should calculate scores for current round before moving', () => {
      const round = createMockRound(2, 'Alice', ['Alice', 'Bob']);
      round.playerBets[0].bid = 2;
      round.playerBets[0].trick = 2;
      const state = createMockRounds([round], { bonus: 10, penaltyPerTrick: 1, activeRound: 0 });
      const action: RoundAction = {
        type: 'NEXT_ROUND',
      };

      const result = roundReducer(state, action);

      const aliceBet = result.rounds[0].playerBets.find(b => b.player === 'Alice');
      expect(aliceBet?.score).toBe(12); // 10 + 2
      expect(result.activeRound).toBe(1);
    });
  });

  describe('PREVIOUS_ROUND', () => {
    it('should decrement activeRound', () => {
      const state = createMockRounds(
        [
          createMockRound(1, 'Alice', ['Alice', 'Bob']),
          createMockRound(2, 'Bob', ['Alice', 'Bob']),
        ],
        { activeRound: 1 }
      );
      const action: RoundAction = {
        type: 'PREVIOUS_ROUND',
        round: 0,
      };

      const result = roundReducer(state, action);

      expect(result.activeRound).toBe(0);
    });
  });

  describe('SET_ROUND', () => {
    it('should set activeRound to specified value', () => {
      const state = createMockRounds(
        [
          createMockRound(1, 'Alice', ['Alice', 'Bob']),
          createMockRound(2, 'Bob', ['Alice', 'Bob']),
          createMockRound(3, 'Alice', ['Alice', 'Bob']),
        ],
        { activeRound: 0 }
      );
      const action: RoundAction = {
        type: 'SET_ROUND',
        round: 2,
      };

      const result = roundReducer(state, action);

      expect(result.activeRound).toBe(2);
    });
  });

  describe('REMOVE_PLAYER', () => {
    it('should remove player from all rounds', () => {
      const state = createMockRounds([
        createMockRound(1, 'Alice', ['Alice', 'Bob', 'Carol']),
        createMockRound(2, 'Bob', ['Alice', 'Bob', 'Carol']),
      ]);
      const action: RoundAction = {
        type: 'REMOVE_PLAYER',
        name: 'Bob',
      };

      const result = roundReducer(state, action);

      result.rounds.forEach(round => {
        expect(round.playerBets).toHaveLength(2);
        expect(round.playerBets.find(b => b.player === 'Bob')).toBeUndefined();
        expect(round.playerBets.find(b => b.player === 'Alice')).toBeDefined();
        expect(round.playerBets.find(b => b.player === 'Carol')).toBeDefined();
      });
    });

    it('should not mutate original state', () => {
      const state = createMockRounds([
        createMockRound(1, 'Alice', ['Alice', 'Bob', 'Carol']),
      ]);
      const action: RoundAction = {
        type: 'REMOVE_PLAYER',
        name: 'Bob',
      };

      roundReducer(state, action);

      expect(state.rounds[0].playerBets).toHaveLength(3);
    });
  });

  describe('SET_GAME', () => {
    it('should restore roundState from game', () => {
      const game = createMockGame({
        roundState: createMockRounds(
          [createMockRound(3, 'Alice', ['Alice', 'Bob'])],
          { activeRound: 0, bonus: 15, penaltyPerTrick: 2 }
        ),
      });
      const action: any = {
        type: 'SET_GAME',
        game,
      };

      const result = roundReducer(initialState, action);

      expect(result.activeRound).toBe(0);
      expect(result.rounds).toHaveLength(1);
      expect(result.bonus).toBe(15);
      expect(result.penaltyPerTrick).toBe(2);
    });

    it('should return state if game is undefined', () => {
      const action: any = {
        type: 'SET_GAME',
        game: undefined,
      };

      const result = roundReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('default case', () => {
    it('should return state for unknown action', () => {
      const state = createMockRounds([]);
      const action: any = {
        type: 'UNKNOWN_ACTION',
      };

      const result = roundReducer(state, action);

      expect(result).toBe(state);
    });
  });
});
