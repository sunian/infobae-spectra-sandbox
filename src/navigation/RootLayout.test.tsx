import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import path from 'path';
import { StyleSheet } from 'react-native';

import { darkColors, lightColors } from '@/design-system';
import { fixtureContentSource } from '@/domain/content/fixtureContentSource';
import * as editionScreens from '@/screens/EditionScreen';

const mockUseColorScheme = jest.fn(() => 'light');
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));

const APP_DIR = path.join(__dirname, '..', '..', 'app');
const LIST_TITLE = 'Choose your edition';
const TAB_LABELS = ['My Infobae', 'Media', 'Chat', 'Menu'];

async function launch() {
  return renderRouter(APP_DIR);
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('first launch (no saved edition)', () => {
  it('shows the edition list and no tab bar', async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    for (const label of TAB_LABELS) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  it('shows the five tabs with Home active after one tap on an edition', async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    await fireEvent.press(screen.getByText('Colombia'));
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    for (const label of TAB_LABELS) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText(LIST_TITLE)).toBeNull();
  });

  it('shows the chosen edition name on Home', async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    await fireEvent.press(screen.getByText('Perú'));
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    expect(screen.getByText('Perú')).toBeTruthy();
  });

  it('keeps the list when a tab route is opened before a choice', async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    await act(async () => router.navigate('/media'));
    expect(screen.getByText(LIST_TITLE)).toBeTruthy();
    expect(screen.queryByText('My Infobae')).toBeNull();
  });

  it('shows the tabs once, on the last edition, after several quick taps', async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const rows = ['Colombia', 'Perú', 'México'].map((name) => screen.getByText(name));
    await act(async () => {
      rows.forEach((row) => fireEvent.press(row));
    });
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    expect(screen.getAllByText('My Infobae')).toHaveLength(1);
    expect(screen.getByText('México')).toBeTruthy();
    expect(screen.queryByText(LIST_TITLE)).toBeNull();
  });
});

describe('later launches (saved edition)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the tabs directly and never renders the edition list', async () => {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    const listScreen = jest.spyOn(editionScreens, 'EditionScreen');
    await launch();
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    expect(screen.getByText('Colombia')).toBeTruthy();
    expect(screen.queryByText(LIST_TITLE)).toBeNull();
    expect(listScreen).not.toHaveBeenCalled();
  });

  it('loads the feed for the saved edition at launch, with no call to the live APIs', async () => {
    await AsyncStorage.setItem('preferences.edition', 'peru');
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await launch();
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    expect(screen.getByText('Perú')).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/^El Gobierno anunció/)).toBeTruthy());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty string', ''],
    ['text that is not an id', 'not-an-edition'],
    ['a stored number', '42'],
    ['an unknown id', 'atlantis'],
  ])('shows the edition list when the saved value is %s', async (_label, saved) => {
    await AsyncStorage.setItem('preferences.edition', saved);
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    expect(screen.queryByText('My Infobae')).toBeNull();
  });

  it('shows the edition list when the read rejects', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
  });
});

describe('splash screen', () => {
  const prevent = SplashScreen.preventAutoHideAsync as jest.Mock;
  const hide = SplashScreen.hideAsync as jest.Mock;

  it('is held when the app starts and released once after the saved edition is read', async () => {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    const hidesBefore = hide.mock.calls.length;
    await launch();
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    // The layout holds the splash once, when it loads. Each launch releases it once.
    expect(prevent).toHaveBeenCalledTimes(1);
    expect(hide.mock.calls.length).toBe(hidesBefore + 1);
    expect(Math.min(...prevent.mock.invocationCallOrder)).toBeLessThan(
      Math.max(...hide.mock.invocationCallOrder),
    );
  });

  it('is released once even when the read fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    const hidesBefore = hide.mock.calls.length;
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    expect(hide.mock.calls.length).toBe(hidesBefore + 1);
    jest.restoreAllMocks();
  });
});

