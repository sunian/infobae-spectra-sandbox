import { Text } from './Text';

const VARIANTS = ['heading1', 'heading2', 'heading3', 'heading4'] as const;

type HeadingProps = {
  /** 1 is the biggest. Levels above 4 look like level 4. A level outside 1 to 6 is clamped. */
  level: number;
  children: string;
};

export function Heading({ level, children }: HeadingProps) {
  const index = Math.min(VARIANTS.length, Math.max(1, Math.round(level))) - 1;
  return (
    <Text variant={VARIANTS[index]} accessibilityRole="header">
      {children}
    </Text>
  );
}
