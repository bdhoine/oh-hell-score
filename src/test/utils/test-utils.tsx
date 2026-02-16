import { render, RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { NavContext } from '@ionic/react';
import { createContext, useReducer } from 'react';
import type { Game, GameContext } from '../../@types/state';
import reducers from '../../state/reducers';
import { GameType } from '../../models/GameType';

// Mock navigate and goBack functions for tests
export const mockNavContext = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  hasIonicRouter: jest.fn(() => true),
  registerIonPage: jest.fn(),
  routeInfo: {
    pathname: '/test',
    search: '',
    hash: '',
    key: 'test',
    state: undefined,
  },
};

const initialGame: Game = {
  roundState: {
    activeRound: 0,
    rounds: [],
    bonus: 10,
    penaltyPerTrick: 1,
  },
  playerState: {
    players: [],
  },
  settings: {
    maxCards: 7,
    gameType: GameType.ALL,
    possibleCardsToPlay: Array(7).fill(0).map((_, i) => i + 1),
    bonus: 10,
    penaltyPerTrick: 1,
  }
};

const AppStateContext = createContext<GameContext>({
  game: initialGame,
  dispatch: () => {}
});

interface TestProviderProps {
  children: React.ReactNode;
  initialState: Game;
}

/**
 * Test provider that uses stateful game with reducer
 */
const TestAppStateProvider: React.FC<TestProviderProps> = ({ children, initialState }) => {
  const [game, dispatch] = useReducer(reducers, initialState);

  return (
    <AppStateContext.Provider value={{ game, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Custom render function that wraps components with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Game;
}

export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialState = initialGame, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NavContext.Provider value={mockNavContext}>
      <TestAppStateProvider initialState={initialState}>
        {children}
      </TestAppStateProvider>
    </NavContext.Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method with custom version
export { customRender as render };
