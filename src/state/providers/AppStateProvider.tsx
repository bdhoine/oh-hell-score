import { createContext, useReducer, useContext, FunctionComponent, ReactNode, useEffect } from 'react'
import { Game, GameContext } from '../../@types/state';
import { GameType } from '../../models/GameType';
import storage from '../../storage';
import reducers from '../reducers';

const initialGame: Game = {
  roundState: {
    activeRound: 0,
    rounds: []
  },
  playerState: {
    players: [],
  },
  settings: {
    maxCards: 7,
    gameType: GameType.ALL,
    possibleCardsToPlay: Array(7).fill(0).map((_, i) => i + 2)
  }
}

const AppStateContext = createContext<GameContext>({
  game: initialGame,
  dispatch: () => {}
});

type AppStateProviderProps = {
  children: ReactNode
}

export const AppStateProvider: FunctionComponent<AppStateProviderProps> = ({ children }) => {

  const [game, dispatch] = useReducer(reducers, initialGame);

  useEffect(() => {
    storage.get('gameState').then((game) => {
      if (game) {
        dispatch({
          type: 'SET_GAME',
          game
        })
      }
    })
  }, []);
  
  return (
    <AppStateContext.Provider value={{game, dispatch}}>
      {children}
    </AppStateContext.Provider>
  )
}

export const useGameState = () => useContext<GameContext>(AppStateContext);
