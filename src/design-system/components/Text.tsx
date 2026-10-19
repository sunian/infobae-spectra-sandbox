import { Text as RNText } from 'react-native';

import { colors, typography } from '../tokens';

const TONES = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  link: colors.link,
} as const;

type TextProps = {
  children: string;
  variant?: keyof typeof typography;
  tone?: keyof typeof TONES;
  bold?: boolean;
  italic?: boolean;
  numberOfLines?: number;
  accessibilityRole?: 'header';
};

export function Text({
  children,
  variant = 'body',
  tone = 'primary',
  bold = false,
  italic = false,
  numberOfLines,
  accessibilityRole,
}: TextProps) {
  return (
    <RNText
      numberOfLines={numberOfLines}
      accessibilityRole={accessibilityRole}
      style={[
        typography[variant],
        { color: TONES[tone] },
        bold && { fontWeight: '700' },
        italic && { fontStyle: 'italic' },
      ]}
    >
      {children}
    </RNText>
  );
}
