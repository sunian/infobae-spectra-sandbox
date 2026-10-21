import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListFooter } from './ListFooter';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

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

describe.each(SCHEMES)('ListFooter in the %s scheme', (scheme, palette) => {
  it('colors the indicator with the active tab color', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <ListFooter state="loading" {...labels} onRetry={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('list-footer-loading').props.color).toBe(palette.tabActive);
  });
});
