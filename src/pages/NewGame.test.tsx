import { fireEvent, waitFor } from '@testing-library/react';

import { render, screen } from '../test/utils/test-utils';

import NewGame from './NewGame';

// Mock storage
jest.mock('../storage');

// Mock Ionic hooks
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  useIonAlert: () => [jest.fn()],
  useIonViewWillLeave: jest.fn(),
}));

// Helper to fire Ionic ionChange custom event
const ionChange = (element: Element, value: string | null) => {
  fireEvent(element, new CustomEvent('ionChange', { detail: { value } }));
};

describe('NewGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Player Management', () => {
    it('should render with Players header', () => {
      render(<NewGame />);
      expect(screen.getByText('Players')).toBeInTheDocument();
    });

    it('should render player input with placeholder', () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');
      expect(input).toBeInTheDocument();
    });

    it('should add player on Enter key', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, 'Alice');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });

    it('should add player on blur', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, 'Bob');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('should not add empty player name', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, '');
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        const playerItems = screen.queryAllByRole('button');
        // Should only have configuration items and start button, no player items
        expect(playerItems.length).toBeLessThan(5);
      });
    });

    it('should not add whitespace-only player name', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, '   ');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('   ')).not.toBeInTheDocument();
      });
    });

    it('should trim player names', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, '  Carol  ');
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Carol')).toBeInTheDocument();
        expect(screen.queryByText('  Carol  ')).not.toBeInTheDocument();
      });
    });

    it('should clear input after adding player', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...') as HTMLIonInputElement;

      ionChange(input, 'Dave');
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        // Ionic input value is either empty string or undefined when cleared
        expect(input.value === '' || input.value === undefined).toBe(true);
      });
    });

    it('should add multiple players', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      const players = ['Alice', 'Bob', 'Carol'];

      for (const player of players) {
        ionChange(input, player);
        fireEvent.keyDown(input, { key: 'Enter' });
      }

      await waitFor(() => {
        players.forEach(player => {
          expect(screen.getByText(player)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Configuration', () => {
    it('should render Configuration header', () => {
      render(<NewGame />);
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    it('should render Maximum Cards setting', () => {
      render(<NewGame />);
      expect(screen.getByText('Maximum Cards')).toBeInTheDocument();
    });

    it('should render Cards to play setting', () => {
      render(<NewGame />);
      expect(screen.getByText('Cards to play')).toBeInTheDocument();
    });

    it('should render Bonus setting', () => {
      render(<NewGame />);
      expect(screen.getByText('Bonus')).toBeInTheDocument();
    });

    it('should render Penalty per trick setting', () => {
      render(<NewGame />);
      expect(screen.getByText('Penalty per trick')).toBeInTheDocument();
    });

    it('should have default bonus value', () => {
      render(<NewGame />);
      const bonusInput = screen.getByPlaceholderText('10');
      expect(bonusInput).toBeInTheDocument();
    });

    it('should have default penalty value', () => {
      render(<NewGame />);
      const penaltyInput = screen.getByPlaceholderText('1');
      expect(penaltyInput).toBeInTheDocument();
    });

    it('should update bonus value', async () => {
      render(<NewGame />);
      const bonusInput = screen.getByPlaceholderText('10') as HTMLIonInputElement;

      ionChange(bonusInput, '15');

      await waitFor(() => {
        expect(bonusInput.value).toBe(15);
      });
    });

    it('should update penalty value', async () => {
      render(<NewGame />);
      const penaltyInput = screen.getByPlaceholderText('1') as HTMLIonInputElement;

      ionChange(penaltyInput, '2');

      await waitFor(() => {
        expect(penaltyInput.value).toBe(2);
      });
    });

    it('should not update bonus with invalid number', async () => {
      render(<NewGame />);
      const bonusInput = screen.getByPlaceholderText('10') as HTMLIonInputElement;
      const originalValue = bonusInput.value;

      ionChange(bonusInput, 'abc');

      // Should keep original value when NaN
      expect(bonusInput.value).toBe(originalValue);
    });

    it('should not update penalty with invalid number', async () => {
      render(<NewGame />);
      const penaltyInput = screen.getByPlaceholderText('1') as HTMLIonInputElement;
      const originalValue = penaltyInput.value;

      ionChange(penaltyInput, 'xyz');

      // Should keep original value when NaN
      expect(penaltyInput.value).toBe(originalValue);
    });

    it('should allow zero bonus', async () => {
      render(<NewGame />);
      const bonusInput = screen.getByPlaceholderText('10') as HTMLIonInputElement;

      ionChange(bonusInput, '0');

      await waitFor(() => {
        expect(bonusInput.value).toBe(0);
      });
    });

    it('should allow negative bonus', async () => {
      render(<NewGame />);
      const bonusInput = screen.getByPlaceholderText('10') as HTMLIonInputElement;

      ionChange(bonusInput, '-5');

      await waitFor(() => {
        expect(bonusInput.value).toBe(-5);
      });
    });
  });

  describe('Start Game', () => {
    it('should render Start Game button', () => {
      render(<NewGame />);
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should show Start Game button as IonButton', () => {
      render(<NewGame />);
      const startButton = screen.getByText('Start Game').closest('ion-button');
      expect(startButton).toBeInTheDocument();
    });

    it('should have block expand on Start Game button', () => {
      render(<NewGame />);
      const startButton = screen.getByText('Start Game').closest('ion-button');
      expect(startButton).toHaveAttribute('expand', 'block');
    });
  });

  describe('Page Structure', () => {
    it('should render page with correct title', () => {
      render(<NewGame />);
      expect(screen.getByText('New Game')).toBeInTheDocument();
    });

    it('should render IonHeader', () => {
      const { container } = render(<NewGame />);
      expect(container.querySelector('ion-header')).toBeInTheDocument();
    });

    it('should render IonContent', () => {
      const { container } = render(<NewGame />);
      expect(container.querySelector('ion-content')).toBeInTheDocument();
    });

    it('should render two IonList sections', () => {
      const { container } = render(<NewGame />);
      const lists = container.querySelectorAll('ion-list');
      expect(lists.length).toBe(2); // Players list and Configuration list
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid Enter key presses', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, 'Alice');
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        const aliceElements = screen.getAllByText('Alice');
        // Should only add once
        expect(aliceElements.length).toBe(1);
      });
    });

    it('should handle non-Enter key presses', () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      ionChange(input, 'Bob');
      fireEvent.keyDown(input, { key: 'Tab' });

      // Should not add player on Tab
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should handle null input value', () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      // Should not throw error
      expect(() => {
        ionChange(input, null);
      }).not.toThrow();
    });

    it('should render with existing players from state', async () => {
      render(<NewGame />);
      const input = screen.getByPlaceholderText('New player...');

      // Add a player
      ionChange(input, 'Alice');
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Re-render should still show player
      const { rerender } = render(<NewGame />);
      rerender(<NewGame />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });
  });
});
