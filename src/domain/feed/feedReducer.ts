import type { FeedPage } from '../content/ContentSource';
import type { EditionId } from '../infobae/editions';
import type { FeedItem } from '../infobae/feed';

export type FeedState = {
  /** The edition the data belongs to. */
  edition: EditionId;
  /** Grows on each reset, refresh and retry. A result with another id is ignored. */
  requestId: number;
  status: 'loading' | 'content' | 'empty' | 'error';
  items: FeedItem[];
  /** The next offset: the sum of the raw counts of the pages so far. */
  offset: number;
  hasMore: boolean;
  nextPage: 'idle' | 'loading' | 'error';
  refreshing: boolean;
  refreshError: boolean;
};

export type FeedAction =
  | { type: 'reset'; edition: EditionId }
  | { type: 'pageLoaded'; id: number; page: FeedPage }
  | { type: 'pageFailed'; id: number }
  | { type: 'nextPageStarted' }
  | { type: 'refreshStarted' }
  | { type: 'refreshLoaded'; id: number; page: FeedPage }
  | { type: 'refreshFailed'; id: number }
  | { type: 'retry' };

export function initialFeedState(edition: EditionId, requestId = 0): FeedState {
  return {
    edition,
    requestId,
    status: 'loading',
    items: [],
    offset: 0,
    hasMore: true,
    nextPage: 'idle',
    refreshing: false,
    refreshError: false,
  };
}

/** Keeps the first copy of each article. The list can move between two requests. */
function uniqueItems(current: readonly FeedItem[], incoming: readonly FeedItem[]): FeedItem[] {
  const seen = new Set(current.map((item) => item.websiteUrl));
  const added = incoming.filter((item) => {
    if (seen.has(item.websiteUrl)) return false;
    seen.add(item.websiteUrl);
    return true;
  });
  return [...current, ...added];
}

export function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'reset':
      return initialFeedState(action.edition, state.requestId + 1);

    case 'retry':
      if (state.status !== 'error') return state;
      return initialFeedState(state.edition, state.requestId + 1);

    case 'pageLoaded': {
      if (action.id !== state.requestId) return state;
      const items = uniqueItems(state.items, action.page.items);
      return {
        ...state,
        items,
        offset: state.offset + action.page.rawCount,
        hasMore: action.page.hasMore,
        status: items.length === 0 ? 'empty' : 'content',
        nextPage: 'idle',
      };
    }

    case 'pageFailed':
      if (action.id !== state.requestId) return state;
      if (state.items.length === 0) return { ...state, status: 'error', nextPage: 'idle' };
      return { ...state, nextPage: 'error' };

    case 'nextPageStarted':
      if (state.status !== 'content' || !state.hasMore || state.nextPage === 'loading') {
        return state;
      }
      return { ...state, nextPage: 'loading' };

    case 'refreshStarted':
      return {
        ...state,
        requestId: state.requestId + 1,
        refreshing: true,
        refreshError: false,
        nextPage: 'idle',
      };

    case 'refreshLoaded': {
      if (action.id !== state.requestId) return state;
      const items = uniqueItems([], action.page.items);
      return {
        ...state,
        items,
        offset: action.page.rawCount,
        hasMore: action.page.hasMore,
        status: items.length === 0 ? 'empty' : 'content',
        nextPage: 'idle',
        refreshing: false,
        refreshError: false,
      };
    }

    case 'refreshFailed':
      if (action.id !== state.requestId) return state;
      return { ...state, refreshing: false, refreshError: true };
  }
}
