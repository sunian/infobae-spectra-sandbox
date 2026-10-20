import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListFooter } from './ListFooter';

const labels = { errorLabel: 'Could not load more.', retryLabel: 'Try again' };

describe('ListFooter', () => {
  it('shows nothing when idle', async () => {
    await render(<ListFooter state="idle" {...labels} onRetry={() => {}} />);
    expect(screen.queryByTestId('list-footer-loading')).toBeNull();
    expect(screen.queryByText(labels.errorLabel)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows an indicator while loading', async () => {
    await render(<ListFooter state="loading" {...labels} onRetry={() => {}} />);
    expect(screen.getByTestId('list-footer-loading')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the error and a retry button on error', async () => {
    const onRetry = jest.fn();
    await render(<ListFooter state="error" {...labels} onRetry={onRetry} />);
    expect(screen.getByText(labels.errorLabel)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
