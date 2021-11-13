import combineReducers from 'react-combine-reducers';

import playerReducer from "./playerReducer";
import roundReducer from "./roundReducer";
import settingsReducer from "./settingsReducer";

const [appReducer] = combineReducers({
  playerState: [playerReducer, {}],
  roundState: [roundReducer, {}],
  settings: [settingsReducer, {}],
});

export default appReducer
