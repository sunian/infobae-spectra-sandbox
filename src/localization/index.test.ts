import en from './en.json';

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`),
  );
}

function loadWithDeviceLanguage(languageCode: string | null) {
  jest.resetModules();
  jest.doMock('expo-localization', () => ({
    getLocales: () => [{ languageCode }],
  }));
  return jest.requireActual<typeof import('./index')>('./index');
}

describe('t()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the English string for a known key', () => {
    const { t } = loadWithDeviceLanguage('en');
    expect(t('tabs.home')).toBe('Home');
  });

  it('fills in placeholders from options', () => {
    const { t } = loadWithDeviceLanguage('en');
    expect(t('time.minutes', { count: 5 })).toBe('5 min');
    expect(t('article.by', { authors: 'Ana Pérez' })).toBe('By Ana Pérez');
  });

  it('resolves every key in en.json to a non-empty string', () => {
    const { t } = loadWithDeviceLanguage('en');
    for (const key of flatten(en)) {
      expect(t(key)).not.toBe('');
      expect(t(key)).not.toBe(key);
    }
  });

  it('falls back to English when the device language is not supported', () => {
    const { t } = loadWithDeviceLanguage('fr');
    expect(t('tabs.home')).toBe('Home');
  });

  it('falls back to English when the device language is unknown', () => {
    const { t } = loadWithDeviceLanguage(null);
    expect(t('tabs.home')).toBe('Home');
  });

  it('returns the key and warns once in dev for a key missing everywhere', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { t } = loadWithDeviceLanguage('en');
    expect(t('does.not.exist')).toBe('does.not.exist');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
