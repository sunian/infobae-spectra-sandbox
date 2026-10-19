import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { KeyValueStorage } from '@/domain/edition/preference';
import { EDITIONS } from '@/domain/infobae/editions';
import { EditionProvider } from '@/state/EditionContext';

import { EditionScreen } from './EditionScreen';

function fakeStorage() {
  const storage: KeyValueStorage & { setItem: jest.Mock } = {
    getItem: jest.fn(async () => null),
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
