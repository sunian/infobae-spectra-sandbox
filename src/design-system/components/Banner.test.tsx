import { fireEvent, render, screen } from '@testing-library/react-native';

import { Banner } from './Banner';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';
import { StyleSheet } from 'react-native';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

describe('Banner', () => {
  it('shows the message', async () => {
    await render(<Banner message="We could not refresh." />);
    expect(screen.getByText('We could not refresh.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onDismiss when it is tapped, if given', async () => {
    const onDismiss = jest.fn();
    await render(<Banner message="We could not refresh." onDismiss={onDismiss} />);
    await fireEvent.press(screen.getByRole('button', { name: 'We could not refresh.' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('announces itself to screen readers', async () => {
    await render(<Banner message="We could not refresh." />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe.each(SCHEMES)('Banner in the %s scheme', (scheme, palette) => {
  it('uses the surface and border colors', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <Banner message="We could not refresh." />
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByRole('alert').props.style)).toMatchObject({
      backgroundColor: palette.surface,
      borderBottomColor: palette.border,
    });
  });
});
