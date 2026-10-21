import type { KeyValueStorage } from '@/domain/edition/preference';

import {
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  loadThemePreference,
  parseThemePreference,
  resolveScheme,
  saveThemePreference,
} from './preference';

describe('resolveScheme', () => {
  it.each(['light', 'dark', null, undefined] as const)(
    'gives light for the light choice when the phone says %s',
    (system) => {
      expect(resolveScheme('light', system)).toBe('light');
    },
  );

  it.each(['light', 'dark', null, undefined] as const)(
    'gives dark for the dark choice when the phone says %s',
    (system) => {
      expect(resolveScheme('dark', system)).toBe('dark');
    },
  );

  it('follows the phone for the system choice', () => {
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', 'dark')).toBe('dark');
  });

  it('gives light for the system choice when the phone has no setting', () => {
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('system', undefined)).toBe('light');
  });
});

function fakeStorage(overrides: Partial<KeyValueStorage> = {}) {
  const storage = {
    getItem: jest.fn(async (): Promise<string | null> => null),
    setItem: jest.fn(async () => {}),
    ...overrides,
  };
  return storage as KeyValueStorage & { getItem: jest.Mock; setItem: jest.Mock };
}

describe('THEME_PREFERENCES', () => {
  it('lists the three choices in the order the Theme list shows them', () => {
    expect(THEME_PREFERENCES).toEqual(['system', 'light', 'dark']);
  });

  it('uses the documented storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('preferences.theme');
  });
});

describe('parseThemePreference', () => {
  it.each(['system', 'light', 'dark'] as const)('returns %s unchanged', (value) => {
    expect(parseThemePreference(value)).toBe(value);
  });

  it.each([['sepia'], [''], ['Dark'], [null], [undefined], [42], [{}], [['dark']]])(
    'reads %p as system',
    (raw) => {
      expect(parseThemePreference(raw)).toBe('system');
    },
  );
});

describe('loadThemePreference', () => {
  it('returns the stored choice', async () => {
    const storage = fakeStorage({ getItem: jest.fn(async () => 'dark') });
    expect(await loadThemePreference(storage)).toBe('dark');
    expect(storage.getItem).toHaveBeenCalledWith('preferences.theme');
  });

  it('returns system when nothing is stored', async () => {
    expect(await loadThemePreference(fakeStorage())).toBe('system');
  });

  it('returns system when the stored value is unknown', async () => {
    const storage = fakeStorage({ getItem: jest.fn(async () => 'sepia') });
    expect(await loadThemePreference(storage)).toBe('system');
  });

  it('returns system, and does not reject, when the read fails', async () => {
    const storage = fakeStorage({
      getItem: jest.fn(async () => {
        throw new Error('disk error');
      }),
    });
    expect(await loadThemePreference(storage)).toBe('system');
  });
});

describe('saveThemePreference', () => {
  it('writes the choice under the theme key and returns true', async () => {
    const storage = fakeStorage();
    expect(await saveThemePreference(storage, 'light')).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith('preferences.theme', 'light');
  });

  it('returns false, and does not reject, when the write fails', async () => {
    const storage = fakeStorage({
      setItem: jest.fn(async () => {
        throw new Error('storage full');
      }),
    });
    expect(await saveThemePreference(storage, 'dark')).toBe(false);
  });
});
