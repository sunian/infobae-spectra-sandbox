import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../tokens';
import { Text } from './Text';

type StateViewProps = {
  kind: 'loading' | 'empty' | 'error';
  message?: string;
  /** The label of the retry button. The button shows only for `error` and only with `onAction`. */
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ kind, message, actionLabel, onAction }: StateViewProps) {
  return (
    <View style={styles.center}>
      {kind === 'loading' ? (
        <ActivityIndicator
          testID="state-view-loading"
          accessibilityLabel={message}
          color={colors.tabActive}
          size="large"
        />
      ) : null}
      {message ? <Text tone="secondary">{message}</Text> : null}
      {kind === 'error' && actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text bold tone="link">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
});
