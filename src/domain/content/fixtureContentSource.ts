import { Image } from 'react-native';

import { mapArticle, type ArcStory } from '../infobae/article';
import type { Edition } from '../infobae/editions';
import { mapFeedList, type ArcFeedList } from '../infobae/feed';
import { ContentError, PAGE_SIZE, type ContentSource, type FeedPage } from './ContentSource';
import article1 from './__fixtures__/article-1.json';
import article2 from './__fixtures__/article-2.json';
import article3 from './__fixtures__/article-3.json';
import feedPage1 from './__fixtures__/feed-page-1.json';
import feedPage2 from './__fixtures__/feed-page-2.json';

/*
 * Offline content for Jest and the Maestro screenshot build. The edition picks the scenario,
 * so a screenshot flow needs no hidden control:
 *   Cuba: always fails. Centroamerica: empty. Mexico: page 2 fails once. Mundo: slow first page (6 s, so a screenshot flow can catch the loading state).
 *   Anything else: two pages of content, then an empty page.
 */

const SLOW_MS = 6000;
const ARTICLES = [article1, article2, article3] as unknown as ArcStory[];

const IMAGES = [
  require('../../../assets/fixtures/image-1.png'),
  require('../../../assets/fixtures/image-2.png'),
  require('../../../assets/fixtures/image-3.png'),
] as number[];

/** Fixture JSON points at `fixture:N`. Swap in the bundled local image. */
function withLocalImages<T>(json: T): T {
  const text = JSON.stringify(json).replace(/fixture:(\d)/g, (_match, n: string) => {
    // Jest has no asset resolver, so keep a stable name there.
    const uri = Image.resolveAssetSource(IMAGES[Number(n) - 1])?.uri || `fixture-image-${n}`;
    return JSON.stringify(uri).slice(1, -1);
  });
  return JSON.parse(text) as T;
}

/**
 * Item `n` is published at a fixed age in the middle of a time band (1 h, 2 h ... then days), so the
 * relative time on a screenshot does not change during a test run, whatever the date is.
 */
function fixtureAgeMs(n: number): number {
  const MINUTE = 60_000;
  const minutes = n < 20 ? 60 * (1 + Math.floor(n / 2)) + 30 : Math.min(n - 18, 6) * 1440 + 720;
  return minutes * MINUTE;
}

function withFixtureTimes(json: ArcFeedList, pageIndex: number): ArcFeedList {
  return {
    ...json,
    content_elements: (json.content_elements ?? []).map((item, index) => ({
      ...item,
      last_updated_date: new Date(
        Date.now() - fixtureAgeMs(pageIndex * PAGE_SIZE + index),
      ).toISOString(),
    })),
  };
}

function abortError(): Error {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(abortError());
    });
  });
}

function toPage(json: ArcFeedList): FeedPage {
  const { items, rawCount } = mapFeedList(json);
  return { items, rawCount, hasMore: rawCount >= PAGE_SIZE };
}

export function createFixtureContentSource(): ContentSource {
  const pages = [feedPage1, feedPage2].map((page) => withLocalImages(page) as ArcFeedList);
  let mexicoPageTwoFailed = false;

  // Article for a feed path: the n-th feed item opens article (n mod 3).
  const articleByPath = new Map<string, ArcStory>();
  pages
    .flatMap((page) => page.content_elements ?? [])
    .forEach((item, index) => {
      const path = item.website_url;
      if (path && !path.includes('sin-contenido') && !articleByPath.has(path)) {
        articleByPath.set(path, withLocalImages(ARTICLES[index % ARTICLES.length]));
      }
    });

  return {
    async fetchFeedPage(edition: Edition, offset, signal) {
      if (edition.id === 'mundo' && offset === 0) await delay(SLOW_MS, signal);
      if (signal?.aborted) throw abortError();
      if (edition.id === 'cuba') throw new ContentError('network');
      if (edition.id === 'centroamerica') return { items: [], rawCount: 0, hasMore: false };
      if (edition.id === 'mexico' && offset === PAGE_SIZE && !mexicoPageTwoFailed) {
        mexicoPageTwoFailed = true;
        throw new ContentError('network');
      }
      const json = pages[offset / PAGE_SIZE];
      if (!json) return { items: [], rawCount: 0, hasMore: false };
      return toPage(withFixtureTimes(json, offset / PAGE_SIZE));
    },

    async fetchArticle(websiteUrl, signal) {
      if (signal?.aborted) throw abortError();
      const story = articleByPath.get(websiteUrl);
      if (!story) throw new ContentError('http', 'HTTP 404');
      return mapArticle(story);
    },
  };
}

export const fixtureContentSource: ContentSource = createFixtureContentSource();
