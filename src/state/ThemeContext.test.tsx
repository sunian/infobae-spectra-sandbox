import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { darkColors, lightColors, useColors } from '@/design-system';
import type { KeyValueStorage } from '@/domain/edition/preference';
import { EditionProvider, useEdition } from './EditionContext';
import type { ThemePreference } from '@/domain/theme/preference';

import { ThemeProvider, useThemePreference, type ThemeState } from './ThemeContext';

const mockUseColorScheme = jest.fn();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

function Probe() {
  const { preference, scheme } = useThemePreference();
  const colors = useColors();
  return <Text testID="probe">{`${preference}:${scheme}:${colors.background}`}</Text>;
}

const probeText = () => screen.getByTestId('probe').props.children as string;

async function renderProvider(children: ReactNode = <Probe />) {
  return render(<ThemeProvider>{children}</ThemeProvider>);
}

describe('ThemeProvider follows the phone', () => {
  beforeEach(() => mockUseColorScheme.mockReset());

  it('uses the dark theme when the phone is dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    await renderProvider();
    expect(probeText()).toBe(`system:dark:${darkColors.background}`);
  });

  it('uses the light theme when the phone is light', async () => {
    mockUseColorScheme.mockReturnValue('light');
    await renderProvider();
    expect(probeText()).toBe(`system:light:${lightColors.background}`);
  });

  it('changes theme without a remount when the phone setting changes', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const { rerender } = await renderProvider();
    expect(probeText()).toContain(':light:');
    mockUseColorScheme.mockReturnValue('dark');
    await rerender(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(probeText()).toBe(`system:dark:${darkColors.background}`);
  });

  it('uses the light theme when the phone gives no setting', async () => {
    mockUseColorScheme.mockReturnValue(null);
    await renderProvider();
    expect(probeText()).toBe(`system:light:${lightColors.background}`);
  });

  it('throws outside a provider', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow(
      'useThemePreference must be used inside a ThemeProvider.',
    );
    spy.mockRestore();
  });
});

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyValueStorage & { getItem: jest.Mock; setItem: jest.Mock } = {
    getItem: jest.fn(async (key: string) => data.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
  };
  return storage;
}

const captured: { state: ThemeState | null } = { state: null };

function Capture() {
  const state = useThemePreference();
  useEffect(() => {
    captured.state = state;
  });
  return null;
}

const latest = () => {
  if (!captured.state) throw new Error('No state captured yet.');
  return captured.state;
};

const tree = (storage: KeyValueStorage) => (
  <ThemeProvider storage={storage}>
    <Probe />
    <Capture />
  </ThemeProvider>
);

async function renderWith(storage: KeyValueStorage) {
  const view = await render(tree(storage));
  await waitFor(() => expect(latest().status).toBe('ready'));
  return view;
}

