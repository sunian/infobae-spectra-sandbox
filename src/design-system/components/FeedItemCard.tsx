import { Pressable, StyleSheet, View } from 'react-native';

import { useThemedStyles } from '../theme';
import { sizes, spacing, type ColorPalette } from '../tokens';
import { Text } from './Text';
import { Thumbnail } from './Thumbnail';

const MAX_LINES = 3;

type FeedItemCardProps = {
  headline: string;
  summary?: string;
  /** Author names and time as one ready string. Empty hides the line. */
  meta: string;
  imageUrl?: string;
  accessibilityLabel: string;
  onPress: () => void;
};

export function FeedItemCard({
  headline,
  summary,
  meta,
  imageUrl,
  accessibilityLabel,
  onPress,
}: FeedItemCardProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.texts}>
        <Text variant="headline" numberOfLines={MAX_LINES}>
          {headline}
        </Text>
        {summary ? (
          <Text tone="secondary" numberOfLines={MAX_LINES}>
            {summary}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="meta" tone="secondary">
            {meta}
          </Text>
        ) : null}
      </View>
      <View style={styles.thumbnail}>
        <Thumbnail uri={imageUrl} />
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    pressed: {
      backgroundColor: colors.surface,
    },
    texts: {
      flex: 1,
      gap: spacing.xs,
    },
    thumbnail: {
      width: sizes.thumbnailWidth,
    },
  });
