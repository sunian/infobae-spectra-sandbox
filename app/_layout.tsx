import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { EditionProvider, useEdition } from '@/state/EditionContext';

// Keep the native splash screen up until the saved edition is read, so no other screen flashes.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status, edition } = useEdition();
  const ready = status === 'ready';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={edition === null}>
        <Stack.Screen name="select-edition" />
      </Stack.Protected>
      <Stack.Protected guard={edition !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <EditionProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </EditionProvider>
  );
}
