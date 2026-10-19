import type { FeedPage } from '../content/ContentSource';
import type { FeedItem } from '../infobae/feed';
import { feedReducer, initialFeedState, type FeedState } from './feedReducer';

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

function page(ids: number[], rawCount = ids.length, hasMore = true): FeedPage {
  return { items: ids.map(item), rawCount, hasMore };
}

const start = initialFeedState('colombia');

function loaded(ids: number[] = [1, 2, 3], rawCount = ids.length): FeedState {
  return feedReducer(start, { type: 'pageLoaded', id: start.requestId, page: page(ids, rawCount) });
}

describe('initialFeedState', () => {
  it('starts loading with no items', () => {
    expect(start).toMatchObject({
      edition: 'colombia',
      status: 'loading',
      items: [],
      offset: 0,
      hasMore: true,
      nextPage: 'idle',
      refreshing: false,
      refreshError: false,
    });
  });
});

describe('reset', () => {
  it('clears the items, bumps the request id and keeps no old state', () => {
    const state = feedReducer(loaded(), { type: 'reset', edition: 'peru' });
    expect(state.edition).toBe('peru');
    expect(state.status).toBe('loading');
    expect(state.items).toEqual([]);
    expect(state.offset).toBe(0);
    expect(state.requestId).toBeGreaterThan(start.requestId);
    expect(state.nextPage).toBe('idle');
    expect(state.refreshing).toBe(false);
    expect(state.refreshError).toBe(false);
  });
});

describe('pageLoaded', () => {
  it('shows content and moves the offset by the raw count', () => {
    const state = loaded([1, 2, 3], 5);
    expect(state.status).toBe('content');
    expect(state.items.map((i) => i.websiteUrl)).toEqual([
      '/colombia/1/',
      '/colombia/2/',
      '/colombia/3/',
    ]);
    expect(state.offset).toBe(5);
    expect(state.hasMore).toBe(true);
  });

  it('appends the next page and does not repeat an item', () => {
    const first = loaded([1, 2, 3]);
    const second = feedReducer(first, {
      type: 'pageLoaded',
      id: first.requestId,
      page: page([3, 4, 4, 5], 4),
    });
    expect(second.items.map((i) => i.headline)).toEqual([
      'Headline 1',
      'Headline 2',
      'Headline 3',
      'Headline 4',
      'Headline 5',
    ]);
    expect(second.offset).toBe(7);
  });

  it('records that no more pages exist', () => {
    const state = feedReducer(start, {
      type: 'pageLoaded',
      id: start.requestId,
      page: page([1], 1, false),
    });
    expect(state.hasMore).toBe(false);
  });

  it('shows the empty state for zero items on the first page', () => {
    const state = feedReducer(start, {
      type: 'pageLoaded',
      id: start.requestId,
      page: page([], 0, false),
    });
    expect(state.status).toBe('empty');
  });

  it('keeps the content state when a later page has no new items', () => {
    const first = loaded([1, 2]);
    const second = feedReducer(first, {
      type: 'pageLoaded',
      id: first.requestId,
      page: page([], 0, false),
    });
    expect(second.status).toBe('content');
    expect(second.items).toHaveLength(2);
  });

  it('clears the next-page loading flag', () => {
    const loading = feedReducer(loaded(), { type: 'nextPageStarted' });
    const after = feedReducer(loading, {
      type: 'pageLoaded',
      id: loading.requestId,
      page: page([9]),
    });
    expect(after.nextPage).toBe('idle');
  });

  it('ignores a result with another request id', () => {
    const state = feedReducer(start, { type: 'pageLoaded', id: 99, page: page([1]) });
    expect(state).toBe(start);
  });
});

describe('pageFailed', () => {
  it('shows the error state when there are no items', () => {
    const state = feedReducer(start, { type: 'pageFailed', id: start.requestId });
    expect(state.status).toBe('error');
    expect(state.items).toEqual([]);
  });

  it('keeps the items and sets the footer error when items exist', () => {
    const loading = feedReducer(loaded(), { type: 'nextPageStarted' });
    const state = feedReducer(loading, { type: 'pageFailed', id: loading.requestId });
    expect(state.status).toBe('content');
    expect(state.items).toHaveLength(3);
    expect(state.nextPage).toBe('error');
  });

  it('ignores a failure with another request id', () => {
    const state = feedReducer(start, { type: 'pageFailed', id: 99 });
    expect(state).toBe(start);
  });
});

