import type { KeyValueStorage } from '../edition/preference';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'preferences.theme';

/** The choices in the order the Theme list shows them. */
export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/**
 * The scheme to draw. A manual choice wins. The system choice follows the phone, and falls back to
 * light when the phone reports no setting.
 */
export function resolveScheme(
  preference: ThemePreference,
  system: ColorScheme | null | undefined,
): ColorScheme {
  if (preference === 'system') return system ?? 'light';
  return preference;
}

/** Returns the choice when `raw` is one of the three known values. Anything else is `system`. */
export function parseThemePreference(raw: unknown): ThemePreference {
  return THEME_PREFERENCES.find((preference) => preference === raw) ?? 'system';
}

/** Reads the saved choice. Never rejects. A failed read counts as `system`. */
export async function loadThemePreference(storage: KeyValueStorage): Promise<ThemePreference> {
  try {
    return parseThemePreference(await storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

/** Saves the choice. Never rejects. Returns false when the write fails. */
export async function saveThemePreference(
  storage: KeyValueStorage,
  preference: ThemePreference,
): Promise<boolean> {
  try {
    await storage.setItem(THEME_STORAGE_KEY, preference);
    return true;
  } catch {
    return false;
  }
}
