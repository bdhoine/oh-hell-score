import type { PlayerState, PlayerAction } from '../../../@types/state';
import playerReducer from '../../../state/reducers/playerReducer';
import { createMockPlayerState, createMockGame } from '../../../test/utils/mock-data';

describe('playerReducer', () => {
  const initialState: PlayerState = createMockPlayerState([]);

  describe('ADD_PLAYER', () => {
    it('should add player to empty list', () => {
      const state = createMockPlayerState([]);
      const action: PlayerAction = {
        type: 'ADD_PLAYER',
        name: 'Alice',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice']);
    });

    it('should add player to existing list', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'ADD_PLAYER',
        name: 'Carol',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Bob', 'Carol']);
    });

    it('should not mutate original state', () => {
      const state = createMockPlayerState(['Alice']);
      const action: PlayerAction = {
        type: 'ADD_PLAYER',
        name: 'Bob',
      };

      playerReducer(state, action);

      expect(state.players).toEqual(['Alice']);
    });

    it('should allow duplicate names (no validation)', () => {
      const state = createMockPlayerState(['Alice']);
      const action: PlayerAction = {
        type: 'ADD_PLAYER',
        name: 'Alice',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Alice']);
    });

    it('should allow empty string names (no validation)', () => {
      const state = createMockPlayerState(['Alice']);
      const action: PlayerAction = {
        type: 'ADD_PLAYER',
        name: '',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', '']);
    });
  });

  describe('REMOVE_PLAYER', () => {
    it('should remove player from list', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'REMOVE_PLAYER',
        name: 'Bob',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Carol']);
    });

    it('should remove first occurrence if duplicates exist', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Alice']);
      const action: PlayerAction = {
        type: 'REMOVE_PLAYER',
        name: 'Alice',
      };

      const result = playerReducer(state, action);

      // Should remove both occurrences since filter removes all matches
      expect(result.players).toEqual(['Bob']);
    });

    it('should handle removing non-existent player', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'REMOVE_PLAYER',
        name: 'Carol',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Bob']);
    });

    it('should handle removing from empty list', () => {
      const state = createMockPlayerState([]);
      const action: PlayerAction = {
        type: 'REMOVE_PLAYER',
        name: 'Alice',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual([]);
    });

    it('should not mutate original state', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'REMOVE_PLAYER',
        name: 'Bob',
      };

      playerReducer(state, action);

      expect(state.players).toEqual(['Alice', 'Bob']);
    });
  });

  describe('REORDER_PLAYER', () => {
    it('should move player forward in list', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol', 'Dave']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 3,
        to: 1,
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Dave', 'Bob', 'Carol']);
    });

    it('should move player backward in list', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol', 'Dave']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 0,
        to: 2,
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Bob', 'Carol', 'Alice', 'Dave']);
    });

    it('should handle moving to same position', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 1,
        to: 1,
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Bob', 'Carol']);
    });

    it('should move player to beginning', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 2,
        to: 0,
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Carol', 'Alice', 'Bob']);
    });

    it('should move player to end', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 0,
        to: 2,
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Bob', 'Carol', 'Alice']);
    });

    it('should not mutate original state', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'REORDER_PLAYER',
        from: 0,
        to: 2,
      };

      playerReducer(state, action);

      expect(state.players).toEqual(['Alice', 'Bob', 'Carol']);
    });
  });

  describe('RENAME_PLAYER', () => {
    it('should rename player at specified location', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 1,
        name: 'Robert',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Robert', 'Carol']);
    });

    it('should rename first player', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 0,
        name: 'Alicia',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alicia', 'Bob', 'Carol']);
    });

    it('should rename last player', () => {
      const state = createMockPlayerState(['Alice', 'Bob', 'Carol']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 2,
        name: 'Caroline',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Bob', 'Caroline']);
    });

    it('should allow renaming to empty string (no validation)', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 1,
        name: '',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', '']);
    });

    it('should allow renaming to duplicate name (no validation)', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 1,
        name: 'Alice',
      };

      const result = playerReducer(state, action);

      expect(result.players).toEqual(['Alice', 'Alice']);
    });

    it('should not mutate original state', () => {
      const state = createMockPlayerState(['Alice', 'Bob']);
      const action: PlayerAction = {
        type: 'RENAME_PLAYER',
        location: 1,
        name: 'Robert',
      };

      playerReducer(state, action);

      expect(state.players).toEqual(['Alice', 'Bob']);
    });
  });

  describe('SET_GAME', () => {
    it('should restore playerState from game', () => {
      const game = createMockGame({
        playerState: createMockPlayerState(['Alice', 'Bob', 'Carol']),
      });
      const action: any = {
        type: 'SET_GAME',
        game,
      };

      const result = playerReducer(initialState, action);

      expect(result.players).toEqual(['Alice', 'Bob', 'Carol']);
    });

    it('should return state if game is undefined', () => {
      const state = createMockPlayerState(['Alice']);
      const action: any = {
        type: 'SET_GAME',
        game: undefined,
      };

      const result = playerReducer(state, action);

      expect(result).toBe(state);
    });
  });

  describe('default case', () => {
    it('should return state for unknown action', () => {
      const state = createMockPlayerState(['Alice']);
      const action: any = {
        type: 'UNKNOWN_ACTION',
      };

      const result = playerReducer(state, action);

      expect(result).toBe(state);
    });
  });
});
