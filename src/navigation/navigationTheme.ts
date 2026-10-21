import { DefaultTheme, type Theme } from 'expo-router';

import type { ColorPalette } from '@/design-system';

/** Maps the design system palette to the colors that the navigation containers paint. */
export function navigationTheme(scheme: 'light' | 'dark', colors: ColorPalette): Theme {
  return {
    ...DefaultTheme,
    dark: scheme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.tabActive,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
    },
  };
}
