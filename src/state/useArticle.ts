import { useEffect, useState } from 'react';

import { isAbortError, type ContentSource } from '@/domain/content';
import type { Article } from '@/domain/infobae/article';

import { useContentSource } from './ContentContext';

export type ArticleState =
  | { status: 'loading'; article: null }
  | { status: 'content'; article: Article }
  | { status: 'error'; article: null };

type Result = {
  path: string;
  attempt: number;
  outcome: 'content' | 'error';
  article: Article | null;
};

export function useArticle(
  websiteUrl: string,
  sourceOverride?: ContentSource,
): { state: ArticleState; retry: () => void } {
  const contextSource = useContentSource();
  const source = sourceOverride ?? contextSource;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!websiteUrl) return;
    const controller = new AbortController();
    source
      .fetchArticle(websiteUrl, controller.signal)
      .then((article) => setResult({ path: websiteUrl, attempt, outcome: 'content', article }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setResult({ path: websiteUrl, attempt, outcome: 'error', article: null });
        }
      });
    return () => controller.abort();
  }, [source, websiteUrl, attempt]);

  // A result counts only for the path and the attempt that asked for it.
  const current = result?.path === websiteUrl && result.attempt === attempt ? result : null;
  let state: ArticleState = { status: 'loading', article: null };
  if (!websiteUrl) state = { status: 'error', article: null };
  else if (current?.outcome === 'content' && current.article) {
    state = { status: 'content', article: current.article };
  } else if (current?.outcome === 'error') state = { status: 'error', article: null };

  return { state, retry: () => setAttempt((value) => value + 1) };
}
