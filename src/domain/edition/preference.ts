import { getEdition, type EditionId } from '../infobae/editions';

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export const EDITION_STORAGE_KEY = 'preferences.edition';

/** Returns the edition id when `raw` is a known edition id. Anything else is "no edition". */
export function parseStoredEdition(raw: unknown): EditionId | null {
  if (typeof raw !== 'string') return null;
  return getEdition(raw)?.id ?? null;
}

/** Reads the saved edition. Never rejects. A failed read counts as "no edition". */
export async function loadEdition(storage: KeyValueStorage): Promise<EditionId | null> {
  try {
    return parseStoredEdition(await storage.getItem(EDITION_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Saves the edition id. Never rejects. Returns false when the write fails. */
export async function saveEdition(storage: KeyValueStorage, id: EditionId): Promise<boolean> {
  try {
    await storage.setItem(EDITION_STORAGE_KEY, id);
    return true;
  } catch {
    return false;
  }
}
