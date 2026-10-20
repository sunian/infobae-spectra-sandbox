import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { ContentSource, FeedPage } from '@/domain/content/ContentSource';
import type { KeyValueStorage } from '@/domain/edition/preference';
import type { FeedItem } from '@/domain/infobae/feed';
import { ContentProvider } from '@/state/ContentContext';
import type { EditionId } from '@/domain/infobae/editions';
import { EditionProvider, useEdition } from '@/state/EditionContext';

import { HomeScreen } from './HomeScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

function item(n: number, overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    websiteUrl: `/colombia/${n}/`,
    url: `https://www.infobae.com/colombia/${n}/`,
    headline: `Headline ${n}`,
    summary: `Summary ${n}`,
    authors: ['Ana Pérez', 'Luis Gómez'],
    image: null,
    updatedAt: minutesAgo(5),
    ...overrides,
  };
}

function pageOf(items: FeedItem[], hasMore = true): FeedPage {
  return { items, rawCount: items.length, hasMore };
}

function storageWith(saved: string | null): KeyValueStorage {
  return { getItem: jest.fn(async () => saved), setItem: jest.fn(async () => {}) };
}

function sourceWith(fetchFeedPage: ContentSource['fetchFeedPage']): ContentSource {
  return { fetchFeedPage, fetchArticle: jest.fn() };
}

let setEdition!: (id: EditionId) => void;
function CaptureSetEdition() {
  const { setEdition: set } = useEdition();
  useEffect(() => {
    setEdition = set;
  }, [set]);
  return null;
}

