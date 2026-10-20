import { getEdition } from '../infobae/editions';
import { articleUrl, feedListUrl } from '../infobae/urls';
import feedList from '../infobae/__fixtures__/feed-list.json';
import story from '../infobae/__fixtures__/story.json';
import { ContentError, PAGE_SIZE } from './ContentSource';
import { liveContentSource } from './liveContentSource';

const colombia = getEdition('colombia')!;

function abortError(): Error {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
}

/** A fetch mock that answers with `body`, and rejects with an AbortError when the signal aborts. */
function mockFetch(respond: () => Promise<Partial<Response>>) {
  return jest.spyOn(globalThis, 'fetch').mockImplementation((_input, init) => {
    return new Promise((resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(abortError()));
      respond().then(resolve as (value: Partial<Response>) => void, reject);
    }) as Promise<Response>;
  });
}

const ok = (body: unknown) => () =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });

function feedOf(count: number) {
  return {
    content_elements: Array.from({ length: count }, (_, index) => ({
      website_url: `/colombia/${index}/`,
      headlines: { basic: `Headline ${index}` },
    })),
  };
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('liveContentSource.fetchFeedPage', () => {
  it('calls the feed list url for the edition, offset and page size', async () => {
    const spy = mockFetch(ok(feedList));
    await liveContentSource.fetchFeedPage(colombia, 40);
    expect(spy.mock.calls[0][0]).toBe(feedListUrl(colombia, 40, PAGE_SIZE));
  });

  it('reports hasMore when the raw count fills the page', async () => {
    mockFetch(ok(feedOf(PAGE_SIZE)));
    const page = await liveContentSource.fetchFeedPage(colombia, 0);
    expect(page.rawCount).toBe(PAGE_SIZE);
    expect(page.hasMore).toBe(true);
  });

  it('reports no more pages when the raw count is below the page size', async () => {
    mockFetch(ok(feedOf(PAGE_SIZE - 1)));
    const page = await liveContentSource.fetchFeedPage(colombia, 0);
    expect(page.hasMore).toBe(false);
  });

  it('still counts dropped items toward hasMore', async () => {
    mockFetch(ok(feedList));
    const page = await liveContentSource.fetchFeedPage(colombia, 0);
    expect(page.items.length).toBeLessThan(page.rawCount);
  });

  it('rejects with kind http for a non-2xx status', async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 503 }));
    await expect(liveContentSource.fetchFeedPage(colombia, 0)).rejects.toMatchObject({
      name: 'ContentError',
      kind: 'http',
    });
  });

  it('rejects with kind network when fetch fails', async () => {
    mockFetch(() => Promise.reject(new TypeError('Network request failed')));
    await expect(liveContentSource.fetchFeedPage(colombia, 0)).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('rejects with kind parse for invalid JSON', async () => {
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('x')) }),
    );
    await expect(liveContentSource.fetchFeedPage(colombia, 0)).rejects.toMatchObject({
      kind: 'parse',
    });
  });

  it('rejects with kind timeout after 15 seconds', async () => {
    jest.useFakeTimers();
    mockFetch(() => new Promise(() => {}));
    const result = liveContentSource.fetchFeedPage(colombia, 0);
    const assertion = expect(result).rejects.toMatchObject({ kind: 'timeout' });
    jest.advanceTimersByTime(15_000);
    await assertion;
  });

  it('rejects with an AbortError, not a ContentError, when the caller aborts', async () => {
    mockFetch(() => new Promise(() => {}));
    const controller = new AbortController();
    const result = liveContentSource.fetchFeedPage(colombia, 0, controller.signal);
    controller.abort();
    const error = await result.catch((caught: unknown) => caught);
    expect(error).not.toBeInstanceOf(ContentError);
    expect((error as Error).name).toBe('AbortError');
  });

  it('sends no credentials, authorization or cookie', async () => {
    const spy = mockFetch(ok(feedList));
    await liveContentSource.fetchFeedPage(colombia, 0);
    const init = (spy.mock.calls[0][1] ?? {}) as RequestInit;
    const headers = Object.keys((init.headers ?? {}) as Record<string, string>).map((name) =>
      name.toLowerCase(),
    );
    expect(init.credentials).toBe('omit');
    expect(headers).not.toContain('authorization');
    expect(headers).not.toContain('cookie');
  });
});

describe('liveContentSource.fetchArticle', () => {
  it('calls the article url and maps the story', async () => {
    const spy = mockFetch(ok(story));
    const article = await liveContentSource.fetchArticle('/colombia/2026/10/19/a/');
    expect(spy.mock.calls[0][0]).toBe(articleUrl('/colombia/2026/10/19/a/'));
    expect(article.headline).toMatch(/^Accidente aéreo/);
  });

  it('rejects with kind parse when the response has no _id', async () => {
    mockFetch(ok({ headlines: { basic: 'x' } }));
    await expect(liveContentSource.fetchArticle('/x/')).rejects.toMatchObject({ kind: 'parse' });
  });

  it('rejects with kind http for a 404', async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 404 }));
    await expect(liveContentSource.fetchArticle('/x/')).rejects.toMatchObject({ kind: 'http' });
  });
});