describe('splash screen and the theme read', () => {
  const hide = SplashScreen.hideAsync as jest.Mock;
  const getItem = AsyncStorage.getItem as jest.Mock;
  const realGetItem = getItem.getMockImplementation();

  afterEach(() => {
    // restoreAllMocks does not undo an override on a mock that already existed.
    getItem.mockImplementation(realGetItem);
    jest.restoreAllMocks();
  });

  it('stays up while the saved theme is read, and is released once when both reads finish', async () => {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    let finishThemeRead: (value: string | null) => void = () => {};
    getItem.mockImplementation((key: string, ...rest: unknown[]) =>
      key === 'preferences.theme'
        ? new Promise<string | null>((resolve) => (finishThemeRead = resolve))
        : realGetItem?.(key, ...rest),
    );
    const hidesBefore = hide.mock.calls.length;
    await launch();
    await act(async () => {});
    expect(hide.mock.calls.length).toBe(hidesBefore);
    expect(screen.queryByText('My Infobae')).toBeNull();
    await act(async () => finishThemeRead(null));
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    expect(hide.mock.calls.length).toBe(hidesBefore + 1);
  });

  it('shows the saved dark choice on the first screen when the phone is light', async () => {
    await AsyncStorage.setItem('preferences.theme', 'dark');
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const style = StyleSheet.flatten(screen.getByText(LIST_TITLE).props.style);
    expect(style.color).toBe(darkColors.textPrimary);
    const calls = (StatusBar as unknown as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toMatchObject({ style: 'light' });
  });

  it('sets a dark navigation bar for the saved dark choice when the phone is light', async () => {
    await AsyncStorage.setItem('preferences.theme', 'dark');
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const calls = (NavigationBar as unknown as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toMatchObject({ style: 'dark' });
  });

  it('sets a light navigation bar for the saved light choice when the phone is dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    await AsyncStorage.setItem('preferences.theme', 'light');
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const calls = (NavigationBar as unknown as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toMatchObject({ style: 'light' });
    mockUseColorScheme.mockReturnValue('light');
  });
});

describe('changing the edition from the Menu', () => {
  async function openMenuEdition() {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    const app = await launch();
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    await act(async () => router.navigate('/menu'));
    await waitFor(() => expect(screen.getByText('Edition')).toBeTruthy());
    await fireEvent.press(screen.getByText('Edition'));
    // The native header is not in the JS tree, so check the route and the list rows instead.
    await waitFor(() => expect(app.getPathname()).toBe('/change-edition'));
    expect(screen.getByText('Argentina')).toBeTruthy();
    return app;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates Home at once and saves the new edition', async () => {
    const app = await openMenuEdition();
    await fireEvent.press(screen.getByText('México'));
    await waitFor(() => expect(app.getPathname()).toBe('/menu'));
    expect(screen.getByText('México')).toBeTruthy();
    await act(async () => router.navigate('/'));
    await waitFor(() => expect(screen.getByText('México')).toBeTruthy());
    expect(screen.queryByText('Colombia')).toBeNull();
    expect(await AsyncStorage.getItem('preferences.edition')).toBe('mexico');
  });

  it('changes nothing and saves nothing when the list is left without a choice', async () => {
    const app = await openMenuEdition();
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear(); // the mock keeps calls from earlier tests and from the seeding above
    await act(async () => router.back());
    await waitFor(() => expect(app.getPathname()).toBe('/menu'));
    expect(screen.getByText('Colombia')).toBeTruthy();
    expect(setItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem('preferences.edition')).toBe('colombia');
  });
});

describe('opening an article from Home', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps Home as it was after the back action, with no new request', async () => {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    const feedRequest = jest.spyOn(fixtureContentSource, 'fetchFeedPage');
    const app = await launch();
    await waitFor(() => expect(screen.getByText(/^El Gobierno anunció/)).toBeTruthy());
    expect(feedRequest).toHaveBeenCalledTimes(1);

    await act(async () =>
      router.push({
        pathname: '/article',
        params: { path: '/colombia/2026/10/19/fixture-1/' },
      }),
    );
    await waitFor(() => expect(screen.getByText(/^Nota con titulares/)).toBeTruthy());
    expect(app.getPathname()).toBe('/article');

    await act(async () => router.back());
    await waitFor(() => expect(app.getPathname()).toBe('/'));
    expect(screen.getByText(/^El Gobierno anunció/)).toBeTruthy();
    expect(feedRequest).toHaveBeenCalledTimes(1);
  });
});

describe.each([
  ['dark', 'light', darkColors],
  ['light', 'dark', lightColors],
] as const)('with the phone set to %s', (phone, statusBarStyle, palette) => {
  beforeEach(() => mockUseColorScheme.mockReturnValue(phone));
  afterEach(() => mockUseColorScheme.mockReturnValue('light'));

  it(`shows the edition list in the ${phone} colors`, async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const style = StyleSheet.flatten(screen.getByText(LIST_TITLE).props.style);
    expect(style.color).toBe(palette.textPrimary);
  });

  it(`sets the status bar style to ${statusBarStyle}`, async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const calls = (StatusBar as unknown as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toMatchObject({ style: statusBarStyle });
  });

  it(`sets the navigation bar style to ${phone}`, async () => {
    await launch();
    await waitFor(() => expect(screen.getByText(LIST_TITLE)).toBeTruthy());
    const calls = (NavigationBar as unknown as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toMatchObject({ style: phone });
  });

  it(`shows the tabs in the ${phone} colors`, async () => {
    await AsyncStorage.setItem('preferences.edition', 'colombia');
    await launch();
    await waitFor(() => expect(screen.getByText('My Infobae')).toBeTruthy());
    const style = StyleSheet.flatten(screen.getByText('Menu').props.style);
    expect(style.color).toBe(palette.tabInactive);
    expect(StyleSheet.flatten(screen.getByText('Home').props.style).color).toBe(palette.tabActive);
  });
});
