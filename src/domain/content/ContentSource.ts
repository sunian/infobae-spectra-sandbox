import type { Article } from '../infobae/article';
import type { Edition } from '../infobae/editions';
import type { FeedItem } from '../infobae/feed';

export const PAGE_SIZE = 20;

export type ContentErrorKind = 'network' | 'timeout' | 'http' | 'parse';

export class ContentError extends Error {
  readonly kind: ContentErrorKind;

  constructor(kind: ContentErrorKind, message?: string) {
    super(message ?? `Content request failed: ${kind}`);
    this.name = 'ContentError';
    this.kind = kind;
  }
}

export type FeedPage = {
  items: FeedItem[];
  /** Items in the response before any were dropped. The next offset adds this number. */
  rawCount: number;
  hasMore: boolean;
};

/** Where feeds and articles come from. A request that is aborted rejects with an `AbortError`. */
export interface ContentSource {
  fetchFeedPage(edition: Edition, offset: number, signal?: AbortSignal): Promise<FeedPage>;
  fetchArticle(websiteUrl: string, signal?: AbortSignal): Promise<Article>;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
