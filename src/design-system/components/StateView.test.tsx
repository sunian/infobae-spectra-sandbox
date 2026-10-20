import { fireEvent, render, screen } from '@testing-library/react-native';

import { StateView } from './StateView';

describe('StateView', () => {
  it('shows an activity indicator and the message when loading, with no button', async () => {
    await render(<StateView kind="loading" message="Loading articles" />);
    expect(screen.getByTestId('state-view-loading')).toBeTruthy();
    expect(screen.getByText('Loading articles')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows an activity indicator even with no message', async () => {
    await render(<StateView kind="loading" />);
    expect(screen.getByTestId('state-view-loading')).toBeTruthy();
  });

  it('shows the message and no button when empty', async () => {
    await render(<StateView kind="empty" message="No articles right now." />);
    expect(screen.getByText('No articles right now.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByTestId('state-view-loading')).toBeNull();
  });

  it('shows the message and an action button on error, and calls onAction when pressed', async () => {
    const onAction = jest.fn();
    await render(
      <StateView
        kind="error"
        message="Could not load."
        actionLabel="Try again"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('Could not load.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('shows no button on error when there is no action', async () => {
    await render(<StateView kind="error" message="Could not load." />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
