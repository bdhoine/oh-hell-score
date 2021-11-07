import { AppReducer } from "../../@types/reducers";
import { Game, GameAction } from "../../@types/state";
import playerReducer from "./playerReducer";
import roundReducer from "./roundReducer";
import settingsReducer from "./settingsReducer";

const appReducer: AppReducer = (game: Game, action: GameAction): Game => {
    return {
        playerState: playerReducer(game.playerState, action),
        roundState: roundReducer(game.roundState, action),
        settings: settingsReducer(game.settings, action)
    };
};

export default appReducer
