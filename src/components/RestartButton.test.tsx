import { render, fireEvent } from '../test/utils/test-utils';
import { RestartButton } from './RestartButton';
import { mockNavContext } from '../test/utils/test-utils';

// Mock Ionic hooks
const mockShowRestartAlert = jest.fn();
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  useIonAlert: () => [mockShowRestartAlert],
}));

describe('RestartButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with refresh icon', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    expect(button).toBeInTheDocument();

    // Ionic icons have title attribute
    const icon = container.querySelector('ion-icon[title="Refresh"]');
    expect(icon).toBeInTheDocument();
  });

  it('should have refresh icon', () => {
    const { container } = render(<RestartButton />);

    const icon = container.querySelector('ion-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should show restart dialog when clicked', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    expect(mockShowRestartAlert).toHaveBeenCalledTimes(1);
  });

  it('should display correct header in dialog', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    expect(mockShowRestartAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Are you sure you want to restart the game?',
      })
    );
  });

  it('should have Cancel button', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.buttons).toContainEqual('Cancel');
  });

  it('should have Restart button with handler', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    const restartButton = callArgs.buttons.find((b: any) => b.text === 'Restart');

    expect(restartButton).toBeDefined();
    expect(typeof restartButton.handler).toBe('function');
  });

  it('should navigate to home when Restart button clicked', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    const restartButton = callArgs.buttons.find((b: any) => b.text === 'Restart');

    // Simulate clicking Restart
    restartButton.handler();

    expect(mockNavContext.navigate).toHaveBeenCalledWith('/');
  });

  it('should have backdrop dismiss enabled', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.backdropDismiss).toBe(true);
  });

  it('should use iOS mode', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.mode).toBe('ios');
  });

  it('should not close keyboard', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.keyboardClose).toBe(false);
  });

  it('should have two buttons in total', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.buttons).toHaveLength(2);
  });

  it('should show dialog on multiple clicks', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');

    fireEvent.click(button!);
    fireEvent.click(button!);
    fireEvent.click(button!);

    expect(mockShowRestartAlert).toHaveBeenCalledTimes(3);
  });

  it('should have Cancel as first button and Restart as second', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    expect(callArgs.buttons[0]).toBe('Cancel');
    expect(callArgs.buttons[1].text).toBe('Restart');
  });

  it('should only call navigate when Restart is clicked, not Cancel', () => {
    const { container } = render(<RestartButton />);

    const button = container.querySelector('ion-button');
    fireEvent.click(button!);

    // Cancel button is just a string, doesn't have a handler
    const callArgs = mockShowRestartAlert.mock.calls[0][0];
    const cancelButton = callArgs.buttons[0];

    // Cancel is a string, not an object with handler
    expect(typeof cancelButton).toBe('string');
    expect(mockNavContext.navigate).not.toHaveBeenCalled();
  });

  it('should render without crashing when not clicked', () => {
    const { container } = render(<RestartButton />);

    expect(container.querySelector('ion-button')).toBeInTheDocument();
    expect(mockShowRestartAlert).not.toHaveBeenCalled();
  });
});
