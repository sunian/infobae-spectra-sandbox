import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../tokens';
import { Text } from './Text';

type ListFooterProps = {
  state: 'idle' | 'loading' | 'error';
  errorLabel: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ListFooter({ state, errorLabel, retryLabel, onRetry }: ListFooterProps) {
  if (state === 'idle') return null;
  return (
    <View style={styles.footer}>
      {state === 'loading' ? (
        <ActivityIndicator testID="list-footer-loading" color={colors.tabActive} />
      ) : (
        <>
          <Text tone="secondary">{errorLabel}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={retryLabel} onPress={onRetry}>
            <Text bold tone="link">
              {retryLabel}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
});
