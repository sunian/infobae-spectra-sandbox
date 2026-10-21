import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { KeyValueStorage } from '@/domain/edition/preference';
import { EditionProvider } from '@/state/EditionContext';
import { ThemeProvider } from '@/state/ThemeContext';

import { MenuScreen } from './MenuScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

function storageWith(saved: string): KeyValueStorage {
  return { getItem: jest.fn(async () => saved), setItem: jest.fn(async () => {}) };
}

function themeStorage(saved: string | null): KeyValueStorage {
  return { getItem: jest.fn(async () => saved), setItem: jest.fn(async () => {}) };
}

async function renderMenu(saved = 'colombia', savedTheme: string | null = null) {
  await render(
    <ThemeProvider storage={themeStorage(savedTheme)}>
      <EditionProvider storage={storageWith(saved)}>
        <MenuScreen />
      </EditionProvider>
    </ThemeProvider>,
  );
  await waitFor(() => expect(screen.getByText('Edition')).toBeTruthy());
}

describe('MenuScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('shows the Menu title', async () => {
    await renderMenu();
    expect(screen.getByText('Menu')).toBeTruthy();
  });

  it('shows the current edition name next to the Edition label', async () => {
    await renderMenu('colombia');
    expect(screen.getByText('Edition')).toBeTruthy();
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  it('opens the edition list when the edition row is tapped', async () => {
    await renderMenu('peru');
    expect(screen.getByText('Perú')).toBeTruthy();
    await fireEvent.press(screen.getByText('Edition'));
    expect(mockPush).toHaveBeenCalledWith('/change-edition');
  });

  it('shows the Theme row with System for a new install', async () => {
    await renderMenu();
    expect(screen.getByText('Theme')).toBeTruthy();
    expect(screen.getByText('System')).toBeTruthy();
  });

  it('shows the saved theme choice as the Theme value', async () => {
    await renderMenu('colombia', 'dark');
    await waitFor(() => expect(screen.getByText('Dark')).toBeTruthy());
    expect(screen.queryByText('System')).toBeNull();
  });

  it('opens the theme list when the Theme row is tapped', async () => {
    await renderMenu();
    await fireEvent.press(screen.getByText('Theme'));
    expect(mockPush).toHaveBeenCalledWith('/change-theme');
  });

  it('still opens the edition list from the Edition row', async () => {
    await renderMenu();
    await fireEvent.press(screen.getByText('Edition'));
    expect(mockPush).toHaveBeenCalledWith('/change-edition');
  });
});
