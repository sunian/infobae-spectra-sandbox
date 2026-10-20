import { useCallback, useEffect, useReducer, useRef } from 'react';

import { isAbortError, type ContentSource } from '@/domain/content';
import { getEdition, type EditionId } from '@/domain/infobae/editions';
import { feedReducer, initialFeedState, type FeedState } from '@/domain/feed/feedReducer';

import { useContentSource } from './ContentContext';

export type UseFeed = {
  state: FeedState;
  /** Does nothing unless a next page is allowed. It never retries a page that failed. */
  loadNextPage: () => void;
  /** Tries the first page again after an error. */
  retry: () => void;
  /** Tries the failed next page again. */
  retryNextPage: () => void;
  /** Loads page 0 again and replaces the list. Resolves true when it worked. */
  refresh: () => Promise<boolean>;
};

export function useFeed(edition: EditionId, sourceOverride?: ContentSource): UseFeed {
  const contextSource = useContentSource();
  const source = sourceOverride ?? contextSource;
  const [state, dispatch] = useReducer(feedReducer, edition, (id) => initialFeedState(id));

  // The edition changed. Reset during render, so no item of the old edition is ever drawn.
  if (edition !== state.edition) dispatch({ type: 'reset', edition });

  // First page. It runs again when the request id changes (reset, retry).
  const firstPageLoading = state.status === 'loading';
  const { requestId } = state;
  useEffect(() => {
    if (!firstPageLoading) return;
    const controller = new AbortController();
    source
      .fetchFeedPage(getEdition(state.edition)!, 0, controller.signal)
      .then((page) => dispatch({ type: 'pageLoaded', id: requestId, page }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) dispatch({ type: 'pageFailed', id: requestId });
      });
    return () => controller.abort();
  }, [source, firstPageLoading, requestId, state.edition]);

  // Next page. A ref blocks a second call that comes before the next render.
  const nextPageController = useRef<AbortController | null>(null);
  const nextPagePending = useRef(false);
  useEffect(
    () => () => {
      nextPageController.current?.abort();
      nextPagePending.current = false;
    },
    [requestId],
  );

  const startNextPage = useCallback(
    (isRetry: boolean) => {
      const current = state;
      if (nextPagePending.current) return;
      if (current.status !== 'content' || !current.hasMore || current.nextPage === 'loading')
        return;
      // A list that reaches its end again must not try a failed page again on its own.
      // Only the reader's "Try again" does that.
      if (current.nextPage === 'error' && !isRetry) return;
      nextPagePending.current = true;
      dispatch({ type: 'nextPageStarted' });
      const controller = new AbortController();
      nextPageController.current = controller;
      source
        .fetchFeedPage(getEdition(current.edition)!, current.offset, controller.signal)
        .then((page) => dispatch({ type: 'pageLoaded', id: current.requestId, page }))
        .catch((error: unknown) => {
          if (!isAbortError(error)) dispatch({ type: 'pageFailed', id: current.requestId });
        })
        .finally(() => {
          if (nextPageController.current === controller) nextPagePending.current = false;
        });
    },
    [source, state],
  );
  const loadNextPage = useCallback(() => startNextPage(false), [startNextPage]);
  const retryNextPage = useCallback(() => startNextPage(true), [startNextPage]);

  // Refresh. It bumps the request id, so a next-page result that is still running is ignored.
  const refreshController = useRef<AbortController | null>(null);
  const refreshPending = useRef(false);
  useEffect(
    () => () => {
      refreshController.current?.abort();
      refreshPending.current = false;
    },
    [state.edition],
  );

  const refresh = useCallback(async (): Promise<boolean> => {
    if (refreshPending.current) return false;
    refreshPending.current = true;
    const id = state.requestId + 1;
    dispatch({ type: 'refreshStarted' });
    const controller = new AbortController();
    refreshController.current = controller;
    try {
      const page = await source.fetchFeedPage(getEdition(state.edition)!, 0, controller.signal);
      dispatch({ type: 'refreshLoaded', id, page });
      return true;
    } catch (error) {
      if (!isAbortError(error)) dispatch({ type: 'refreshFailed', id });
      return false;
    } finally {
      if (refreshController.current === controller) refreshPending.current = false;
    }
  }, [source, state]);

  const retry = useCallback(() => dispatch({ type: 'retry' }), []);

  return { state, loadNextPage, retry, retryNextPage, refresh };
}
