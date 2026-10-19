import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Component, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { EDITION_STORAGE_KEY, type KeyValueStorage } from '@/domain/edition/preference';
import type { EditionId } from '@/domain/infobae/editions';

import { EditionProvider, useEdition } from './EditionContext';

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

const captured: { state: ReturnType<typeof useEdition> | null } = { state: null };

function latest() {
  if (!captured.state) throw new Error('No state captured yet.');
  return captured.state;
}

function Probe({ testID = 'probe' }: { testID?: string }) {
  const state = useEdition();
  useEffect(() => {
    captured.state = state;
  });
  return <Text testID={testID}>{`${state.status}:${state.edition ?? 'none'}`}</Text>;
}

async function renderWith(storage: KeyValueStorage, children: ReactNode = <Probe />) {
  await render(<EditionProvider storage={storage}>{children}</EditionProvider>);
}

describe('EditionProvider', () => {
  it('starts as loading and then becomes ready', async () => {
    await renderWith(fakeStorage());
    await waitFor(() => expect(screen.getByTestId('probe').props.children).toMatch(/^ready:/));
  });

  it('reads a valid saved id', async () => {
    await renderWith(fakeStorage({ [EDITION_STORAGE_KEY]: 'peru' }));
    await waitFor(() => expect(screen.getByTestId('probe').props.children).toBe('ready:peru'));
  });

  it.each([
    ['absent', {}],
    ['an empty string', { [EDITION_STORAGE_KEY]: '' }],
    ['text that is not an id', { [EDITION_STORAGE_KEY]: 'not-an-edition' }],
    ['an unknown id', { [EDITION_STORAGE_KEY]: 'atlantis' }],
  ])('is ready with no edition when the saved value is %s', async (_label, initial) => {
    await renderWith(fakeStorage(initial));
    await waitFor(() => expect(screen.getByTestId('probe').props.children).toBe('ready:none'));
  });

  it('is ready with no edition when the read rejects', async () => {
    const storage = fakeStorage();
    storage.getItem.mockRejectedValueOnce(new Error('disk error'));
    await renderWith(storage);
    await waitFor(() => expect(screen.getByTestId('probe').props.children).toBe('ready:none'));
  });

  it('updates state first and then saves the choice', async () => {
    const storage = fakeStorage();
    await renderWith(storage);
    await waitFor(() => expect(latest().status).toBe('ready'));
    await act(async () => latest().setEdition('colombia'));
    expect(screen.getByTestId('probe').props.children).toBe('ready:colombia');
    await waitFor(() =>
      expect(storage.setItem).toHaveBeenCalledWith(EDITION_STORAGE_KEY, 'colombia'),
    );
  });

  it('keeps the choice for the session when saving fails', async () => {
    const storage = fakeStorage();
    storage.setItem.mockRejectedValue(new Error('storage full'));
    await renderWith(storage);
    await waitFor(() => expect(latest().status).toBe('ready'));
    await act(async () => latest().setEdition('mexico'));
    await waitFor(() => expect(storage.setItem).toHaveBeenCalled());
    expect(screen.getByTestId('probe').props.children).toBe('ready:mexico');
  });

  it('leaves the edition unchanged when the same edition is chosen again', async () => {
    await renderWith(fakeStorage({ [EDITION_STORAGE_KEY]: 'cuba' }));
    await waitFor(() => expect(latest().edition).toBe('cuba'));
    await act(async () => latest().setEdition('cuba'));
    expect(screen.getByTestId('probe').props.children).toBe('ready:cuba');
  });

  it('ends on the last edition after several quick choices', async () => {
    await renderWith(fakeStorage());
    await waitFor(() => expect(latest().status).toBe('ready'));
    const picks: EditionId[] = ['colombia', 'peru', 'mexico'];
    await act(async () => picks.forEach((id) => latest().setEdition(id)));
    expect(screen.getByTestId('probe').props.children).toBe('ready:mexico');
  });

  it('shows the same value to two consumers', async () => {
    await renderWith(
      fakeStorage({ [EDITION_STORAGE_KEY]: 'espana' }),
      <>
        <Probe testID="one" />
        <Probe testID="two" />
      </>,
    );
    await waitFor(() => expect(screen.getByTestId('one').props.children).toBe('ready:espana'));
    expect(screen.getByTestId('two').props.children).toBe('ready:espana');
    await act(async () => latest().setEdition('cuba'));
    expect(screen.getByTestId('one').props.children).toBe('ready:cuba');
    expect(screen.getByTestId('two').props.children).toBe('ready:cuba');
  });
});

class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }
  render() {
    return this.state.message === null ? (
      this.props.children
    ) : (
      <Text testID="error">{this.state.message}</Text>
    );
  }
}

describe('useEdition', () => {
  it('throws outside the provider', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <Boundary>
        <Probe />
      </Boundary>,
    );
    expect(screen.getByTestId('error').props.children).toMatch(/EditionProvider/);
    error.mockRestore();
  });
});
