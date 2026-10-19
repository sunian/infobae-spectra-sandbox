import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './en.json';

const DEFAULT_LOCALE = 'en';

const i18n = new I18n({ en });
i18n.defaultLocale = DEFAULT_LOCALE;
i18n.locale = getLocales()[0]?.languageCode ?? DEFAULT_LOCALE;
i18n.enableFallback = true;

export type TranslateOptions = Record<string, string | number>;

export function t(key: string, options?: TranslateOptions): string {
  const value = i18n.t(key, { ...options, defaultValue: '' });
  if (value === '') {
    if (__DEV__) {
      console.warn(`Missing translation for key "${key}"`);
    }
    return key;
  }
  return value;
}