describe('nextPageStarted', () => {
  it('sets the footer to loading', () => {
    expect(feedReducer(loaded(), { type: 'nextPageStarted' }).nextPage).toBe('loading');
  });

  it('is ignored while a next page already loads', () => {
    const loading = feedReducer(loaded(), { type: 'nextPageStarted' });
    expect(feedReducer(loading, { type: 'nextPageStarted' })).toBe(loading);
  });

  it('is ignored when no more pages exist', () => {
    const last = feedReducer(start, {
      type: 'pageLoaded',
      id: start.requestId,
      page: page([1], 1, false),
    });
    expect(feedReducer(last, { type: 'nextPageStarted' })).toBe(last);
  });

  it('is ignored when the status is not content', () => {
    expect(feedReducer(start, { type: 'nextPageStarted' })).toBe(start);
  });

  it('is allowed again after a footer error (retry)', () => {
    const loading = feedReducer(loaded(), { type: 'nextPageStarted' });
    const failed = feedReducer(loading, { type: 'pageFailed', id: loading.requestId });
    expect(feedReducer(failed, { type: 'nextPageStarted' }).nextPage).toBe('loading');
  });
});

describe('refresh', () => {
  it('refreshStarted bumps the request id so a late page result is ignored', () => {
    const loading = feedReducer(loaded(), { type: 'nextPageStarted' });
    const refreshing = feedReducer(loading, { type: 'refreshStarted' });
    expect(refreshing.refreshing).toBe(true);
    expect(refreshing.requestId).toBeGreaterThan(loading.requestId);
    expect(refreshing.nextPage).toBe('idle');
    const late = feedReducer(refreshing, {
      type: 'pageLoaded',
      id: loading.requestId,
      page: page([50]),
    });
    expect(late).toBe(refreshing);
  });

  it('refreshLoaded replaces the items and clears the errors', () => {
    const base = { ...loaded([1, 2, 3]), refreshError: true };
    const refreshing = feedReducer(base, { type: 'refreshStarted' });
    const done = feedReducer(refreshing, {
      type: 'refreshLoaded',
      id: refreshing.requestId,
      page: page([7, 8], 2),
    });
    expect(done.items.map((i) => i.headline)).toEqual(['Headline 7', 'Headline 8']);
    expect(done.offset).toBe(2);
    expect(done.refreshing).toBe(false);
    expect(done.refreshError).toBe(false);
    expect(done.status).toBe('content');
  });

  it('refreshLoaded with no items gives the empty state', () => {
    const refreshing = feedReducer(loaded(), { type: 'refreshStarted' });
    const done = feedReducer(refreshing, {
      type: 'refreshLoaded',
      id: refreshing.requestId,
      page: page([], 0, false),
    });
    expect(done.status).toBe('empty');
  });

  it('refreshFailed keeps the items and sets the refresh error', () => {
    const refreshing = feedReducer(loaded(), { type: 'refreshStarted' });
    const failed = feedReducer(refreshing, { type: 'refreshFailed', id: refreshing.requestId });
    expect(failed.items).toHaveLength(3);
    expect(failed.status).toBe('content');
    expect(failed.refreshing).toBe(false);
    expect(failed.refreshError).toBe(true);
  });

  it('refreshStarted clears an earlier refresh error', () => {
    const failed = { ...loaded(), refreshError: true };
    expect(feedReducer(failed, { type: 'refreshStarted' }).refreshError).toBe(false);
  });

  it('ignores refresh results with another request id', () => {
    const refreshing = feedReducer(loaded(), { type: 'refreshStarted' });
    expect(feedReducer(refreshing, { type: 'refreshLoaded', id: 99, page: page([1]) })).toBe(
      refreshing,
    );
    expect(feedReducer(refreshing, { type: 'refreshFailed', id: 99 })).toBe(refreshing);
  });
});

describe('retry', () => {
  it('goes from error to loading with a new request id', () => {
    const failed = feedReducer(start, { type: 'pageFailed', id: start.requestId });
    const state = feedReducer(failed, { type: 'retry' });
    expect(state.status).toBe('loading');
    expect(state.requestId).toBeGreaterThan(failed.requestId);
    expect(state.edition).toBe('colombia');
  });

  it('is ignored when the status is not error', () => {
    const state = loaded();
    expect(feedReducer(state, { type: 'retry' })).toBe(state);
  });
});
