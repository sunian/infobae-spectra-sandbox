import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { darkColors, lightColors, type ColorPalette } from './tokens';

export type ColorScheme = 'light' | 'dark';

const PALETTES: Record<ColorScheme, ColorPalette> = { light: lightColors, dark: darkColors };

// Without a provider (for example, a component test) the light scheme applies.
const ThemeContext = createContext<ColorScheme>('light');

type ThemeProviderProps = {
  scheme: ColorScheme;
  children: ReactNode;
};

export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={scheme}>{children}</ThemeContext.Provider>;
}

export function useColorSchemeName(): ColorScheme {
  return useContext(ThemeContext);
}

export function useColors(): ColorPalette {
  return PALETTES[useColorSchemeName()];
}

/**
 * Builds styles from the active palette. The factory returns `StyleSheet.create({ ... })`. The result
 * changes only when the palette does.
 */
export function useThemedStyles<T>(factory: (colors: ColorPalette) => T): T {
  const colors = useColors();
  // Callers pass a module-level factory, so it stays the same between renders.
  return useMemo(() => factory(colors), [factory, colors]);
}
