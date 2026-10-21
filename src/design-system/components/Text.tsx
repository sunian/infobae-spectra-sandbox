import { Text as RNText } from 'react-native';

import { useColors } from '../theme';
import { typography } from '../tokens';

type Tone = 'primary' | 'secondary' | 'link';

type TextProps = {
  children: string;
  variant?: keyof typeof typography;
  tone?: Tone;
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
  const colors = useColors();
  const tones: Record<Tone, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    link: colors.link,
  };
  return (
    <RNText
      numberOfLines={numberOfLines}
      accessibilityRole={accessibilityRole}
      style={[
        typography[variant],
        { color: tones[tone] },
        bold && { fontWeight: '700' },
        italic && { fontStyle: 'italic' },
      ]}
    >
      {children}
    </RNText>
  );
}
