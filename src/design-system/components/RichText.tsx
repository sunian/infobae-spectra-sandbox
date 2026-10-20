import { Text as RNText } from 'react-native';

import { colors, typography } from '../tokens';

export type RichTextSegment = {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
};

type RichTextProps = {
  segments: readonly RichTextSegment[];
  onLinkPress: (href: string) => void;
};

/** A paragraph of styled runs. A run with an `href` is a link. */
export function RichText({ segments, onLinkPress }: RichTextProps) {
  return (
    <RNText style={[typography.body, { color: colors.textPrimary }]}>
      {segments.map((segment, index) => {
        const { href } = segment;
        return (
          <RNText
            key={index}
            accessibilityRole={href ? 'link' : undefined}
            onPress={href ? () => onLinkPress(href) : undefined}
            style={[
              href && { color: colors.link },
              segment.bold && { fontWeight: '700' },
              segment.italic && { fontStyle: 'italic' },
            ]}
          >
            {segment.text}
          </RNText>
        );
      })}
    </RNText>
  );
}
