import { darkColors, lightColors, type ColorPalette } from './tokens';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

const PALETTES: [string, ColorPalette][] = [
  ['light', lightColors],
  ['dark', darkColors],
];

describe('palettes', () => {
  it('have the same keys in both schemes', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
    expect(Object.keys(lightColors).sort()).toEqual(
      [
        'background',
        'border',
        'link',
        'placeholder',
        'surface',
        'tabActive',
        'tabInactive',
        'textPrimary',
        'textSecondary',
      ].sort(),
    );
  });

  it.each(PALETTES)('use 6-digit hex values in the %s palette', (_name, palette) => {
    for (const value of Object.values(palette)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('keeps the light values that shipped before dark mode', () => {
    expect(lightColors).toEqual({
      background: '#FFFFFF',
      surface: '#F5F5F5',
      textPrimary: '#111111',
      textSecondary: '#666666',
      tabActive: '#0A5CFF',
      tabInactive: '#8A8A8A',
      border: '#E0E0E0',
      placeholder: '#E6E6E6',
      link: '#0A5CFF',
    });
  });
});

describe.each(PALETTES)('%s palette contrast (WCAG AA)', (_name, palette) => {
  it.each(['background', 'surface'] as const)('gives text and links 4.5:1 on %s', (surface) => {
    for (const key of ['textPrimary', 'textSecondary', 'link'] as const) {
      expect(contrastRatio(palette[key], palette[surface])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('gives the active tab 4.5:1 on the background', () => {
    expect(contrastRatio(palette.tabActive, palette.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('gives the inactive tab 3:1 on the background', () => {
    expect(contrastRatio(palette.tabInactive, palette.background)).toBeGreaterThanOrEqual(3);
  });
});
