import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useThemedStyles } from '../theme';
import { spacing, type ColorPalette } from '../tokens';

type ScreenProps = {
  children: ReactNode;
  /** Set to false for a list that runs edge to edge and pads its own rows. */
  padded?: boolean;
  /** Edges that get the safe-area padding. Leave out `top` under a native header. */
  edges?: readonly Edge[];
};

export function Screen({ children, padded = true, edges }: ScreenProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView edges={edges} style={[styles.container, padded && styles.padded]}>
      {children}
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    padded: {
      padding: spacing.md,
    },
  });
