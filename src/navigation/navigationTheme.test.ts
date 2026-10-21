import { darkColors, lightColors, type ColorPalette } from '@/design-system';

import { navigationTheme } from './navigationTheme';

describe.each<['light' | 'dark', ColorPalette]>([
  ['light', lightColors],
  ['dark', darkColors],
])('navigationTheme in the %s scheme', (scheme, palette) => {
  const theme = navigationTheme(scheme, palette);

  it('flags the dark scheme', () => {
    expect(theme.dark).toBe(scheme === 'dark');
  });

  it('maps the palette to the navigation colors', () => {
    expect(theme.colors).toMatchObject({
      background: palette.background,
      card: palette.surface,
      text: palette.textPrimary,
      border: palette.border,
      primary: palette.tabActive,
    });
  });

  it('keeps the fonts the navigation library needs', () => {
    expect(theme.fonts).toBeDefined();
  });
});
