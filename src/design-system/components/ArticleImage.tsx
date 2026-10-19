import { StyleSheet, View } from 'react-native';

import { spacing } from '../tokens';
import { Text } from './Text';
import { Thumbnail } from './Thumbnail';

const DEFAULT_ASPECT_RATIO = 16 / 9;

type ArticleImageProps = {
  uri: string;
  caption?: string;
  /** Width divided by height. Use the image's own size so the layout does not jump. */
  aspectRatio?: number;
  altText?: string;
};

export function ArticleImage({ uri, caption, aspectRatio, altText }: ArticleImageProps) {
  return (
    <View style={styles.figure}>
      <Thumbnail
        uri={uri}
        aspectRatio={aspectRatio ?? DEFAULT_ASPECT_RATIO}
        accessibilityLabel={altText}
      />
      {caption ? (
        <Text variant="caption" tone="secondary">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: {
    gap: spacing.xs,
  },
});
