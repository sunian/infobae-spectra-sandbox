# Data Model: Home Feed and Article Detail

## FeedItem (changed from the spike)

| Field | Type | Rule |
|---|---|---|
| `websiteUrl` | string | Identity. Required. Item dropped if missing. |
| `url` | string | `BASE_URL + websiteUrl`. |
| `headline` | string | Required. Item dropped if missing. |
| `summary` | string | `''` if absent. |
| `authors` | string[] | Names that are not empty. |
| `image` | `ImageRef \| null` | `{ url, resizeUrl? }` (R5). Replaces `imageUrl`. |
| `updatedAt` | string | ISO 8601 UTC, `''` if absent. |

## FeedPage (new)

`{ items: FeedItem[]; rawCount: number; hasMore: boolean }`

`hasMore = rawCount >= limit`. `rawCount` counts response items before dropping any.

## FeedState (new, in `feedReducer`)

| Field | Type | Meaning |
|---|---|---|
| `edition` | `EditionId` | Edition the data belongs to. |
| `requestId` | number | Grows on each reset or refresh. Results with another id are ignored. |
| `status` | `'loading' \| 'content' \| 'empty' \| 'error'` | What Home shows. |
| `items` | `FeedItem[]` | Loaded items, no repeats. |
| `offset` | number | Next offset (sum of `rawCount`). |
| `hasMore` | boolean | More pages exist. |
| `nextPage` | `'idle' \| 'loading' \| 'error'` | Footer state. |
| `refreshing` | boolean | Pull to refresh runs. |
| `refreshError` | boolean | Last refresh failed. |

### Transitions

| Action | From | To |
|---|---|---|
| `reset(edition)` | any | `status` loading, `items` empty, `offset` 0, `requestId + 1`. |
| `pageLoaded(id, page)` | `requestId` equal | Append unique items. `status` is `empty` if no items at all, else `content`. Update `offset`, `hasMore`. Ignored if `id` differs. |
| `pageFailed(id)` | `requestId` equal | If `items` empty: `status` error. Else `nextPage` error. |
| `nextPageStarted` | `status` content, `hasMore`, `nextPage` idle | `nextPage` loading. Otherwise no change (no double load). |
| `refreshStarted` | `status` content or empty or error | `refreshing` true, `requestId + 1` (old page result is ignored). |
| `refreshLoaded(id, page)` | `requestId` equal | Replace items, `offset`, `hasMore`; clear errors. |
| `refreshFailed(id)` | `requestId` equal | Keep items. `refreshing` false, `refreshError` true. |
| `retry` | `status` error | Same as `reset` for the same edition. |

## Article (changed: video blocks leave the model)

Same as the spike `Article`, except `ArticleBlock` keeps only `text`, `header`, `image`. The mapper
returns no `video` block (FR-016). `image` blocks keep `width` and `height` for the aspect ratio, and
get an optional `resizeUrl`.

## InlineSegment (new)

`{ text: string; bold: boolean; italic: boolean; href?: string }`

Rules: unknown tags are removed and their text kept. Unclosed tags close at the end of input. Entities
`&amp; &lt; &gt; &quot; &#39; &nbsp;` and numeric forms are decoded. An `<a>` with an unsafe `href`
keeps its text but has no `href`.

## ArticleState (new, in `useArticle`)

`{ status: 'loading' | 'content' | 'error'; article: Article | null }` for one `websiteUrl`. A result
for another path, or after unmount, is ignored.

## RelativeTime (new)

`formatRelativeTime(iso, now) -> { key, count? } | { date }`. Bands: under 60 s `time.now`; under
60 min `time.minutes`; under 24 h `time.hours`; under 7 d `time.days`; else a short date. A future or
invalid time gives `time.now` or an empty string (invalid).
