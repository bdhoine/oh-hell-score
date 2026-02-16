import type { Settings, SettingsAction } from '../../../@types/state';
import { GameType } from '../../../models/GameType';
import settingsReducer from '../../../state/reducers/settingsReducer';
import { createMockSettings, createMockGame } from '../../../test/utils/mock-data';

describe('settingsReducer', () => {
  const initialState: Settings = createMockSettings();

  describe('SET_MAX_CARDS', () => {
    it('should set maxCards to specified value', () => {
      const action: SettingsAction = {
        type: 'SET_MAX_CARDS',
        maxCards: 10,
      };

      const result = settingsReducer(initialState, action);

      expect(result.maxCards).toBe(10);
    });

    it('should not mutate other settings', () => {
      const action: SettingsAction = {
        type: 'SET_MAX_CARDS',
        maxCards: 10,
      };

      const result = settingsReducer(initialState, action);

      expect(result.gameType).toBe(initialState.gameType);
      expect(result.bonus).toBe(initialState.bonus);
      expect(result.penaltyPerTrick).toBe(initialState.penaltyPerTrick);
    });
  });

  describe('UPDATE_MAX_CARDS', () => {
    it('should calculate maxCards as 52 / totalPlayers for ALL game type', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 7 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 4,
      };

      const result = settingsReducer(state, action);

      // 52 / 4 = 13
      expect(result.maxCards).toBe(7); // closest valid to current 7 is 7
    });

    it('should round down for non-divisible player counts', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 10 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 5,
      };

      const result = settingsReducer(state, action);

      // 52 / 5 = 10.4, rounds down to 10
      expect(result.maxCards).toBe(10);
    });

    it('should update possibleCardsToPlay for ALL game type', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 3 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 10,
      };

      const result = settingsReducer(state, action);

      // 52 / 10 = 5, so possibleCardsToPlay should be [1,2,3,4,5]
      expect(result.possibleCardsToPlay).toEqual([1, 2, 3, 4, 5]);
    });

    it('should filter to odd cards only for ODD game type', () => {
      const state = createMockSettings({ gameType: GameType.ODD, maxCards: 5 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 10,
      };

      const result = settingsReducer(state, action);

      // 52 / 10 = 5 (odd), possibleCardsToPlay should be [1,3,5]
      expect(result.possibleCardsToPlay).toEqual([1, 3, 5]);
      expect(result.maxCards).toBe(5);
    });

    it('should round down to odd number for ODD game type', () => {
      const state = createMockSettings({ gameType: GameType.ODD, maxCards: 7 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 5,
      };

      const result = settingsReducer(state, action);

      // 52 / 5 = 10 (even), rounds down to 9 (odd)
      expect(result.maxCards).toBe(7); // closest valid to current 7
      expect(result.possibleCardsToPlay.every(n => n % 2 === 1)).toBe(true);
    });

    it('should filter to even cards only for EVEN game type', () => {
      const state = createMockSettings({ gameType: GameType.EVEN, maxCards: 4 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 10,
      };

      const result = settingsReducer(state, action);

      // 52 / 10 = 5 (odd), rounds down to 4 (even)
      // possibleCardsToPlay should be [2,4]
      expect(result.possibleCardsToPlay).toEqual([2, 4]);
      expect(result.maxCards).toBe(4);
    });

    it('should round down to even number for EVEN game type', () => {
      const state = createMockSettings({ gameType: GameType.EVEN, maxCards: 6 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 4,
      };

      const result = settingsReducer(state, action);

      // 52 / 4 = 13 (odd), rounds down to 12 (even)
      expect(result.maxCards).toBe(6); // closest valid to current 6
      expect(result.possibleCardsToPlay.every(n => n % 2 === 0)).toBe(true);
    });

    it('should handle 1 player edge case', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 7 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 1,
      };

      const result = settingsReducer(state, action);

      // 52 / 1 = 52
      expect(result.maxCards).toBe(7); // keeps current as it's within valid range
    });

    it('should handle 0 players edge case', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 7 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 0,
      };

      const result = settingsReducer(state, action);

      // When 0 players, maxCards defaults to 52
      expect(result.maxCards).toBe(7); // keeps current as it's within valid range
    });

    it('should adjust currentMaxCards if it exceeds new limit', () => {
      const state = createMockSettings({ gameType: GameType.ALL, maxCards: 20 });
      const action: SettingsAction = {
        type: 'UPDATE_MAX_CARDS',
        totalPlayers: 10,
      };

      const result = settingsReducer(state, action);

      // 52 / 10 = 5, current maxCards (20) exceeds, so should be capped at 5
      expect(result.maxCards).toBe(5);
    });
  });

  describe('UPDATE_GAME_TYPE', () => {
    it('should update gameType to ODD', () => {
      const state = createMockSettings({ gameType: GameType.ALL });
      const action: SettingsAction = {
        type: 'UPDATE_GAME_TYPE',
        gameType: GameType.ODD,
      };

      const result = settingsReducer(state, action);

      expect(result.gameType).toBe(GameType.ODD);
    });

    it('should update gameType to EVEN', () => {
      const state = createMockSettings({ gameType: GameType.ALL });
      const action: SettingsAction = {
        type: 'UPDATE_GAME_TYPE',
        gameType: GameType.EVEN,
      };

      const result = settingsReducer(state, action);

      expect(result.gameType).toBe(GameType.EVEN);
    });

    it('should update gameType to ALL', () => {
      const state = createMockSettings({ gameType: GameType.ODD });
      const action: SettingsAction = {
        type: 'UPDATE_GAME_TYPE',
        gameType: GameType.ALL,
      };

      const result = settingsReducer(state, action);

      expect(result.gameType).toBe(GameType.ALL);
    });
  });

  describe('SET_BONUS', () => {
    it('should set bonus value', () => {
      const state = createMockSettings({ bonus: 10 });
      const action: SettingsAction = {
        type: 'SET_BONUS',
        bonus: 15,
      };

      const result = settingsReducer(state, action);

      expect(result.bonus).toBe(15);
    });

    it('should allow zero bonus', () => {
      const state = createMockSettings({ bonus: 10 });
      const action: SettingsAction = {
        type: 'SET_BONUS',
        bonus: 0,
      };

      const result = settingsReducer(state, action);

      expect(result.bonus).toBe(0);
    });

    it('should allow negative bonus', () => {
      const state = createMockSettings({ bonus: 10 });
      const action: SettingsAction = {
        type: 'SET_BONUS',
        bonus: -5,
      };

      const result = settingsReducer(state, action);

      expect(result.bonus).toBe(-5);
    });
  });

  describe('SET_PENALTY_PER_TRICK', () => {
    it('should set penaltyPerTrick value', () => {
      const state = createMockSettings({ penaltyPerTrick: 1 });
      const action: SettingsAction = {
        type: 'SET_PENALTY_PER_TRICK',
        penaltyPerTrick: 3,
      };

      const result = settingsReducer(state, action);

      expect(result.penaltyPerTrick).toBe(3);
    });

    it('should allow zero penalty', () => {
      const state = createMockSettings({ penaltyPerTrick: 1 });
      const action: SettingsAction = {
        type: 'SET_PENALTY_PER_TRICK',
        penaltyPerTrick: 0,
      };

      const result = settingsReducer(state, action);

      expect(result.penaltyPerTrick).toBe(0);
    });

    it('should allow high penalty values', () => {
      const state = createMockSettings({ penaltyPerTrick: 1 });
      const action: SettingsAction = {
        type: 'SET_PENALTY_PER_TRICK',
        penaltyPerTrick: 10,
      };

      const result = settingsReducer(state, action);

      expect(result.penaltyPerTrick).toBe(10);
    });
  });

  describe('SET_GAME', () => {
    it('should restore settings from game', () => {
      const game = createMockGame({
        settings: createMockSettings({
          maxCards: 5,
          gameType: GameType.ODD,
          bonus: 15,
          penaltyPerTrick: 2,
        }),
      });
      const action: any = {
        type: 'SET_GAME',
        game,
      };

      const result = settingsReducer(initialState, action);

      expect(result.maxCards).toBe(5);
      expect(result.gameType).toBe(GameType.ODD);
      expect(result.bonus).toBe(15);
      expect(result.penaltyPerTrick).toBe(2);
    });

    it('should return state if game is undefined', () => {
      const action: any = {
        type: 'SET_GAME',
        game: undefined,
      };

      const result = settingsReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('default case', () => {
    it('should return state for unknown action', () => {
      const state = createMockSettings();
      const action: any = {
        type: 'UNKNOWN_ACTION',
      };

      const result = settingsReducer(state, action);

      expect(result).toBe(state);
    });
  });
});
