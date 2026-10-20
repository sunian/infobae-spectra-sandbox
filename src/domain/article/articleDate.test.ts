import { formatArticleDate } from './articleDate';

describe('formatArticleDate', () => {
  it('shows the date and the time', () => {
    const text = formatArticleDate('2026-10-19T13:47:56.352Z');
    expect(text).toMatch(/2026/);
    expect(text).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns an empty string for an empty or invalid date', () => {
    expect(formatArticleDate('')).toBe('');
    expect(formatArticleDate('not a date')).toBe('');
  });
});
