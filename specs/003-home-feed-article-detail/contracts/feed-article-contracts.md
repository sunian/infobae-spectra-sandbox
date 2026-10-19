# Contracts: Home Feed and Article Detail

This app has no server. These are the internal interfaces between modules, and the external API shape
it relies on (see `docs/API_SPIKE.md`).

## 1. ContentSource (`src/domain/content/ContentSource.ts`)

```ts
export const PAGE_SIZE = 20;

export type ContentErrorKind = 'network' | 'timeout' | 'http' | 'parse';
export class ContentError extends Error { kind: ContentErrorKind }

export interface ContentSource {
  fetchFeedPage(edition: Edition, offset: number, signal?: AbortSignal): Promise<FeedPage>;
  fetchArticle(websiteUrl: string, signal?: AbortSignal): Promise<Article>;
}
```

- Both methods reject with `ContentError`. An abort rejects with an `AbortError` that callers ignore.
- `liveContentSource`: uses `feedListUrl` and `articleUrl`, a 15 s timeout, no headers beyond default,
  no cookies or credentials. A non-2xx status is `http`. Invalid JSON or a missing `_id` is `parse`.
- `fixtureContentSource`: same interface, scenarios in research R6.
- `contentSource` (from `index.ts`) is the one the hooks use. Tests pass another source through a
  `ContentProvider` prop or a function argument.

## 2. Feed reducer (`src/domain/feed/feedReducer.ts`)

`feedReducer(state: FeedState, action: FeedAction): FeedState` is pure. Actions and transitions are in
`data-model.md`. `initialFeedState(edition)` builds the first state.

## 3. useFeed (`src/state/useFeed.ts`)

```ts
useFeed(edition: EditionId, source?: ContentSource): {
  state: FeedState;
  loadNextPage(): void;   // no-op unless allowed by the reducer rules
  refresh(): void;
  retry(): void;          // first page error
  retryNextPage(): void;  // page error footer
}
```

On `edition` change it resets and aborts the old request. On unmount it aborts.

## 4. useArticle (`src/state/useArticle.ts`)

```ts
useArticle(websiteUrl: string, source?: ContentSource): {
  state: ArticleState;
  retry(): void;
}
```

## 5. Route

`/article?path=<encoded websiteUrl>`. `path` is required. A missing or empty `path` shows the error
state. Opened with `router.push({ pathname: '/article', params: { path } })`.

## 6. Design system components (props)

All take final display strings. None calls `t()` for feature text (same rule as 002).

| Component | Props |
|---|---|
| `FeedItemCard` | `headline`, `summary?`, `meta` (authors and time, one string), `imageUrl?`, `onPress`, `accessibilityLabel` |
| `Thumbnail` | `uri?`, `aspectRatio` (default 3/2). Shows a neutral placeholder when `uri` is missing or fails. |
| `ArticleHeader` | `section?`, `headline`, `subheadline?`, `byline?`, `date?` |
| `ArticleImage` | `uri`, `caption?`, `aspectRatio?`, `altText?` |
| `RichText` | `segments: InlineSegment[]`, `onLinkPress(href)` |
| `Heading` | `level: number`, `children: string` |
| `StateView` | `kind: 'loading' \| 'empty' \| 'error'`, `message?`, `actionLabel?`, `onAction?` |
| `ListFooter` | `state: 'idle' \| 'loading' \| 'error'`, `errorLabel`, `retryLabel`, `onRetry` |

`Text` gains variants `headline`, `subheadline`, `caption`, `meta`. `tokens.ts` gains any new color or
size. Screens add no literal style values.

## 7. Localization keys (new, in `en.json`)

- `feed.empty`, `feed.error`, `feed.retry`, `feed.pageError`, `feed.refreshError`, `feed.loading`
- `article.error`, `article.retry`, `article.loading`, `article.by` (byline prefix), `article.imageAlt`
- `time.now`, `time.minutes`, `time.hours`, `time.days`

## 8. External API shape relied on

Documented in `docs/API_SPIKE.md`: Feed List API (`feed-list-d23`) and Article API (`content-api`).
Fields used and how absent fields are treated are in `data-model.md`. Anything else in the response is
ignored.
