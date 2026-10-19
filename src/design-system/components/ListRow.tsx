import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../tokens';
import { Text } from './Text';

type ListRowProps = {
  label: string;
  value?: string;
  selected?: boolean;
  onPress: () => void;
};

const SELECTED_MARK = '✓';

export function ListRow({ label, value, selected = false, onPress }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.labels}>
        <Text>{label}</Text>
        {value ? <Text variant="label">{value}</Text> : null}
      </View>
      {selected ? <Text variant="title">{SELECTED_MARK}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  labels: {
    flex: 1,
    gap: spacing.xs,
  },
});
