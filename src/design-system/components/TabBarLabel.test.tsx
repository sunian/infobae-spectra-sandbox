import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';
import { TabBarLabel, tabBarIcon } from './TabBarLabel';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

describe.each(SCHEMES)('TabBarLabel in the %s scheme', (scheme, palette) => {
  it('uses the active color when focused', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <TabBarLabel labelKey="tabs.home" focused />
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByText('Home').props.style).color).toBe(palette.tabActive);
  });

  it('uses the inactive color when not focused', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <TabBarLabel labelKey="tabs.home" focused={false} />
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByText('Home').props.style).color).toBe(
      palette.tabInactive,
    );
  });
});

describe('tabBarIcon', () => {
  it('draws a dot in the color it is given', () => {
    const icon = tabBarIcon({ color: '#123456', size: 24 }) as ReactElement<{
      style: StyleProp<ViewStyle>;
    }>;
    expect(StyleSheet.flatten(icon.props.style)).toMatchObject({
      backgroundColor: '#123456',
      width: 12,
      height: 12,
    });
  });
});
