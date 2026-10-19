import {
  EDITION_STORAGE_KEY,
  loadEdition,
  parseStoredEdition,
  saveEdition,
  type KeyValueStorage,
} from './preference';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyValueStorage & { setItem: jest.Mock; getItem: jest.Mock } = {
    getItem: jest.fn(async (key: string) => data.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
  };
  return storage;
}

describe('EDITION_STORAGE_KEY', () => {
  it('is preferences.edition', () => {
    expect(EDITION_STORAGE_KEY).toBe('preferences.edition');
  });
});

describe('parseStoredEdition', () => {
  it('returns the id for a known edition id', () => {
    expect(parseStoredEdition('colombia')).toBe('colombia');
    expect(parseStoredEdition('estados-unidos')).toBe('estados-unidos');
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
    ['text that is not an id', 'not-an-edition'],
    ['an id with spaces around it', ' colombia '],
    ['an unknown id', 'atlantis'],
    ['a number', 42],
    ['an object', { id: 'colombia' }],
    ['a boolean', true],
  ])('returns null for %s', (_label, raw) => {
    expect(parseStoredEdition(raw)).toBeNull();
  });
});

describe('loadEdition', () => {
  it('returns the saved id', async () => {
    const storage = fakeStorage({ [EDITION_STORAGE_KEY]: 'peru' });
    await expect(loadEdition(storage)).resolves.toBe('peru');
  });

  it('returns null when the key is absent', async () => {
    await expect(loadEdition(fakeStorage())).resolves.toBeNull();
  });

  it('returns null for a saved value that is not an edition id', async () => {
    const storage = fakeStorage({ [EDITION_STORAGE_KEY]: 'not-an-edition' });
    await expect(loadEdition(storage)).resolves.toBeNull();
  });

  it('returns null and does not throw when the read rejects', async () => {
    const storage = fakeStorage();
    storage.getItem.mockRejectedValueOnce(new Error('disk error'));
    await expect(loadEdition(storage)).resolves.toBeNull();
  });
});

describe('saveEdition', () => {
  it('writes the id under the storage key exactly once and returns true', async () => {
    const storage = fakeStorage();
    await expect(saveEdition(storage, 'mexico')).resolves.toBe(true);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('preferences.edition', 'mexico');
  });

  it('returns false and does not throw when the write rejects', async () => {
    const storage = fakeStorage();
    storage.setItem.mockRejectedValueOnce(new Error('storage full'));
    await expect(saveEdition(storage, 'mexico')).resolves.toBe(false);
  });

  it('writes nothing when it is not called', async () => {
    const storage = fakeStorage();
    await loadEdition(storage);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
