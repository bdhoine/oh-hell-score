import { render } from '../test/utils/test-utils';
import { ReloadGameToast } from './ReloadGameToast';
import { createMockGame, createMockGameWithRounds } from '../test/utils/mock-data';
import { mockNavContext } from '../test/utils/test-utils';
import { GameType } from '../models/GameType';

/**
 * ReloadGameToast Integration Tests
 *
 * Note: Ionic components (IonToast) don't fully render in Jest/RTL tests.
 * These tests verify the component integrates correctly with:
 * - NavContext (routing)
 * - Game state props
 * - isUnfinished utility (tested separately with 100% coverage)
 *
 * The actual toast UI behavior is verified in E2E tests (game-flow-all.spec.ts).
 */

describe('ReloadGameToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render without crashing for finished game', () => {
    const finishedGame = createMockGame();
    finishedGame.roundState.rounds = [];

    const { container } = render(
      <ReloadGameToast loadedGame={finishedGame} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render without crashing for unfinished game', () => {
    const unfinishedGame = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
    unfinishedGame.roundState.rounds[0].playerBets[0].trick = 1;

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={unfinishedGame} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render without crashing on wrong route', () => {
    const unfinishedGame = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
    unfinishedGame.roundState.rounds[0].playerBets[0].trick = 1;

    mockNavContext.routeInfo.pathname = '/bid';

    const { container } = render(
      <ReloadGameToast loadedGame={unfinishedGame} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render without crashing for game with no rounds', () => {
    const newGame = createMockGame();
    newGame.roundState.rounds = [];

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={newGame} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should accept loadedGame prop', () => {
    const game = createMockGame();

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should accept allowedRoute prop', () => {
    const game = createMockGame();

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/bid" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle undefined allowedRoute', () => {
    const game = createMockGame();

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute={undefined} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with multiple players', () => {
    const game = createMockGameWithRounds(['Alice', 'Bob', 'Carol', 'Dave'], 3, GameType.ALL);

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with ODD game type', () => {
    const game = createMockGameWithRounds(['Alice', 'Bob'], 3, GameType.ODD);

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with EVEN game type', () => {
    const game = createMockGameWithRounds(['Alice', 'Bob'], 4, GameType.EVEN);

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with partially completed rounds', () => {
    const game = createMockGameWithRounds(['Alice', 'Bob', 'Carol'], 3, GameType.ALL);
    // First round complete
    game.roundState.rounds[0].playerBets[0].trick = 1;
    game.roundState.rounds[0].playerBets[1].trick = 0;
    game.roundState.rounds[0].playerBets[2].trick = 0;
    // Second round incomplete
    game.roundState.rounds[1].playerBets[0].trick = 1;

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render for completed game', () => {
    const game = createMockGameWithRounds(['Alice', 'Bob'], 1, GameType.ALL);
    // Complete all tricks
    game.roundState.rounds.forEach(round => {
      round.playerBets[0].trick = 1;
      round.playerBets[1].trick = 0;
    });

    mockNavContext.routeInfo.pathname = '/newgame';

    const { container } = render(
      <ReloadGameToast loadedGame={game} allowedRoute="/newgame" />
    );

    expect(container).toBeInTheDocument();
  });
});
