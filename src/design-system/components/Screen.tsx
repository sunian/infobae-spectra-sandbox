import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../tokens';

type ScreenProps = {
  children: ReactNode;
  /** Set to false for a list that runs edge to edge and pads its own rows. */
  padded?: boolean;
};

export function Screen({ children, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.container, padded && styles.padded]}>{children}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    padding: spacing.md,
  },
});
