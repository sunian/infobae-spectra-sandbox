import { NavigationBar } from 'expo-navigation-bar';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColors } from '@/design-system';
import { t } from '@/localization';
import { navigationTheme } from '@/navigation/navigationTheme';
import { EditionProvider, useEdition } from '@/state/EditionContext';
import { ThemeProvider, useThemePreference } from '@/state/ThemeContext';

// Keep the native splash screen up until the saved edition and theme are read, so no other screen
// or color flashes.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status, edition } = useEdition();
  const { scheme, status: themeStatus } = useThemePreference();
  const colors = useColors();
  const ready = status === 'ready' && themeStatus === 'ready';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <NavigationThemeProvider value={navigationTheme(scheme, colors)}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* `dark` is a dark bar with light buttons. It follows the choice, not the phone. */}
      <NavigationBar style={scheme} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={edition === null}>
          <Stack.Screen name="select-edition" />
        </Stack.Protected>
        <Stack.Protected guard={edition !== null}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="change-edition"
            options={{
              headerShown: true,
              title: t('editionSelect.changeTitle'),
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="change-theme"
            options={{
              headerShown: true,
              title: t('themeSelect.title'),
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="article"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
            }}
          />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <EditionProvider>
        <RootNavigator />
      </EditionProvider>
    </ThemeProvider>
  );
}
