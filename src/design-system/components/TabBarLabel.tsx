import { type ColorValue, StyleSheet, Text as RNText, View } from 'react-native';

import { t } from '../../localization';
import { useColors } from '../theme';
import { typography } from '../tokens';

type TabBarLabelProps = {
  labelKey: string;
  focused: boolean;
};

export function TabBarLabel({ labelKey, focused }: TabBarLabelProps) {
  const colors = useColors();
  const color = focused ? colors.tabActive : colors.tabInactive;
  return <RNText style={[typography.label, { color }]}>{t(labelKey)}</RNText>;
}

type TabBarIconProps = {
  color: ColorValue;
  size: number;
};

export function tabBarIcon({ color, size }: TabBarIconProps) {
  return (
    <View style={[styles.dot, { backgroundColor: color, width: size / 2, height: size / 2 }]} />
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
  },
});
