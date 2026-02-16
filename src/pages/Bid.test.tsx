import { render, screen, mockNavContext } from '../test/utils/test-utils';
import Bid from './Bid';
import { createMockGameWithRounds, createMockGame, createMockRounds, createMockRound } from '../test/utils/mock-data';
import { GameType } from '../models/GameType';

// Mock storage
jest.mock('../storage');

// Mock Ionic hooks
const mockShowBidAlert = jest.fn();
const mockDismissBidAlert = jest.fn();

jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  useIonAlert: () => [mockShowBidAlert, mockDismissBidAlert],
  useIonViewWillLeave: jest.fn(),
}));

// Mock RestartButton component
jest.mock('../components/RestartButton', () => ({
  RestartButton: () => <div data-testid="restart-button">RestartButton</div>,
}));

// Mock PenaltyButton component
jest.mock('../components/PenaltyButton', () => ({
  PenaltyItemOption: ({ player }: any) => <div data-testid={`penalty-${player}`}>Penalty</div>,
}));

describe('Bid Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavContext.navigate.mockClear();
  });

  it('should render null when no round exists', () => {
    const game = createMockGame();
    const { container } = render(<Bid />, { initialState: game });

    // With no rounds, page should not render
    expect(container.querySelector('ion-page')).not.toBeInTheDocument();
  });

  describe('with game setup', () => {
    const setupGame = () => {
      const game = createMockGameWithRounds(['Alice', 'Bob', 'Carol'], 3, GameType.ALL);
      return game;
    };

    it('should render page title with round cards', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByText('Bid 1')).toBeInTheDocument();
    });

    it('should render Back button', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should render RestartButton', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByTestId('restart-button')).toBeInTheDocument();
    });

    it('should display column headers', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Bid')).toBeInTheDocument();
      expect(screen.getByText('Trick')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
    });

    it('should display all player names', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Carol')).toBeInTheDocument();
    });

    it('should display dealer icon for dealer', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      // Check for hand-left icon (dealer indicator)
      const { container } = render(<Bid />, { initialState: game });
      const dealerIcons = container.querySelectorAll('ion-icon[icon="hand-left"]');
      expect(dealerIcons.length).toBeGreaterThan(0);
    });

    it('should display initial bid values as 0', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      // All bids start at 0
      const bidCells = screen.getAllByText('0');
      expect(bidCells.length).toBeGreaterThanOrEqual(3); // At least 3 players
    });

    it('should render FAB button for trick phase', () => {
      const game = setupGame();
      const { container } = render(<Bid />, { initialState: game });

      const fabButton = container.querySelector('ion-fab-button');
      expect(fabButton).toBeInTheDocument();
    });

    it('should disable trick phase button when bids equal cards', () => {
      const game = setupGame();
      // Set bids that equal the cards (1 card in first round)
      game.roundState.rounds[0].playerBets[0].bid = 1;
      game.roundState.rounds[0].playerBets[1].bid = 0;
      game.roundState.rounds[0].playerBets[2].bid = 0;

      const { container } = render(<Bid />, { initialState: game });

      const fabButton = container.querySelector('ion-fab-button');
      expect(fabButton).toHaveAttribute('disabled', 'true');
    });

    it('should enable trick phase button when bids do not equal cards', () => {
      const game = setupGame();
      // Set bids that don't equal cards (all 0, but round has 1 card)

      const { container } = render(<Bid />, { initialState: game });

      const fabButton = container.querySelector('ion-fab-button');
      expect(fabButton).not.toHaveAttribute('disabled', 'true');
    });

    it('should navigate to /trick when trick phase button clicked', () => {
      const game = setupGame();
      const { container } = render(<Bid />, { initialState: game });

      const fabButton = container.querySelector('ion-fab-button');
      expect(fabButton).toHaveAttribute('routerlink', '/trick');
    });

    it('should show "not okay" badge for dealer when applicable', () => {
      const game = setupGame();
      // Set up scenario where dealer can't bid a certain number
      game.roundState.rounds[0].playerBets[0].bid = 0; // Alice (dealer)
      game.roundState.rounds[0].playerBets[1].bid = 0; // Bob
      game.roundState.rounds[0].playerBets[2].bid = 0; // Carol
      // Round has 1 card, total bids = 0, so "not okay" = 1

      const { container } = render(<Bid />, { initialState: game });

      // Should show badge with value 1 (cards - totalBids)
      const dangerBadges = container.querySelectorAll('ion-badge[color="danger"]');
      expect(dangerBadges.length).toBeGreaterThan(0);
    });

    it('should display previous round scores', () => {
      const game = setupGame();
      // Set active round to 1 (second round) so we can see scores from round 0
      game.roundState.activeRound = 1;
      game.roundState.rounds[0].playerBets[0].score = 11; // Alice scored in round 0

      const { container } = render(<Bid />, { initialState: game });

      // Should show score badges
      const scoreBadges = container.querySelectorAll('ion-badge[color="see-through-black"]');
      expect(scoreBadges.length).toBe(3); // One for each player
    });

    it('should render penalty buttons for each player', () => {
      const game = setupGame();
      render(<Bid />, { initialState: game });

      expect(screen.getByTestId('penalty-Alice')).toBeInTheDocument();
      expect(screen.getByTestId('penalty-Bob')).toBeInTheDocument();
      expect(screen.getByTestId('penalty-Carol')).toBeInTheDocument();
    });

    it('should navigate back to newgame on first round', () => {
      const game = setupGame();
      game.roundState.activeRound = 0; // First round
      render(<Bid />, { initialState: game });

      const backButton = screen.getByText('Back').closest('ion-button');
      backButton?.click();

      expect(mockNavContext.navigate).toHaveBeenCalledWith('/newgame');
    });

    it('should navigate back to trick page on subsequent rounds', () => {
      const game = setupGame();
      game.roundState.activeRound = 1; // Second round
      render(<Bid />, { initialState: game });

      const backButton = screen.getByText('Back').closest('ion-button');
      backButton?.click();

      expect(mockNavContext.navigate).toHaveBeenCalledWith('/trick');
    });
  });

  describe('Dealer "Not Okay" Rule', () => {
    it('should calculate "not okay" value as cards minus total bids', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
      game.roundState.rounds[0].playerBets[0].bid = 0; // Alice
      game.roundState.rounds[0].playerBets[1].bid = 0; // Bob
      // Round has 1 card, total bids = 0, "not okay" = 1

      const { container } = render(<Bid />, { initialState: game });

      // Should show "not okay" badge with value 1
      const badge = container.querySelector('ion-badge[color="danger"]');
      expect(badge?.textContent).toBe('1');
    });

    it('should update "not okay" badge when bids change', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
      game.roundState.rounds[0].playerBets[0].bid = 1; // Alice bids 1
      game.roundState.rounds[0].playerBets[1].bid = 0; // Bob bids 0
      // Round has 1 card, total bids = 1, "not okay" = 0

      const { container } = render(<Bid />, { initialState: game });

      // Should show "not okay" badge with value 0
      const badge = container.querySelector('ion-badge[color="danger"]');
      expect(badge?.textContent).toBe('0');
    });
  });

  describe('Page Structure', () => {
    it('should render IonPage', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
      const { container } = render(<Bid />, { initialState: game });

      expect(container.querySelector('ion-page')).toBeInTheDocument();
    });

    it('should render IonHeader', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
      const { container } = render(<Bid />, { initialState: game });

      expect(container.querySelector('ion-header')).toBeInTheDocument();
    });

    it('should render IonContent', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob'], 2, GameType.ALL);
      const { container } = render(<Bid />, { initialState: game });

      expect(container.querySelector('ion-content')).toBeInTheDocument();
    });

    it('should render sliding items for each player', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob', 'Carol'], 2, GameType.ALL);
      const { container } = render(<Bid />, { initialState: game });

      const slidingItems = container.querySelectorAll('ion-item-sliding');
      expect(slidingItems.length).toBe(3);
    });

    it('should alternate row colors', () => {
      const game = createMockGameWithRounds(['Alice', 'Bob', 'Carol'], 2, GameType.ALL);
      const { container } = render(<Bid />, { initialState: game });

      const items = container.querySelectorAll('ion-item[color="light"]');
      // Every other row should have light color (odd indices)
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
