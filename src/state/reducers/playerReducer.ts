import type {PlayerReducer} from "../../@types/reducers";
import type {GameAction, PlayerState} from "../../@types/state";

const playerReducer: PlayerReducer = (state: PlayerState, action: GameAction) => {
  const {type} = action;
  switch (type) {
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: [...state.players.filter(player => player !== action.name)]
      }
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.name]
      }
    case 'REORDER_PLAYER': {
      const reorderedPlayer = state.players[action.from];
      const reorderedPlayers = [...state.players];
      reorderedPlayers.splice(action.from, 1);
      reorderedPlayers.splice(action.to, 0, reorderedPlayer);

      return {
        ...state,
        players: reorderedPlayers,
      }
    }
    case 'RENAME_PLAYER': {
      const renamedPlayers = [...state.players];
      renamedPlayers[action.location] = action.name;
      return {
        ...state,
        players: renamedPlayers
      }
    }
    case 'SET_GAME':
      if (action.game) {
        return action.game.playerState;
      }
      return state;
    default:
      return state
  }
}

export default playerReducer;
