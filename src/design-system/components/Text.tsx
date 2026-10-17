import { Text as RNText } from 'react-native';

import { colors, typography } from '../tokens';

type TextProps = {
  children: string;
  variant?: keyof typeof typography;
};

export function Text({ children, variant = 'body' }: TextProps) {
  return <RNText style={[typography[variant], { color: colors.textPrimary }]}>{children}</RNText>;
}
