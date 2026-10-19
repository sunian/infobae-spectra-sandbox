import { t } from '@/localization';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export type RelativeTimeParts =
  | { key: 'time.now' }
  | { key: 'time.minutes' | 'time.hours' | 'time.days'; count: number }
  | { date: Date };

/** Picks the band for a time. `now` is a parameter so tests can fix it. */
export function relativeTimeParts(iso: string, now: Date | number): RelativeTimeParts | null {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  const elapsed = new Date(now).getTime() - time;
  if (elapsed < MINUTE) return { key: 'time.now' };
  if (elapsed < HOUR) return { key: 'time.minutes', count: Math.floor(elapsed / MINUTE) };
  if (elapsed < DAY) return { key: 'time.hours', count: Math.floor(elapsed / HOUR) };
  if (elapsed < WEEK) return { key: 'time.days', count: Math.floor(elapsed / DAY) };
  return { date: new Date(time) };
}

/** A short time such as "5 min", "3 h", "2 d", or a short date. `''` for a bad time. */
export function formatRelativeTime(iso: string, now: Date | number = Date.now()): string {
  const parts = relativeTimeParts(iso, now);
  if (!parts) return '';
  if ('date' in parts) {
    return parts.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
  return 'count' in parts ? t(parts.key, { count: parts.count }) : t(parts.key);
}
