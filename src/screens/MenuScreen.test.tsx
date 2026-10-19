import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { KeyValueStorage } from '@/domain/edition/preference';
import { EditionProvider } from '@/state/EditionContext';

import { MenuScreen } from './MenuScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

function storageWith(saved: string): KeyValueStorage {
  return { getItem: jest.fn(async () => saved), setItem: jest.fn(async () => {}) };
}

async function renderMenu(saved = 'colombia') {
  await render(
    <EditionProvider storage={storageWith(saved)}>
      <MenuScreen />
    </EditionProvider>,
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
});
