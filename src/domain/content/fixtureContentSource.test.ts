import { formatRelativeTime } from '../feed/relativeTime';
import { getEdition } from '../infobae/editions';
import { ContentError, PAGE_SIZE } from './ContentSource';
import { createFixtureContentSource } from './fixtureContentSource';

const edition = (id: string) => getEdition(id)!;

afterEach(() => {
  jest.useRealTimers();
});

describe('fixtureContentSource feed', () => {
  it('serves two pages of content for Colombia, then an empty page', async () => {
    const source = createFixtureContentSource();
    const first = await source.fetchFeedPage(edition('colombia'), 0);
    const second = await source.fetchFeedPage(edition('colombia'), PAGE_SIZE);
    const third = await source.fetchFeedPage(edition('colombia'), PAGE_SIZE * 2);
    expect(first.rawCount).toBe(PAGE_SIZE);
    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(first.hasMore).toBe(true);
    expect(second.rawCount).toBe(PAGE_SIZE);
    expect(second.items.length).toBeLessThan(PAGE_SIZE);
    expect(second.hasMore).toBe(true);
    expect(third.items).toEqual([]);
    expect(third.hasMore).toBe(false);
  });

  it('repeats exactly one item of page 1 on page 2', async () => {
    const source = createFixtureContentSource();
    const first = await source.fetchFeedPage(edition('colombia'), 0);
    const second = await source.fetchFeedPage(edition('colombia'), PAGE_SIZE);
    const firstPaths = new Set(first.items.map((item) => item.websiteUrl));
    const repeats = second.items.filter((item) => firstPaths.has(item.websiteUrl));
    expect(repeats).toHaveLength(1);
  });

  it('includes items with a missing summary, author, or image', async () => {
    const page = await createFixtureContentSource().fetchFeedPage(edition('colombia'), 0);
    expect(page.items.some((item) => item.summary === '')).toBe(true);
    expect(page.items.some((item) => item.authors.length === 0)).toBe(true);
    expect(page.items.some((item) => item.image === null)).toBe(true);
  });

  it('dates items relative to now, in the middle of a time band', async () => {
    const source = createFixtureContentSource();
    const first = await source.fetchFeedPage(edition('colombia'), 0);
    const second = await source.fetchFeedPage(edition('colombia'), PAGE_SIZE);
    expect(formatRelativeTime(first.items[0].updatedAt)).toBe('1 h');
    expect(formatRelativeTime(first.items[2].updatedAt)).toBe('2 h');
    expect(formatRelativeTime(second.items[5].updatedAt)).toMatch(/^\d d$/);
  });

  it('always fails for Cuba', async () => {
    const source = createFixtureContentSource();
    await expect(source.fetchFeedPage(edition('cuba'), 0)).rejects.toBeInstanceOf(ContentError);
    await expect(source.fetchFeedPage(edition('cuba'), 0)).rejects.toBeInstanceOf(ContentError);
  });

  it('returns zero items for Centroamérica', async () => {
    const page = await createFixtureContentSource().fetchFeedPage(edition('centroamerica'), 0);
    expect(page).toEqual({ items: [], rawCount: 0, hasMore: false });
  });

  it('fails Mexico page 2 once, then works', async () => {
    const source = createFixtureContentSource();
    await expect(source.fetchFeedPage(edition('mexico'), 0)).resolves.toBeDefined();
    await expect(source.fetchFeedPage(edition('mexico'), PAGE_SIZE)).rejects.toBeInstanceOf(
      ContentError,
    );
    await expect(source.fetchFeedPage(edition('mexico'), PAGE_SIZE)).resolves.toBeDefined();
  });

  it('answers Mundo page 1 after about 6 seconds', async () => {
    jest.useFakeTimers();
    const source = createFixtureContentSource();
    let done = false;
    const result = source.fetchFeedPage(edition('mundo'), 0).then((page) => {
      done = true;
      return page;
    });
    await jest.advanceTimersByTimeAsync(5900);
    expect(done).toBe(false);
    await jest.advanceTimersByTimeAsync(200);
    expect(done).toBe(true);
    expect((await result).items.length).toBeGreaterThan(0);
  });

  it('rejects with an AbortError when aborted during the Mundo delay', async () => {
    jest.useFakeTimers();
    const controller = new AbortController();
    const result = createFixtureContentSource().fetchFeedPage(
      edition('mundo'),
      0,
      controller.signal,
    );
    const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
  });

  it('behaves like Colombia for any other edition', async () => {
    const page = await createFixtureContentSource().fetchFeedPage(edition('peru'), 0);
    expect(page.items).toHaveLength(PAGE_SIZE);
  });
});

describe('fixtureContentSource article', () => {
  it('returns an article for each feed item path', async () => {
    const source = createFixtureContentSource();
    const page = await source.fetchFeedPage(edition('colombia'), 0);
    const known = page.items.filter((item) => !item.websiteUrl.includes('sin-contenido'));
    for (const item of known.slice(0, 6)) {
      const article = await source.fetchArticle(item.websiteUrl);
      expect(article.headline).not.toBe('');
    }
  });

  it('includes an article with a header, with images, and with a video that is left out', async () => {
    const source = createFixtureContentSource();
    const page = await source.fetchFeedPage(edition('colombia'), 0);
    const articles = await Promise.all(
      page.items.slice(0, 3).map((item) => source.fetchArticle(item.websiteUrl)),
    );
    const types = articles.map((article) => article.blocks.map((block) => block.type));
    expect(types.some((list) => list.includes('header'))).toBe(true);
    expect(types.filter((list) => list.includes('image')).length).toBeGreaterThan(0);
    expect(types.every((list) => list.every((type) => type !== ('video' as string)))).toBe(true);
  });

  it('rejects with kind http for an unknown path and for the no-content item', async () => {
    const source = createFixtureContentSource();
    await expect(source.fetchArticle('/nowhere/')).rejects.toMatchObject({ kind: 'http' });
    const page = await source.fetchFeedPage(edition('colombia'), 0);
    const empty = page.items.find((item) => item.websiteUrl.includes('sin-contenido'))!;
    await expect(source.fetchArticle(empty.websiteUrl)).rejects.toMatchObject({ kind: 'http' });
  });
});
