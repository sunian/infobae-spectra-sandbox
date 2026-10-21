import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Text } from './Text';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors, typography } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style);

describe('Text', () => {
  it.each(['title', 'body', 'label', 'headline', 'subheadline', 'caption', 'meta'] as const)(
    'renders the %s variant with its token style',
    async (variant) => {
      await render(<Text variant={variant}>Sample</Text>);
      expect(styleOf('Sample')).toMatchObject(typography[variant]);
    },
  );

  it('uses the primary tone by default and the secondary and link tones when asked', async () => {
    await render(
      <>
        <Text>One</Text>
        <Text tone="secondary">Two</Text>
        <Text tone="link">Three</Text>
      </>,
    );
    expect(styleOf('One').color).toBe(lightColors.textPrimary);
    expect(styleOf('Two').color).toBe(lightColors.textSecondary);
    expect(styleOf('Three').color).toBe(lightColors.link);
  });

  it('applies bold and italic', async () => {
    await render(
      <Text bold italic>
        Strong
      </Text>,
    );
    expect(styleOf('Strong')).toMatchObject({ fontWeight: '700', fontStyle: 'italic' });
  });

  it('limits the lines when numberOfLines is given', async () => {
    await render(<Text numberOfLines={3}>Long</Text>);
    expect(screen.getByText('Long').props.numberOfLines).toBe(3);
  });

  it('can be a header for screen readers', async () => {
    await render(<Text accessibilityRole="header">Top</Text>);
    expect(screen.getByRole('header', { name: 'Top' })).toBeTruthy();
  });
});

describe.each(SCHEMES)('Text in the %s scheme', (scheme, palette) => {
  it('colors each tone from the palette', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <Text>One</Text>
        <Text tone="secondary">Two</Text>
        <Text tone="link">Three</Text>
      </ThemeProvider>,
    );
    expect(styleOf('One').color).toBe(palette.textPrimary);
    expect(styleOf('Two').color).toBe(palette.textSecondary);
    expect(styleOf('Three').color).toBe(palette.link);
  });
});
