import { BASE_URL } from '../infobae/urls';

/** True only for an `http` or `https` address. Blocks `javascript:`, `intent:`, `file:` and more. */
export function isSafeLink(href: string): boolean {
  try {
    const { protocol } = new URL(href.trim());
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** A safe absolute address for a link, or `null`. A site path gets the infobae.com origin. */
export function resolveLink(href: string | undefined): string | null {
  const value = href?.trim();
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return `${BASE_URL}${value}`;
  return isSafeLink(value) ? value : null;
}
