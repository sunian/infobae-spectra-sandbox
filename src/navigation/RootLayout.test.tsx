import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import path from 'path';

const APP_DIR = path.join(__dirname, '..', '..', 'app');
const LIST_TITLE = 'Choose your edition';
const TAB_LABELS = ['My Infobae', 'Media', 'Chat', 'Menu'];

async function launch() {
  await renderRouter(APP_DIR);
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
