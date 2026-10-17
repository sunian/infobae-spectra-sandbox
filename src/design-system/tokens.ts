export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  tabActive: '#0A5CFF',
  tabInactive: '#8A8A8A',
  border: '#E0E0E0',
} as const;

export const fonts = {
  regular: 'System',
  bold: 'System',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type TypographyStyle = {
  fontSize: number;
  fontWeight: '400' | '600' | '700';
  fontFamily: string;
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700', fontFamily: fonts.bold },
  body: { fontSize: 16, fontWeight: '400', fontFamily: fonts.regular },
  label: { fontSize: 12, fontWeight: '600', fontFamily: fonts.regular },
} as const satisfies Record<string, TypographyStyle>;
