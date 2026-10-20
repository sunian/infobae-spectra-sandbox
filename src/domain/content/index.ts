import type { ContentSource } from './ContentSource';
import { fixtureContentSource } from './fixtureContentSource';
import { liveContentSource } from './liveContentSource';

export { ContentError, PAGE_SIZE, isAbortError } from './ContentSource';
export type { ContentSource, FeedPage } from './ContentSource';

/**
 * `EXPO_PUBLIC_CONTENT_SOURCE=fixture` (set by `npm run build:android:release`) serves bundled data
 * for screenshot tests. Anything else uses the live Infobae APIs.
 */
export const contentSource: ContentSource =
  process.env.EXPO_PUBLIC_CONTENT_SOURCE === 'fixture' ? fixtureContentSource : liveContentSource;