async function renderHome(source: ContentSource, saved: string | null = 'colombia') {
  await render(
    <EditionProvider storage={storageWith(saved)}>
      <ContentProvider source={source}>
        <CaptureSetEdition />
        <HomeScreen />
      </ContentProvider>
    </EditionProvider>,
  );
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('shows the loading state first and then the items', async () => {
    let resolve!: (page: FeedPage) => void;
    const fetchFeedPage = jest.fn(() => new Promise<FeedPage>((res) => (resolve = res)));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByTestId('state-view-loading')).toBeTruthy());
    expect(screen.getByText('Loading articles')).toBeTruthy();
    resolve(pageOf([item(1), item(2)]));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    expect(screen.queryByTestId('state-view-loading')).toBeNull();
    expect(screen.getByText('Headline 2')).toBeTruthy();
  });

  it('shows the edition name as the screen title', async () => {
    await renderHome(sourceWith(async () => pageOf([item(1)])));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  it('shows the summary, the author names and the relative time on each item', async () => {
    await renderHome(sourceWith(async () => pageOf([item(1)])));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    expect(screen.getByText('Summary 1')).toBeTruthy();
    expect(screen.getByText('Ana Pérez, Luis Gómez · 5 min')).toBeTruthy();
  });

  it('shows only the parts of the meta line that exist', async () => {
    await renderHome(
      sourceWith(async () => pageOf([item(1, { authors: [] }), item(2, { updatedAt: '' })])),
    );
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    expect(screen.getByText('5 min')).toBeTruthy();
    expect(screen.getByText('Ana Pérez, Luis Gómez')).toBeTruthy();
  });

  it('opens the article route with the item path when an item is tapped', async () => {
    await renderHome(sourceWith(async () => pageOf([item(7)])));
    await waitFor(() => expect(screen.getByText('Headline 7')).toBeTruthy());
    await fireEvent.press(screen.getByText('Headline 7'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/article',
      params: { path: '/colombia/7/' },
    });
  });

  it('loads the next page at the end of the list and shows no repeated item', async () => {
    const fetchFeedPage = jest.fn(async (_edition, offset: number) =>
      offset === 0 ? pageOf([item(1), item(2)]) : pageOf([item(2), item(3)]),
    );
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    await fireEvent(screen.getByTestId('feed-list'), 'endReached');
    await waitFor(() => expect(screen.getByText('Headline 3')).toBeTruthy());
    expect(fetchFeedPage.mock.calls[1][1]).toBe(2);
    expect(screen.getAllByText('Headline 2')).toHaveLength(1);
  });

  it('shows the refresh indicator and then the new items on pull to refresh', async () => {
    let reload!: (page: FeedPage) => void;
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(pageOf([item(1), item(2)]))
      .mockReturnValueOnce(new Promise<FeedPage>((res) => (reload = res)));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    const control = () => screen.getByTestId('feed-list').props.refreshControl;
    await act(async () => control().props.onRefresh());
    expect(control().props.refreshing).toBe(true);
    await act(async () => reload(pageOf([item(8), item(9)])));
    await waitFor(() => expect(screen.getByText('Headline 8')).toBeTruthy());
    expect(screen.queryByText('Headline 1')).toBeNull();
    expect(control().props.refreshing).toBe(false);
  });

  it('keeps the items and shows a refresh error when the refresh fails', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(pageOf([item(1), item(2)]))
      .mockRejectedValueOnce(new Error('offline'));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    await act(async () => screen.getByTestId('feed-list').props.refreshControl.props.onRefresh());
    await waitFor(() =>
      expect(screen.getByText('We could not refresh. Showing earlier articles.')).toBeTruthy(),
    );
    expect(screen.getByText('Headline 1')).toBeTruthy();
    expect(screen.getByText('Headline 2')).toBeTruthy();
  });

  it('shows only articles of the new edition after the edition changes', async () => {
    const fetchFeedPage = jest.fn(async (edition: { id: string }, _offset: number) =>
      pageOf([
        item(1, { headline: `${edition.id} one` }),
        item(2, { headline: `${edition.id} two` }),
      ]),
    );
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('colombia one')).toBeTruthy());
    expect(screen.getByText('Colombia')).toBeTruthy();

    await act(async () => setEdition('peru'));
    // Not even for a moment: nothing of the old edition shows right after the change.
    expect(screen.queryByText('colombia one')).toBeNull();
    expect(screen.queryByText('colombia two')).toBeNull();
    await waitFor(() => expect(screen.getByText('peru one')).toBeTruthy());
    expect(screen.queryByText('colombia one')).toBeNull();
    expect(screen.getByText('Perú')).toBeTruthy();
    expect(fetchFeedPage.mock.calls.at(-1)?.[0].id).toBe('peru');
  });

  it('shows the loading state while the new edition loads', async () => {
    let resolve!: (page: FeedPage) => void;
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(pageOf([item(1)]))
      .mockReturnValueOnce(new Promise<FeedPage>((res) => (resolve = res)));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    await act(async () => setEdition('mexico'));
    expect(screen.getByTestId('state-view-loading')).toBeTruthy();
    expect(screen.queryByText('Headline 1')).toBeNull();
    await act(async () => resolve(pageOf([item(5)])));
    expect(screen.getByText('Headline 5')).toBeTruthy();
  });

  it('shows an error and a retry action when the first page fails, with no items', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(pageOf([item(1)]));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('We could not load the articles.')).toBeTruthy());
    expect(screen.queryByText('Headline 1')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    expect(screen.queryByText('We could not load the articles.')).toBeNull();
  });

  it('shows the empty message when there are no articles', async () => {
    await renderHome(sourceWith(async () => pageOf([], false)));
    await waitFor(() => expect(screen.getByText('No articles right now.')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('keeps the items and shows a retry at the end when a later page fails', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(pageOf([item(1), item(2)]))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(pageOf([item(3)], false));
    await renderHome(sourceWith(fetchFeedPage));
    await waitFor(() => expect(screen.getByText('Headline 1')).toBeTruthy());
    await fireEvent(screen.getByTestId('feed-list'), 'endReached');
    await waitFor(() => expect(screen.getByText('We could not load more articles.')).toBeTruthy());
    expect(screen.getByText('Headline 2')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('Headline 3')).toBeTruthy());
    expect(screen.queryByText('We could not load more articles.')).toBeNull();
    expect(fetchFeedPage.mock.calls[2][1]).toBe(2);
  });
});
