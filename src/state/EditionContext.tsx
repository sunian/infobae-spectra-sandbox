import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { loadEdition, saveEdition, type KeyValueStorage } from '@/domain/edition/preference';
import type { EditionId } from '@/domain/infobae/editions';

export type EditionState =
  | { status: 'loading'; edition: null; setEdition: (id: EditionId) => void }
  | { status: 'ready'; edition: EditionId | null; setEdition: (id: EditionId) => void };

const EditionContext = createContext<EditionState | null>(null);

type EditionProviderProps = {
  children: ReactNode;
  storage?: KeyValueStorage;
};

export function EditionProvider({ children, storage = AsyncStorage }: EditionProviderProps) {
  const [loaded, setLoaded] = useState(false);
  const [edition, setEditionState] = useState<EditionId | null>(null);

  useEffect(() => {
    let active = true;
    loadEdition(storage).then((saved) => {
      if (!active) return;
      setEditionState(saved);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [storage]);

  const setEdition = useCallback(
    (id: EditionId) => {
      setEditionState(id);
      saveEdition(storage, id).then((saved) => {
        if (!saved && __DEV__) {
          console.warn(`Could not save the edition "${id}". It is kept for this session only.`);
        }
      });
    },
    [storage],
  );

  const value = useMemo<EditionState>(
    () =>
      loaded
        ? { status: 'ready', edition, setEdition }
        : { status: 'loading', edition: null, setEdition },
    [loaded, edition, setEdition],
  );

  return <EditionContext.Provider value={value}>{children}</EditionContext.Provider>;
}

export function useEdition(): EditionState {
  const value = useContext(EditionContext);
  if (!value) {
    throw new Error('useEdition must be used inside an EditionProvider.');
  }
  return value;
}
