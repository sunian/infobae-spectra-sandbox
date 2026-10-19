import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../tokens';
import { Text } from './Text';

type BannerProps = {
  message: string;
  /** When given, a tap on the banner calls it (for example to hide the banner). */
  onDismiss?: () => void;
};

export function Banner({ message, onDismiss }: BannerProps) {
  const text = <Text variant="label">{message}</Text>;
  return (
    <View accessible={!onDismiss} accessibilityRole="alert" style={styles.banner}>
      {onDismiss ? (
        <Pressable accessibilityRole="button" accessibilityLabel={message} onPress={onDismiss}>
          {text}
        </Pressable>
      ) : (
        text
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
