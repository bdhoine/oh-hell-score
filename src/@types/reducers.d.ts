import { Reducer } from "react";

type PlayerReducer = Reducer<PlayerState, GameAction>;
type RoundReducer = Reducer<Rounds, GameAction>;
type SettingsReducer = Reducer<Settings, GameAction>;

type AppReducer = Reducer<Game, GameAction>