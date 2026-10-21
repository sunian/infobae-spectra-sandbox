import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListRow } from './ListRow';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';
import { StyleSheet } from 'react-native';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

describe('ListRow', () => {
  it('shows the label', async () => {
    await render(<ListRow label="Colombia" onPress={() => {}} />);
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  it('shows the optional value', async () => {
    await render(<ListRow label="Edition" value="Perú" onPress={() => {}} />);
    expect(screen.getByText('Perú')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<ListRow label="Colombia" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Colombia'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has the button role', async () => {
    await render(<ListRow label="Colombia" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: /Colombia/ })).toBeTruthy();
  });

  it('reports a selected state only when selected', async () => {
    await render(
      <>
        <ListRow label="On" selected onPress={() => {}} />
        <ListRow label="Off" onPress={() => {}} />
      </>,
    );
    expect(screen.getByRole('button', { name: /On/, selected: true })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Off/, selected: true })).toBeNull();
  });
});

describe.each(SCHEMES)('ListRow in the %s scheme', (scheme, palette) => {
  it('uses the background and border colors', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <ListRow label="Colombia" onPress={() => {}} />
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByRole('button').props.style)).toMatchObject({
      backgroundColor: palette.background,
      borderBottomColor: palette.border,
    });
  });
});
