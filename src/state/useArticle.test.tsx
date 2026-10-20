import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { ContentSource } from '@/domain/content/ContentSource';
import type { Article } from '@/domain/infobae/article';

import { useArticle } from './useArticle';

function article(headline: string): Article {
  return {
    id: headline,
    url: 'https://www.infobae.com/x/',
    headline,
    subheadline: '',
    authors: [],
    publishedAt: '2026-10-19T13:47:56.352Z',
    sectionName: '',
    heroImage: null,
    blocks: [],
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

function sourceWith(fetchArticle: ContentSource['fetchArticle']): ContentSource {
  return { fetchFeedPage: jest.fn(), fetchArticle };
}

describe('useArticle', () => {
  it('goes from loading to content', async () => {
    const pending = deferred<Article>();
    const fetchArticle = jest.fn((_path: string) => pending.promise);
    const source = sourceWith(fetchArticle);
    const { result } = await renderHook(() => useArticle('/a/', source));
    expect(result.current.state).toEqual({ status: 'loading', article: null });
    await act(async () => pending.resolve(article('Uno')));
    expect(result.current.state.status).toBe('content');
    expect(result.current.state.article?.headline).toBe('Uno');
    expect(fetchArticle.mock.calls[0][0]).toBe('/a/');
  });

  it('gives error when the request fails, and retry loads again', async () => {
    const fetchArticle = jest
      .fn<Promise<Article>, [string]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(article('Dos'));
    const source = sourceWith(fetchArticle);
    const { result } = await renderHook(() => useArticle('/a/', source));
    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.state.article).toBeNull();
    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.state.status).toBe('content'));
    expect(result.current.state.article?.headline).toBe('Dos');
    expect(fetchArticle).toHaveBeenCalledTimes(2);
  });

  it('shows loading again while a retry runs', async () => {
    const second = deferred<Article>();
    const fetchArticle = jest
      .fn<Promise<Article>, [string]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockReturnValueOnce(second.promise);
    const source = sourceWith(fetchArticle);
    const { result } = await renderHook(() => useArticle('/a/', source));
    await waitFor(() => expect(result.current.state.status).toBe('error'));
    await act(async () => result.current.retry());
    expect(result.current.state.status).toBe('loading');
    await act(async () => second.resolve(article('Tres')));
    expect(result.current.state.status).toBe('content');
  });

  it('ignores the result of an old path after the path changes', async () => {
    const first = deferred<Article>();
    const second = deferred<Article>();
    const fetchArticle = jest.fn((path: string) =>
      path === '/a/' ? first.promise : second.promise,
    );
    const source = sourceWith(fetchArticle);
    const view = await renderHook(({ path }: { path: string }) => useArticle(path, source), {
      initialProps: { path: '/a/' },
    });
    await view.rerender({ path: '/b/' });
    expect(view.result.current.state.status).toBe('loading');
    await act(async () => first.resolve(article('Viejo')));
    expect(view.result.current.state.status).toBe('loading');
    await act(async () => second.resolve(article('Nuevo')));
    expect(view.result.current.state.article?.headline).toBe('Nuevo');
  });

  it('aborts the request and makes no state update after unmount', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const pending = deferred<Article>();
    let signal: AbortSignal | undefined;
    const fetchArticle = jest.fn((_path: string, s?: AbortSignal) => {
      signal = s;
      return pending.promise;
    });
    const source = sourceWith(fetchArticle);
    const view = await renderHook(() => useArticle('/a/', source));
    await view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => pending.resolve(article('Tarde')));
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('gives error at once for an empty path and makes no request', async () => {
    const fetchArticle = jest.fn();
    const { result } = await renderHook(() => useArticle('', sourceWith(fetchArticle)));
    expect(result.current.state.status).toBe('error');
    expect(fetchArticle).not.toHaveBeenCalled();
  });
});
