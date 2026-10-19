import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { EditionProvider, useEdition } from '@/state/EditionContext';

function RootNavigator() {
  const { status, edition } = useEdition();

  // The splash screen stays up while the saved edition is read (added in T022).
  if (status === 'loading') return null;

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
