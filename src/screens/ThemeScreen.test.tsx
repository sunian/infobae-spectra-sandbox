import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { KeyValueStorage } from '@/domain/edition/preference';
import { ThemeProvider } from '@/state/ThemeContext';

import { ThemeScreen } from './ThemeScreen';

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SafeAreaView: (props: { children: unknown }) => <View>{props.children as never}</View> };
});

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: jest.fn() }) }));

function fakeStorage(saved: string | null = null) {
  const storage: KeyValueStorage & { setItem: jest.Mock } = {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
  return storage;
}

async function renderScreen(storage = fakeStorage()) {
  await render(
    <ThemeProvider storage={storage}>
      <ThemeScreen />
    </ThemeProvider>,
  );
  await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(0));
  return storage;
}

const selectedOf = (label: string) =>
  screen.getByRole('button', { name: new RegExp(`^${label}`) }).props.accessibilityState.selected;

describe('ThemeScreen', () => {
  beforeEach(() => mockBack.mockClear());

  it('shows three rows in the order System, Light, Dark', async () => {
    await renderScreen();
    const rows = screen.getAllByRole('button');
    expect(rows).toHaveLength(3);
    const shown = screen.getAllByText(/^(System|Light|Dark)$/);
    expect(shown.map((node) => node.props.children)).toEqual(['System', 'Light', 'Dark']);
  });

  it('marks System on a new install', async () => {
    await renderScreen();
    expect(selectedOf('System')).toBe(true);
    expect(selectedOf('Light')).toBe(false);
    expect(selectedOf('Dark')).toBe(false);
  });

  it('marks the saved choice', async () => {
    await renderScreen(fakeStorage('dark'));
    await waitFor(() => expect(selectedOf('Dark')).toBe(true));
    expect(selectedOf('System')).toBe(false);
  });

  it('applies and saves a tapped choice, then goes back', async () => {
    const storage = await renderScreen();
    await fireEvent.press(screen.getByText('Dark'));
    expect(storage.setItem).toHaveBeenCalledWith('preferences.theme', 'dark');
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the choice when the marked row is tapped again, with no error', async () => {
    const storage = await renderScreen();
    await fireEvent.press(screen.getByText('System'));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('preferences.theme', 'system');
    expect(selectedOf('System')).toBe(true);
  });

  it('gives every row the button role', async () => {
    await renderScreen();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
