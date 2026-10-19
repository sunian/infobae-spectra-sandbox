import { formatRelativeTime, relativeTimeParts } from './relativeTime';

const now = new Date('2026-10-19T12:00:00.000Z');
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('relativeTimeParts', () => {
  it('uses now under a minute', () => {
    expect(relativeTimeParts(ago(30 * SECOND), now)).toEqual({ key: 'time.now' });
  });

  it('uses minutes under an hour', () => {
    expect(relativeTimeParts(ago(5 * MINUTE), now)).toEqual({ key: 'time.minutes', count: 5 });
    expect(relativeTimeParts(ago(59 * MINUTE), now)).toEqual({ key: 'time.minutes', count: 59 });
  });

  it('uses hours under a day', () => {
    expect(relativeTimeParts(ago(60 * MINUTE), now)).toEqual({ key: 'time.hours', count: 1 });
    expect(relativeTimeParts(ago(23 * HOUR), now)).toEqual({ key: 'time.hours', count: 23 });
  });

  it('uses days under a week', () => {
    expect(relativeTimeParts(ago(24 * HOUR), now)).toEqual({ key: 'time.days', count: 1 });
    expect(relativeTimeParts(ago(6 * DAY), now)).toEqual({ key: 'time.days', count: 6 });
  });

  it('uses a date from a week on', () => {
    expect(relativeTimeParts(ago(8 * DAY), now)).toEqual({ date: new Date(ago(8 * DAY)) });
  });

  it('treats a time in the future as now', () => {
    expect(relativeTimeParts(new Date(now.getTime() + HOUR).toISOString(), now)).toEqual({
      key: 'time.now',
    });
  });

  it('returns null for an empty or invalid time', () => {
    expect(relativeTimeParts('', now)).toBeNull();
    expect(relativeTimeParts('not a date', now)).toBeNull();
  });
});

describe('formatRelativeTime', () => {
  it('renders the short forms', () => {
    expect(formatRelativeTime(ago(30 * SECOND), now)).toBe('now');
    expect(formatRelativeTime(ago(5 * MINUTE), now)).toBe('5 min');
    expect(formatRelativeTime(ago(3 * HOUR), now)).toBe('3 h');
    expect(formatRelativeTime(ago(2 * DAY), now)).toBe('2 d');
  });

  it('renders a short date after a week', () => {
    const text = formatRelativeTime(ago(8 * DAY), now);
    expect(text).not.toBe('');
    expect(text).not.toMatch(/ d$/);
  });

  it('renders an empty string for an invalid time', () => {
    expect(formatRelativeTime('', now)).toBe('');
    expect(formatRelativeTime('nope', now)).toBe('');
  });
});
