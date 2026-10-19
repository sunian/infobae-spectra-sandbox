import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { ContentSource, FeedPage } from '@/domain/content/ContentSource';
import type { Edition, EditionId } from '@/domain/infobae/editions';
import type { FeedItem } from '@/domain/infobae/feed';

import { useFeed } from './useFeed';

function item(n: number): FeedItem {
  return {
    websiteUrl: `/colombia/${n}/`,
    url: `https://www.infobae.com/colombia/${n}/`,
    headline: `Headline ${n}`,
    summary: '',
    authors: [],
    image: null,
    updatedAt: '2026-10-19T10:00:00.000Z',
  };
}

function page(from: number, count = 20, hasMore = true): FeedPage {
  return {
    items: Array.from({ length: count }, (_, i) => item(from + i)),
    rawCount: count,
    hasMore,
  };
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (e: unknown) => void;
};
function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function sourceWith(fetchFeedPage: ContentSource['fetchFeedPage']): ContentSource {
  return { fetchFeedPage, fetchArticle: jest.fn() };
}

describe('useFeed paging', () => {
  it('loads page 0 for the edition and reaches content', async () => {
    const first = deferred<FeedPage>();
    const fetchFeedPage = jest.fn((_edition: Edition, _offset: number) => first.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    expect(result.current.state.status).toBe('loading');
    await act(async () => first.resolve(page(1)));
    expect(result.current.state.status).toBe('content');
    expect(fetchFeedPage).toHaveBeenCalledTimes(1);
    expect(fetchFeedPage.mock.calls[0][0].id).toBe('colombia');
    expect(fetchFeedPage.mock.calls[0][1]).toBe(0);
    expect(result.current.state.items).toHaveLength(20);
  });

  it('loads the next page at the next offset and appends it', async () => {
    const fetchFeedPage = jest.fn(async (_edition, offset: number) => page(offset + 1));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    await waitFor(() => expect(result.current.state.items).toHaveLength(40));
    expect(fetchFeedPage.mock.calls[1][1]).toBe(20);
    expect(result.current.state.items[39].headline).toBe('Headline 40');
  });

  it('makes one request for two quick loadNextPage calls', async () => {
    const next = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(next.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => {
      result.current.loadNextPage();
      result.current.loadNextPage();
    });
    expect(fetchFeedPage).toHaveBeenCalledTimes(2);
    await act(async () => next.resolve(page(21)));
    await waitFor(() => expect(result.current.state.items).toHaveLength(40));
  });

  it('makes no request after the last page', async () => {
    const fetchFeedPage = jest.fn(async () => page(1, 5, false));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    expect(fetchFeedPage).toHaveBeenCalledTimes(1);
    expect(result.current.state.nextPage).toBe('idle');
  });

  it('shows a loading footer during a next-page request and an idle footer after', async () => {
    const next = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [unknown, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(next.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    expect(result.current.state.nextPage).toBe('loading');
    await act(async () => next.resolve(page(21)));
    expect(result.current.state.nextPage).toBe('idle');
  });

  it('does not load the next page while the first page is loading', async () => {
    const first = deferred<FeedPage>();
    const fetchFeedPage = jest.fn((_edition: Edition, _offset: number) => first.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await act(async () => result.current.loadNextPage());
    expect(fetchFeedPage).toHaveBeenCalledTimes(1);
  });

  it('aborts the running request when it unmounts', async () => {
    let signal: AbortSignal | undefined;
    const fetchFeedPage = jest.fn((_e, _o, s?: AbortSignal) => {
      signal = s;
      return new Promise<FeedPage>(() => {});
    });
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(() => useFeed('colombia', source));
    expect(signal?.aborted).toBe(false);
    await view.unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe('useFeed refresh', () => {
  it('requests offset 0, shows refreshing, and replaces the items', async () => {
    const reload = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(reload.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    let outcome: Promise<boolean> | undefined;
    await act(async () => {
      outcome = result.current.refresh();
    });
    expect(result.current.state.refreshing).toBe(true);
    expect(fetchFeedPage.mock.calls[1][1]).toBe(0);
    await act(async () => reload.resolve(page(100, 5)));
    await expect(outcome).resolves.toBe(true);
    expect(result.current.state.refreshing).toBe(false);
    expect(result.current.state.items).toHaveLength(5);
    expect(result.current.state.items[0].headline).toBe('Headline 100');
  });

  it('keeps the items and sets the refresh error when the refresh fails', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockRejectedValueOnce(new Error('offline'));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.refresh();
    });
    expect(ok).toBe(false);
    expect(result.current.state.items).toHaveLength(20);
    expect(result.current.state.refreshing).toBe(false);
    expect(result.current.state.refreshError).toBe(true);
  });

  it('wins over a next-page request that is still running', async () => {
    const next = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(next.promise)
      .mockResolvedValueOnce(page(200, 3, false));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    await act(async () => {
      await result.current.refresh();
    });
    await act(async () => next.resolve(page(21)));
    expect(result.current.state.items.map((item) => item.headline)).toEqual([
      'Headline 200',
      'Headline 201',
      'Headline 202',
    ]);
    expect(result.current.state.nextPage).toBe('idle');
  });

  it('makes one request for two quick refresh calls', async () => {
    const reload = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(reload.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => {
      result.current.refresh();
      result.current.refresh();
    });
    expect(fetchFeedPage).toHaveBeenCalledTimes(2);
    await act(async () => reload.resolve(page(1)));
  });
});

describe('useFeed edition change', () => {
  const peruPage = (from: number) => ({
    ...page(from, 3, false),
    items: page(from, 3).items.map((item) => ({ ...item, headline: `Peru ${item.headline}` })),
  });

  it('resets to loading with no items in the same pass, and loads the new edition', async () => {
    const fetchFeedPage = jest.fn(async (edition: Edition, _offset: number) =>
      edition.id === 'peru' ? peruPage(1) : page(1),
    );
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(
      ({ edition }: { edition: EditionId }) => useFeed(edition, source),
      {
        initialProps: { edition: 'colombia' as EditionId },
      },
    );
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    await view.rerender({ edition: 'peru' });
    expect(view.result.current.state.edition).toBe('peru');
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    expect(fetchFeedPage.mock.calls.at(-1)?.[0].id).toBe('peru');
    expect(fetchFeedPage.mock.calls.at(-1)?.[1]).toBe(0);
    expect(view.result.current.state.items.map((item) => item.headline)).toEqual([
      'Peru Headline 1',
      'Peru Headline 2',
      'Peru Headline 3',
    ]);
  });

  it('shows no item of the old edition after the change', async () => {
    const reload = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(reload.promise);
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(
      ({ edition }: { edition: EditionId }) => useFeed(edition, source),
      {
        initialProps: { edition: 'colombia' as EditionId },
      },
    );
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    await view.rerender({ edition: 'peru' });
    expect(view.result.current.state.status).toBe('loading');
    expect(view.result.current.state.items).toEqual([]);
  });

  it('aborts the old request and ignores its late result', async () => {
    const oldRequest = deferred<FeedPage>();
    let oldSignal: AbortSignal | undefined;
    const fetchFeedPage = jest.fn((edition: Edition, _offset: number, signal?: AbortSignal) => {
      if (edition.id === 'colombia') {
        oldSignal = signal;
        return oldRequest.promise;
      }
      return Promise.resolve(peruPage(1));
    });
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(
      ({ edition }: { edition: EditionId }) => useFeed(edition, source),
      {
        initialProps: { edition: 'colombia' as EditionId },
      },
    );
    await view.rerender({ edition: 'peru' });
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    expect(oldSignal?.aborted).toBe(true);
    await act(async () => oldRequest.resolve(page(500)));
    expect(view.result.current.state.items.map((item) => item.headline)).toEqual([
      'Peru Headline 1',
      'Peru Headline 2',
      'Peru Headline 3',
    ]);
  });

  it('ignores a next page of the old edition that finishes late', async () => {
    const oldNext = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockReturnValueOnce(oldNext.promise)
      .mockResolvedValueOnce(peruPage(1));
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(
      ({ edition }: { edition: EditionId }) => useFeed(edition, source),
      {
        initialProps: { edition: 'colombia' as EditionId },
      },
    );
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    await act(async () => view.result.current.loadNextPage());
    await view.rerender({ edition: 'peru' });
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    await act(async () => oldNext.resolve(page(21)));
    expect(view.result.current.state.items).toHaveLength(3);
    expect(view.result.current.state.nextPage).toBe('idle');
  });

  it('works when the edition changes back', async () => {
    const fetchFeedPage = jest.fn(async (edition: Edition, _offset: number) =>
      edition.id === 'peru' ? peruPage(1) : page(1),
    );
    const source = sourceWith(fetchFeedPage);
    const view = await renderHook(
      ({ edition }: { edition: EditionId }) => useFeed(edition, source),
      {
        initialProps: { edition: 'colombia' as EditionId },
      },
    );
    await waitFor(() => expect(view.result.current.state.status).toBe('content'));
    await view.rerender({ edition: 'peru' });
    await waitFor(() => expect(view.result.current.state.items).toHaveLength(3));
    await view.rerender({ edition: 'colombia' });
    await waitFor(() => expect(view.result.current.state.items).toHaveLength(20));
    expect(view.result.current.state.edition).toBe('colombia');
  });
});

describe('useFeed errors and retry', () => {
  it('shows error when the first page fails, and retry loads it again', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page(1));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.state.items).toEqual([]);
    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    expect(fetchFeedPage).toHaveBeenCalledTimes(2);
    expect(fetchFeedPage.mock.calls[1][1]).toBe(0);
  });

  it('shows loading while a retry runs', async () => {
    const second = deferred<FeedPage>();
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockReturnValueOnce(second.promise);
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('error'));
    await act(async () => result.current.retry());
    expect(result.current.state.status).toBe('loading');
    await act(async () => second.resolve(page(1)));
    expect(result.current.state.status).toBe('content');
  });

  it('shows empty for a first page with no items', async () => {
    const fetchFeedPage = jest.fn(async () => ({ items: [], rawCount: 0, hasMore: false }));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('empty'));
  });

  it('keeps the items and shows a footer error when a next page fails', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockRejectedValueOnce(new Error('offline'));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    await waitFor(() => expect(result.current.state.nextPage).toBe('error'));
    expect(result.current.state.status).toBe('content');
    expect(result.current.state.items).toHaveLength(20);
  });

  it('retryNextPage loads the same offset again and appends', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page(21));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    await waitFor(() => expect(result.current.state.nextPage).toBe('error'));
    await act(async () => result.current.retryNextPage());
    await waitFor(() => expect(result.current.state.items).toHaveLength(40));
    expect(fetchFeedPage.mock.calls[1][1]).toBe(20);
    expect(fetchFeedPage.mock.calls[2][1]).toBe(20);
    expect(result.current.state.nextPage).toBe('idle');
  });

  it('does not retry a failed next page on its own when the list reaches the end again', async () => {
    const fetchFeedPage = jest
      .fn<Promise<FeedPage>, [Edition, number]>()
      .mockResolvedValueOnce(page(1))
      .mockRejectedValue(new Error('offline'));
    const source = sourceWith(fetchFeedPage);
    const { result } = await renderHook(() => useFeed('colombia', source));
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    await act(async () => result.current.loadNextPage());
    await waitFor(() => expect(result.current.state.nextPage).toBe('error'));
    // The error footer makes the list longer, so the list reports the end again.
    await act(async () => result.current.loadNextPage());
    await act(async () => result.current.loadNextPage());
    expect(fetchFeedPage).toHaveBeenCalledTimes(2);
    expect(result.current.state.nextPage).toBe('error');
  });
});
