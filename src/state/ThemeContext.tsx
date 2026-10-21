import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { ThemeProvider as PaletteProvider } from '@/design-system';
import type { KeyValueStorage } from '@/domain/edition/preference';
import {
  loadThemePreference,
  resolveScheme,
  saveThemePreference,
  type ColorScheme,
  type ThemePreference,
} from '@/domain/theme/preference';

export type ThemeState = {
  status: 'loading' | 'ready';
  preference: ThemePreference;
  scheme: ColorScheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  storage?: KeyValueStorage;
};

export function ThemeProvider({ children, storage = AsyncStorage }: ThemeProviderProps) {
  const system = useColorScheme();
  const [loaded, setLoaded] = useState(false);
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  // A choice made before the saved one is read wins over the saved one.
  const chosen = useRef(false);

  useEffect(() => {
    let active = true;
    loadThemePreference(storage).then((saved) => {
      if (!active) return;
      if (!chosen.current) setPreferenceState(saved);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [storage]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      chosen.current = true;
      setPreferenceState(next);
      saveThemePreference(storage, next).then((saved) => {
        if (!saved && __DEV__) {
          console.warn(`Could not save the theme "${next}". It is kept for this session only.`);
        }
      });
    },
    [storage],
  );

  const scheme = resolveScheme(preference, system);

  const value = useMemo<ThemeState>(
    () => ({ status: loaded ? 'ready' : 'loading', preference, scheme, setPreference }),
    [loaded, preference, scheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaletteProvider scheme={scheme}>{children}</PaletteProvider>
    </ThemeContext.Provider>
  );
}

export function useThemePreference(): ThemeState {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useThemePreference must be used inside a ThemeProvider.');
  }
  return value;
}
