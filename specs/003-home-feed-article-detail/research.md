# Research: Home Feed and Article Detail

All items below are decided. No open clarification remains.

## R1. Data fetching and state

- **Decision**: Use `fetch` with `AbortController` and a 15 s timeout. Hold feed state in a pure
  reducer plus a `useFeed` hook. Do not add a data-fetching library.
- **Rationale**: The feed has one query shape and simple paging. A reducer is easy to unit test
  (constitution III). A library adds a dependency for little gain.
- **Alternatives**: TanStack Query (`useInfiniteQuery`). It gives paging and caching, but it hides
  the stale-result rule (FR-011) and adds a package. Reconsider when more feeds exist.

## R2. Paging and "has more"

- **Decision**: Page size 20. `hasMore` is true when the raw response had as many items as the
  requested limit. The next offset is `offset + rawCount`, not the count of kept items.
- **Rationale**: `mapFeedList` drops items with no path or headline (FR-006). If the app counted only
  kept items, the offset would drift and show repeats. De-dup by `websiteUrl` (FR-005) covers the
  case where the list moves between requests.
- **Alternatives**: Page by `last_updated_date` cursor. The API supports offset only.

## R3. Body HTML

- **Decision**: Write `parseInlineHtml`. It reads `<b>`, `<strong>`, `<i>`, `<em>`, `<a href>`, `<br>`,
  and decodes the common entities. It strips every other tag and keeps its text. Output is a list of
  segments `{ text, bold, italic, href? }`. `RichText` renders nested `Text` runs.
- **Rationale**: The spike saw only `<b>` and `<a>` in text blocks. A full HTML renderer package is
  heavy. A tolerant tag scanner never throws on broken HTML (edge case).
- **Alternatives**: `react-native-render-html`. Large, and styles outside the design system.

## R4. Links

- **Decision**: `isSafeLink(href)` allows only `http:` and `https:`. A relative site path
  (`/colombia/...`) is turned into `https://www.infobae.com/...`. Open with `Linking.openURL` in a
  try/catch.
- **Rationale**: FR-017. Blocks `javascript:`, `intent:`, and similar.

## R5. Images

- **Decision**: Build a resized URL from `additional_properties.resizeUrl` as
  `https://www.infobae.com{resizeUrl}&width=W&height=H`. Fall back to `url` (the original) when
  `resizeUrl` is absent. Thumbnail size: 240 by 160. Detail width: 1080 for the hero and body images.
- **Rationale**: The spike notes the originals are large. The fixture shows `resizeUrl` carries a
  signed `auth` token, so only `width` and `height` can be added. Aspect ratio for images with known
  `width` and `height` comes from those fields, so the layout does not jump (edge case).
- **Checked 2026-10-19 (T001)**: `width=240&height=160` and `width=1080&height=720` both return
  HTTP 200 `image/jpeg` (13 KB and 126 KB). Use resized URLs. Keep the original `url` as the fallback
  when `resizeUrl` is absent.

## R6. Network-free tests and screenshots

- **Decision**: `ContentSource` interface. `liveContentSource` for production. `fixtureContentSource`
  for Jest and Maestro. The source is chosen at build time with `EXPO_PUBLIC_CONTENT_SOURCE`
  (`live` default, `fixture`). The Maestro build script sets `fixture`.
- **Fixture scenarios** (by edition, so Maestro needs no hidden control): Colombia returns pages of
  content. Cuba always fails (error state). Centroamérica returns zero items (empty state). México
  serves page 1, then fails page 2 once (page-2 error and retry). Mundo is slow by 1.5 s (loading
  state screenshot). Fixture images are bundled local assets, so screenshots are stable.
- **Rationale**: Screenshots must not depend on live news (FR-024). Constitution IV.
- **Alternatives**: A mock HTTP server on the host (extra moving part). A debug menu (one-off UI that
  breaks constitution I).

## R7. Relative time

- **Decision**: `formatRelativeTime(iso, now)` returns a key and a count: under 1 min "now", then
  `min`, `h`, `d`, and after 7 days a short date. Strings in `en.json` with i18n pluralization
  placeholders. `now` is a parameter so tests are fixed.
- **Rationale**: FR-012. `Intl.RelativeTimeFormat` is not reliable on all Hermes builds and gives long
  forms.
- **Publish time source**: The feed items have only `last_updated_date`. The feed shows that value,
  labelled as the time (spec says "how long ago it was published"). The detail screen uses
  `display_date`.
- **Checked 2026-10-19 (T001)**: a live feed item has only `credits`, `description`, `headlines`,
  `last_updated_date`, `promo_items`, `website_url`. No `first_publish_date` or `display_date`. The
  feed uses `last_updated_date`.

## R8. Navigation and scroll position

- **Decision**: Add `article` to the root `Stack`, above `(tabs)`, with param `path`. Home stays
  mounted below, so `FlatList` keeps its offset and the reducer keeps its pages (FR-019). Fast double
  tap: a 600 ms navigation lock in the tap handler.
- **Rationale**: Matches how `change-edition` already works. The route has no dependency on Home
  (FR-020): any feed can push `/article?path=...`.

## R9. Edition switch while Home is mounted

- **Decision**: `useFeed(edition)` holds a request id. When `edition` changes, the hook dispatches
  `reset`, aborts the running request, and starts page 1. Late results carry the old id and the
  reducer ignores them (FR-011, US4-AC3). Home renders the loading state while `items` is empty, so
  no old item shows. The list scrolls to top on reset.
- **Rationale**: Home sits in a tab and stays mounted while the reader uses Menu, so the hook must
  react to the edition, not only to mount.

## R10. Error handling

- **Decision**: `ContentSource` throws `ContentError` with `kind`: `network`, `timeout`, `http`,
  `parse`. The UI shows one generic message per place (feed first page, next page, refresh,
  article). The kind is for logs and tests only.
- **Rationale**: Spec asks for clear, short messages and a retry. Per-kind copy is not required.