describe('ThemeProvider with a saved choice', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
    captured.state = null;
  });

  it('is loading until the saved choice is read, then ready', async () => {
    let finishRead: (value: string | null) => void = () => {};
    const storage = fakeStorage();
    storage.getItem.mockReturnValue(
      new Promise<string | null>((resolve) => (finishRead = resolve)),
    );
    await render(
      <ThemeProvider storage={storage}>
        <Capture />
      </ThemeProvider>,
    );
    expect(latest().status).toBe('loading');
    expect(latest().preference).toBe('system');
    await act(async () => finishRead('dark'));
    expect(latest().status).toBe('ready');
    expect(latest().preference).toBe('dark');
  });

  it('keeps a choice made before the saved one is read', async () => {
    let finishRead: (value: string | null) => void = () => {};
    const storage = fakeStorage();
    storage.getItem.mockReturnValue(
      new Promise<string | null>((resolve) => (finishRead = resolve)),
    );
    await render(
      <ThemeProvider storage={storage}>
        <Capture />
      </ThemeProvider>,
    );
    await act(async () => latest().setPreference('light'));
    await act(async () => finishRead('dark'));
    expect(latest().status).toBe('ready');
    expect(latest().preference).toBe('light');
  });

  it('applies a saved dark choice when the phone is light', async () => {
    await renderWith(fakeStorage({ 'preferences.theme': 'dark' }));
    expect(probeText()).toBe(`dark:dark:${darkColors.background}`);
  });

  it('uses system when the saved value is unknown', async () => {
    await renderWith(fakeStorage({ 'preferences.theme': 'sepia' }));
    expect(probeText()).toBe(`system:light:${lightColors.background}`);
  });

  it('uses system, and becomes ready, when the read rejects', async () => {
    const storage = fakeStorage();
    storage.getItem.mockRejectedValueOnce(new Error('disk error'));
    await renderWith(storage);
    expect(probeText()).toBe(`system:light:${lightColors.background}`);
  });

  it('applies a new choice in the same render and saves it', async () => {
    const storage = fakeStorage();
    await renderWith(storage);
    await act(async () => latest().setPreference('dark'));
    expect(probeText()).toBe(`dark:dark:${darkColors.background}`);
    expect(storage.setItem).toHaveBeenCalledWith('preferences.theme', 'dark');
  });

  it('ignores phone changes after a manual choice', async () => {
    const storage = fakeStorage();
    const view = await renderWith(storage);
    await act(async () => latest().setPreference('light'));
    mockUseColorScheme.mockReturnValue('dark');
    await view.rerender(tree(storage));
    expect(probeText()).toBe(`light:light:${lightColors.background}`);
  });

  it('follows the phone again after the choice goes back to system', async () => {
    const storage = fakeStorage({ 'preferences.theme': 'light' });
    const view = await renderWith(storage);
    mockUseColorScheme.mockReturnValue('dark');
    await act(async () => latest().setPreference('system'));
    expect(probeText()).toBe(`system:dark:${darkColors.background}`);
    mockUseColorScheme.mockReturnValue('light');
    await view.rerender(tree(storage));
    expect(probeText()).toBe(`system:light:${lightColors.background}`);
  });

  it('still changes the theme when saving fails', async () => {
    const storage = fakeStorage();
    storage.setItem.mockRejectedValue(new Error('storage full'));
    await renderWith(storage);
    await act(async () => latest().setPreference('dark'));
    expect(probeText()).toBe(`dark:dark:${darkColors.background}`);
  });

  it('ends on the last choice after several quick changes', async () => {
    const storage = fakeStorage();
    await renderWith(storage);
    await act(async () => {
      const choices: ThemePreference[] = ['dark', 'light', 'system', 'dark'];
      choices.forEach((choice) => latest().setPreference(choice));
    });
    expect(probeText()).toBe(`dark:dark:${darkColors.background}`);
    await waitFor(() =>
      expect(storage.setItem).toHaveBeenLastCalledWith('preferences.theme', 'dark'),
    );
  });
});

describe('theme and edition choices', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
    captured.state = null;
  });

  it('stay independent of each other', async () => {
    const themeStorage = fakeStorage();
    const editionStorage = fakeStorage({ 'preferences.edition': 'colombia' });
    const editionCapture: { state: ReturnType<typeof useEdition> | null } = { state: null };
    function CaptureEdition() {
      const state = useEdition();
      useEffect(() => {
        editionCapture.state = state;
      });
      return null;
    }
    await render(
      <ThemeProvider storage={themeStorage}>
        <EditionProvider storage={editionStorage}>
          <Capture />
          <CaptureEdition />
        </EditionProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(latest().status).toBe('ready'));
    await waitFor(() => expect(editionCapture.state?.status).toBe('ready'));
    editionStorage.setItem.mockClear();
    themeStorage.setItem.mockClear();

    await act(async () => latest().setPreference('dark'));
    expect(editionCapture.state?.edition).toBe('colombia');
    expect(editionStorage.setItem).not.toHaveBeenCalled();
    expect(themeStorage.setItem).toHaveBeenCalledWith('preferences.theme', 'dark');

    themeStorage.setItem.mockClear();
    await act(async () => editionCapture.state?.setEdition('peru'));
    expect(latest().preference).toBe('dark');
    expect(themeStorage.setItem).not.toHaveBeenCalled();
    expect(editionStorage.setItem).toHaveBeenCalledWith('preferences.edition', 'peru');
  });
});
