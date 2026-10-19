import { StyleSheet, View } from 'react-native';

import { spacing } from '../tokens';
import { Text } from './Text';

type ListHeaderProps = {
  title: string;
};

export function ListHeader({ title }: ListHeaderProps) {
  return (
    <View style={styles.header}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
