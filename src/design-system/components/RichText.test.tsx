import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RichText } from './RichText';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style);

describe('RichText', () => {
  it('shows each segment', async () => {
    await render(
      <RichText
        segments={[
          { text: 'uno ', bold: false, italic: false },
          { text: 'dos', bold: true, italic: false },
        ]}
        onLinkPress={() => {}}
      />,
    );
    expect(screen.getByText('uno')).toBeTruthy();
    expect(screen.getByText('dos')).toBeTruthy();
  });

  it('shows bold and italic segments in those styles', async () => {
    await render(
      <RichText
        segments={[
          { text: 'negrita', bold: true, italic: false },
          { text: 'cursiva', bold: false, italic: true },
          { text: 'normal', bold: false, italic: false },
        ]}
        onLinkPress={() => {}}
      />,
    );
    expect(styleOf('negrita').fontWeight).toBe('700');
    expect(styleOf('cursiva').fontStyle).toBe('italic');
    expect(styleOf('normal').fontWeight).not.toBe('700');
  });

  it('makes a segment with an href a link and calls onLinkPress with the address', async () => {
    const onLinkPress = jest.fn();
    await render(
      <RichText
        segments={[{ text: 'aquí', bold: false, italic: false, href: 'https://a.b/c' }]}
        onLinkPress={onLinkPress}
      />,
    );
    await fireEvent.press(screen.getByRole('link', { name: 'aquí' }));
    expect(onLinkPress).toHaveBeenCalledWith('https://a.b/c');
  });

  it('colors a link with the link color', async () => {
    await render(
      <RichText
        segments={[{ text: 'aquí', bold: false, italic: false, href: 'https://a.b/c' }]}
        onLinkPress={() => {}}
      />,
    );
    expect(styleOf('aquí').color).toBe(lightColors.link);
  });

  it('does not make a segment without an href pressable', async () => {
    const onLinkPress = jest.fn();
    await render(
      <RichText
        segments={[{ text: 'texto', bold: false, italic: false }]}
        onLinkPress={onLinkPress}
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    await fireEvent.press(screen.getByText('texto'));
    expect(onLinkPress).not.toHaveBeenCalled();
  });

  it('renders nothing for no segments', async () => {
    await render(<RichText segments={[]} onLinkPress={() => {}} />);
    expect(screen.queryByText(/./)).toBeNull();
  });
});

describe.each(SCHEMES)('RichText in the %s scheme', (scheme, palette) => {
  it('uses the primary color for text and the link color for links', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <RichText
          segments={[
            { text: 'uno ', bold: false, italic: false },
            { text: 'aquí', bold: false, italic: false, href: 'https://a.b/c' },
          ]}
          onLinkPress={() => {}}
        />
      </ThemeProvider>,
    );
    expect(styleOf('aquí').color).toBe(palette.link);
    const paragraph = StyleSheet.flatten(
      screen.getByText('uno', { exact: false }).parent?.props.style,
    );
    expect(paragraph.color).toBe(palette.textPrimary);
  });
});
