import { render, screen } from '@testing-library/react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { Text as RNText } from 'react-native';

import { ThemeProvider, useColorSchemeName, useColors, useThemedStyles } from './theme';
import { darkColors, lightColors, type ColorPalette } from './tokens';

function Probe() {
  const colors = useColors();
  const scheme = useColorSchemeName();
  return (
    <RNText testID="probe" style={{ color: colors.background }}>
      {scheme}
    </RNText>
  );
}

const probeColor = () => (screen.getByTestId('probe').props.style as TextStyle).color;

describe('theme', () => {
  it('gives the light palette and scheme when there is no provider', async () => {
    await render(<Probe />);
    expect(probeColor()).toBe(lightColors.background);
    expect(screen.getByText('light')).toBeTruthy();
  });

  it('gives the dark palette under a dark provider', async () => {
    await render(
      <ThemeProvider scheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(probeColor()).toBe(darkColors.background);
    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('gives the light palette under a light provider', async () => {
    await render(
      <ThemeProvider scheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(probeColor()).toBe(lightColors.background);
    expect(screen.getByText('light')).toBeTruthy();
  });

  describe('useThemedStyles', () => {
    const seen: { palette: ColorPalette; styles: unknown }[] = [];
    const factory = (palette: ColorPalette) => ({ box: { backgroundColor: palette.surface } });

    function Styled() {
      const styles = useThemedStyles(factory);
      seen.push({ palette: useColors(), styles });
      return <RNText style={styles.box as StyleProp<TextStyle>}>styled</RNText>;
    }

    beforeEach(() => {
      seen.length = 0;
    });

    it('builds styles from the active palette', async () => {
      await render(
        <ThemeProvider scheme="dark">
          <Styled />
        </ThemeProvider>,
      );
      const style = screen.getByText('styled').props.style as TextStyle;
      expect(style.backgroundColor).toBe(darkColors.surface);
    });

    it('keeps the same styles object while the scheme stays the same', async () => {
      const { rerender } = await render(
        <ThemeProvider scheme="light">
          <Styled />
        </ThemeProvider>,
      );
      await rerender(
        <ThemeProvider scheme="light">
          <Styled />
        </ThemeProvider>,
      );
      expect(seen.length).toBeGreaterThan(1);
      expect(seen[seen.length - 1].styles).toBe(seen[0].styles);
    });

    it('builds new styles when the scheme changes', async () => {
      const { rerender } = await render(
        <ThemeProvider scheme="light">
          <Styled />
        </ThemeProvider>,
      );
      await rerender(
        <ThemeProvider scheme="dark">
          <Styled />
        </ThemeProvider>,
      );
      expect(seen[seen.length - 1].styles).not.toBe(seen[0].styles);
      const style = screen.getByText('styled').props.style as TextStyle;
      expect(style.backgroundColor).toBe(darkColors.surface);
    });
  });
});
