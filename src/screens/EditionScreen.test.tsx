import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { KeyValueStorage } from '@/domain/edition/preference';
import { EDITIONS } from '@/domain/infobae/editions';
import { EditionProvider } from '@/state/EditionContext';

import { EditionScreen } from './EditionScreen';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: jest.fn() }) }));

function fakeStorage(saved: string | null = null) {
  const storage: KeyValueStorage & { setItem: jest.Mock } = {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
  return storage;
}

async function renderFirstLaunch(storage = fakeStorage()) {
  await render(
    <EditionProvider storage={storage}>
      <EditionScreen mode="first-launch" />
    </EditionProvider>,
  );
  await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(0));
  return storage;
}

describe('EditionScreen, first-launch mode', () => {
  it('shows the title', async () => {
    await renderFirstLaunch();
    expect(screen.getByText('Choose your edition')).toBeTruthy();
  });

  it('shows nine rows named by the edition strings, in the order of EDITIONS', async () => {
    await renderFirstLaunch();
    const names = EDITIONS.map((edition) => edition.name);
    expect(names).toHaveLength(9);
    expect(screen.getAllByRole('button')).toHaveLength(9);
    const shown = screen.getAllByText(new RegExp(`^(${names.join('|')})$`));
    expect(shown.map((node) => node.props.children)).toEqual(names);
  });

  it('shows no back control', async () => {
    await renderFirstLaunch();
    expect(screen.queryByLabelText(/back/i)).toBeNull();
  });

  it('saves the tapped edition once', async () => {
    const storage = await renderFirstLaunch();
    await fireEvent.press(screen.getByText('Colombia'));
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
    expect(storage.setItem).toHaveBeenCalledWith('preferences.edition', 'colombia');
  });

  it('keeps the last edition after several quick taps and does not throw', async () => {
    const storage = await renderFirstLaunch();
    await fireEvent.press(screen.getByText('Colombia'));
    await fireEvent.press(screen.getByText('Perú'));
    await fireEvent.press(screen.getByText('México'));
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(3));
    expect(storage.setItem).toHaveBeenLastCalledWith('preferences.edition', 'mexico');
  });
});

async function renderChange(saved = 'colombia') {
  const storage = fakeStorage(saved);
  await render(
    <EditionProvider storage={storage}>
      <EditionScreen mode="change" />
    </EditionProvider>,
  );
  await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(0));
  return storage;
}

describe('EditionScreen, change mode', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('shows the same editions in the same order as first-launch mode', async () => {
    const names = EDITIONS.map((edition) => edition.name);
    const pattern = new RegExp(`^(${names.join('|')})$`);
    await renderChange();
    const changeOrder = screen.getAllByText(pattern).map((node) => node.props.children);
    expect(changeOrder).toEqual(names);
  });

  it('leaves the title to the stack header, so it is not shown twice', async () => {
    await renderChange();
    expect(screen.queryByText('Change edition')).toBeNull();
    expect(screen.queryByText('Choose your edition')).toBeNull();
  });

  it('marks only the current edition', async () => {
    await renderChange('colombia');
    expect(screen.getAllByRole('button', { selected: true })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Colombia/, selected: true })).toBeTruthy();
  });

  it('saves a different edition and goes back', async () => {
    const storage = await renderChange('colombia');
    await fireEvent.press(screen.getByText('México'));
    await waitFor(() =>
      expect(storage.setItem).toHaveBeenCalledWith('preferences.edition', 'mexico'),
    );
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('changes nothing and saves nothing when the reader leaves without a choice', async () => {
    const storage = await renderChange('colombia');
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Colombia/, selected: true })).toBeTruthy();
  });

  it('keeps the selection when the current edition is tapped again', async () => {
    await renderChange('colombia');
    await fireEvent.press(screen.getByText('Colombia'));
    expect(screen.getByRole('button', { name: /Colombia/, selected: true })).toBeTruthy();
  });
});
