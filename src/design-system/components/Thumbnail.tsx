import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useThemedStyles } from '../theme';
import { radius, type ColorPalette } from '../tokens';

type ThumbnailProps = {
  uri?: string | null;
  aspectRatio?: number;
  /** What a screen reader says for the picture. */
  accessibilityLabel?: string;
};

/** A picture in a fixed-shape box. A missing or broken picture shows a neutral block. */
export function Thumbnail({ uri, aspectRatio = 3 / 2, accessibilityLabel }: ThumbnailProps) {
  const styles = useThemedStyles(createStyles);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  // Remember which uri failed, so a new uri gets a fresh try with no effect.
  const showImage = Boolean(uri) && failedUri !== uri;

  return (
    <View testID="thumbnail" style={[styles.box, { aspectRatio }]}>
      {showImage ? (
        <Image
          testID="thumbnail-image"
          source={{ uri: uri as string }}
          accessibilityIgnoresInvertColors
          accessibilityLabel={accessibilityLabel}
          style={styles.fill}
          resizeMode="cover"
          onError={() => setFailedUri(uri ?? null)}
        />
      ) : (
        <View testID="thumbnail-placeholder" style={styles.fill} />
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    box: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: radius.sm,
      backgroundColor: colors.placeholder,
    },
    fill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
