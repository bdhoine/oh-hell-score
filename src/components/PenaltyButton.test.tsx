import { render, fireEvent } from '../test/utils/test-utils';

import { PenaltyItemOption } from './PenaltyButton';

// Mock Ionic hooks
const mockShowPenaltyAlert = jest.fn();
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  useIonAlert: () => [mockShowPenaltyAlert],
}));

function clickItemOption(container: HTMLElement) {
  const el = container.querySelector('ion-item-option');
  expect(el).toBeInTheDocument();
  fireEvent.click(el as Element);
}

describe('PenaltyButton', () => {
  const mockOnPenalise = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render penalty button with thumbs down icon', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    const itemOption = container.querySelector('ion-item-option');
    expect(itemOption).toBeInTheDocument();
    expect(itemOption).toHaveAttribute('color', 'danger');

    const icon = container.querySelector('ion-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should have danger color', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    const itemOption = container.querySelector('ion-item-option');
    expect(itemOption).toHaveAttribute('color', 'danger');
  });

  it('should show penalty dialog when clicked', () => {
    const { container } = render(
      <PenaltyItemOption player="Bob" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    expect(mockShowPenaltyAlert).toHaveBeenCalledTimes(1);
  });

  it('should display player name in dialog header', () => {
    const { container } = render(
      <PenaltyItemOption player="Carol" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    expect(mockShowPenaltyAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Give a penalty to Carol?',
      })
    );
  });

  it('should generate penalty options [2, 3, 5]', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.inputs).toHaveLength(3);
    expect(callArgs.inputs[0].value).toBe(2);
    expect(callArgs.inputs[1].value).toBe(3);
    expect(callArgs.inputs[2].value).toBe(5);
  });

  it('should display negative penalty values in labels', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.inputs[0].label).toBe('-2');
    expect(callArgs.inputs[1].label).toBe('-3');
    expect(callArgs.inputs[2].label).toBe('-5');
  });

  it('should check default penalty option (5)', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" penaltyPoints={5} onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.inputs[2].checked).toBe(true); // 5 points
  });

  it('should check custom penalty option', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" penaltyPoints={2} onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.inputs[0].checked).toBe(true); // 2 points
  });

  it('should have Cancel button', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.buttons).toContainEqual('Cancel');
  });

  it('should have Penalise button with handler', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    const penaliseButton = callArgs.buttons.find((b: any) => b.text === 'Penalise');

    expect(penaliseButton).toBeDefined();
    expect(typeof penaliseButton.handler).toBe('function');
  });

  it('should call onPenalise when Penalise button clicked', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    const penaliseButton = callArgs.buttons.find((b: any) => b.text === 'Penalise');

    // Simulate selecting 3 points
    penaliseButton.handler(3);

    expect(mockOnPenalise).toHaveBeenCalledWith(3);
  });

  it('should call onPenalise with selected penalty points', () => {
    const { container } = render(
      <PenaltyItemOption player="Bob" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    const penaliseButton = callArgs.buttons.find((b: any) => b.text === 'Penalise');

    // Simulate selecting 5 points
    penaliseButton.handler(5);

    expect(mockOnPenalise).toHaveBeenCalledWith(5);
  });

  it('should have backdrop dismiss enabled', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.backdropDismiss).toBe(true);
  });

  it('should use iOS mode', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.mode).toBe('ios');
  });

  it('should not close keyboard', () => {
    const { container } = render(
      <PenaltyItemOption player="Alice" onPenalise={mockOnPenalise} />
    );

    clickItemOption(container);

    const callArgs = mockShowPenaltyAlert.mock.calls[0][0];
    expect(callArgs.keyboardClose).toBe(false);
  });

  it('should handle multiple players', () => {
    const player1OnPenalise = jest.fn();
    const player2OnPenalise = jest.fn();

    const { container: container1 } = render(
      <PenaltyItemOption player="Player1" onPenalise={player1OnPenalise} />
    );
    const { container: container2 } = render(
      <PenaltyItemOption player="Player2" onPenalise={player2OnPenalise} />
    );

    clickItemOption(container1);
    clickItemOption(container2);

    expect(mockShowPenaltyAlert).toHaveBeenCalledTimes(2);
    expect(mockShowPenaltyAlert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ header: 'Give a penalty to Player1?' })
    );
    expect(mockShowPenaltyAlert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ header: 'Give a penalty to Player2?' })
    );
  });
});
