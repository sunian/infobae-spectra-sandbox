export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  tabActive: '#0A5CFF',
  tabInactive: '#8A8A8A',
  border: '#E0E0E0',
  placeholder: '#E6E6E6',
  link: '#0A5CFF',
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

export const radius = {
  sm: 4,
  md: 8,
} as const;

export const sizes = {
  thumbnailWidth: 112,
} as const;

export type TypographyStyle = {
  fontSize: number;
  fontWeight: '400' | '600' | '700';
  fontFamily: string;
  lineHeight?: number;
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700', fontFamily: fonts.bold },
  body: { fontSize: 16, fontWeight: '400', fontFamily: fonts.regular, lineHeight: 23 },
  label: { fontSize: 12, fontWeight: '600', fontFamily: fonts.regular },
  headline: { fontSize: 17, fontWeight: '700', fontFamily: fonts.bold, lineHeight: 22 },
  subheadline: { fontSize: 18, fontWeight: '400', fontFamily: fonts.regular, lineHeight: 25 },
  caption: { fontSize: 12, fontWeight: '400', fontFamily: fonts.regular, lineHeight: 16 },
  meta: { fontSize: 12, fontWeight: '400', fontFamily: fonts.regular },
  heading1: { fontSize: 28, fontWeight: '700', fontFamily: fonts.bold, lineHeight: 34 },
  heading2: { fontSize: 22, fontWeight: '700', fontFamily: fonts.bold, lineHeight: 28 },
  heading3: { fontSize: 19, fontWeight: '700', fontFamily: fonts.bold, lineHeight: 25 },
  heading4: { fontSize: 17, fontWeight: '700', fontFamily: fonts.bold, lineHeight: 23 },
} as const satisfies Record<string, TypographyStyle>;
