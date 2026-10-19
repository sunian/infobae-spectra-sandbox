import { isSafeLink, resolveLink } from './links';

describe('isSafeLink', () => {
  it('allows http and https addresses', () => {
    expect(isSafeLink('https://www.infobae.com/tag/a/')).toBe(true);
    expect(isSafeLink('http://example.com')).toBe(true);
    expect(isSafeLink('HTTPS://EXAMPLE.COM')).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'intent://x#Intent;end',
    'file:///etc/passwd',
    'data:text/html,hi',
    'tel:123',
    'mailto:a@b.c',
    '',
    '   ',
    'infobae',
    '//evil.example.com/x',
  ])('rejects %p', (href) => {
    expect(isSafeLink(href)).toBe(false);
  });
});

describe('resolveLink', () => {
  it('returns a safe absolute address as it is', () => {
    expect(resolveLink('https://a.b/c')).toBe('https://a.b/c');
  });

  it('turns a site path into an infobae.com address', () => {
    expect(resolveLink('/colombia/x/')).toBe('https://www.infobae.com/colombia/x/');
  });

  it('returns null for an unsafe or empty address', () => {
    expect(resolveLink('javascript:alert(1)')).toBeNull();
    expect(resolveLink('//evil.example.com')).toBeNull();
    expect(resolveLink('')).toBeNull();
    expect(resolveLink(undefined)).toBeNull();
  });
});
