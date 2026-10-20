import { mapArticle, type ArcStory } from '../infobae/article';
import { mapFeedList, type ArcFeedList } from '../infobae/feed';
import { articleUrl, feedListUrl } from '../infobae/urls';
import { ContentError, PAGE_SIZE, type ContentSource } from './ContentSource';

const TIMEOUT_MS = 15_000;

async function getJson(url: string, callerSignal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const abort = () => controller.abort();
  if (callerSignal?.aborted) controller.abort();
  callerSignal?.addEventListener('abort', abort);

  try {
    let response: Response;
    try {
      // Public content only: no cookies, no authorization.
      response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    } catch (error) {
      if (timedOut) throw new ContentError('timeout');
      if (callerSignal?.aborted) throw error;
      throw new ContentError('network');
    }
    if (!response.ok) throw new ContentError('http', `HTTP ${response.status}`);
    try {
      return await response.json();
    } catch {
      if (timedOut) throw new ContentError('timeout');
      if (callerSignal?.aborted) throw new ContentError('network');
      throw new ContentError('parse');
    }
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', abort);
  }
}

export const liveContentSource: ContentSource = {
  async fetchFeedPage(edition, offset, signal) {
    const json = (await getJson(feedListUrl(edition, offset, PAGE_SIZE), signal)) as ArcFeedList;
    const { items, rawCount } = mapFeedList(json ?? {});
    return { items, rawCount, hasMore: rawCount >= PAGE_SIZE };
  },

  async fetchArticle(websiteUrl, signal) {
    const json = (await getJson(articleUrl(websiteUrl), signal)) as ArcStory | null;
    if (!json || typeof json._id !== 'string') throw new ContentError('parse');
    return mapArticle(json);
  },
};
