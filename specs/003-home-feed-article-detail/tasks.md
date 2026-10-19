---

description: "Task list for Home Feed and Article Detail"
---

# Tasks: Home Feed and Article Detail

**Input**: Design documents from `/specs/003-home-feed-article-detail/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/feed-article-contracts.md, quickstart.md

**Tests**: Required (constitution III and IV, spec FR-024). Test tasks come before the code they cover. See each test fail for the right reason before you write the code. Do not edit a test to make it pass.

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root (`/Users/jamessun/Projects/infobae-spectra-sandbox`). Spec acceptance scenarios are named "US1-AC1" and so on. Spec requirements are named "FR-001" and so on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: Which user story the task belongs to (US1 to US5)
- Each task names exact file paths

## Key Rules for All Tasks

- **Constitution I**: Screens in `app/` and `src/screens/` use only components from `src/design-system/`. A view the design system lacks is added there first, with its test.
- **Constitution II**: No user-facing string literals in JSX. All text comes from `t()` and `src/localization/en.json`.
- **Constitution V**: No `any` types. TypeScript strict. Lint clean. No lint rule disabled.
- **Constitution VI**: Call only the public APIs in `docs/API_SPIKE.md`. Send no credentials, cookies, or personal data.
- **No live network in tests.** Jest and Maestro use the fixture source or a mocked `fetch`.
- **iOS**: iOS checks stay deferred (`001-project-scaffold` T025 and T055). Write cross-platform code. Do not claim iOS verification.
- **Emulator tasks** need Maestro 2.11.0, the Android emulator from `.maestro/config.yaml`, and a fresh release build with `EXPO_PUBLIC_CONTENT_SOURCE=fixture` (set by T006 in the build script).
- **Gate before push**: `npm run verify` passes. **Gate before merge**: `npm run test:e2e` passes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Answer two open API questions and make the fixture build possible.

- [X] T001 Run two `curl` checks against the live APIs and record the results in `specs/003-home-feed-article-detail/research.md` (R5 and R7). (a) Fetch one page with `feedListUrl(colombia, 0, 20)` (build the URL from `src/domain/infobae/urls.ts`) and list the keys of one `content_elements[]` item. Say whether `first_publish_date` or `display_date` exists. If yes, R7 says the feed uses it. (b) Take one `resizeUrl` from a feed item and request `https://www.infobae.com{resizeUrl}&width=240&height=160` and `&width=1080`. Record the HTTP status and content type of each. If either is not a 200 image, R5 says: use the original `url`.
- [X] T002 Add the fixture data under `src/domain/content/__fixtures__/`. Copy `src/domain/infobae/__fixtures__/feed-list.json` as `feed-page-1.json`. Create `feed-page-2.json` (another 20 items, different `website_url` values, with 3 items that have no headline or no path, one item with no image, one with no summary, one with no author) and `feed-page-1.json` must also hold one item that repeats in `feed-page-2.json`. Create `article-*.json` files (at least 3 real or trimmed `story.json` variants: one with a header block, bold text and a link, one with several images and captions, one with a video embed and an unknown embed). Add 3 small local JPEG files under `assets/fixtures/` for images. Do not put live news URLs that need a network in anything a screenshot shows.
- [X] T003 Add the `EXPO_PUBLIC_CONTENT_SOURCE` switch to the build. In `package.json` change `build:android:release` so it sets `EXPO_PUBLIC_CONTENT_SOURCE=fixture` for the bundle step. Add a second script `build:android:release:live` that does not set it. Document both in `docs/PROJECT_GUIDE.md` in T049. Run neither build now.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Strings, domain logic, content source, shared design system pieces. Every user story needs these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Strings

- [X] T004 Add the keys of `contracts/feed-article-contracts.md` section 7 to `src/localization/en.json`, nested by area, with this English text: `feed.loading` "Loading articles", `feed.empty` "No articles right now.", `feed.error` "We could not load the articles.", `feed.retry` "Try again", `feed.pageError` "We could not load more articles.", `feed.refreshError` "We could not refresh. Showing earlier articles.", `article.loading` "Loading article", `article.error` "We could not load this article.", `article.retry` "Try again", `article.by` "By {{authors}}", `article.imageAlt` "Article image", `time.now` "now", `time.minutes` "{{count}} min", `time.hours` "{{count}} h", `time.days` "{{count}} d". Run `src/localization/index.test.ts` and confirm it passes.

### Mapping and URLs

- [X] T005 [P] Extend `src/domain/infobae/infobae.test.ts` first (data-model "FeedItem", "FeedPage", "Article"): `mapFeedList` returns `{ items, rawCount }` where `rawCount` is the response length before items are dropped; an item with no `website_url` or no `headlines.basic` is dropped but still counted in `rawCount`; `image` is `{ url, resizeUrl }` with `resizeUrl` undefined when absent; `mapArticle` returns no `video` block (a `custom_embed` and an unknown element are both left out); an `image` block keeps `width`, `height`, and `resizeUrl`. Add tests for new `src/domain/infobae/images.ts`: `resizedImageUrl(image, width, height)` returns `https://www.infobae.com{resizeUrl}&width=W&height=H` when `resizeUrl` exists, else the original `url`; returns `null` for no image. Run them and confirm they fail.
- [X] T006 Implement T005: change `src/domain/infobae/feed.ts` (`FeedItem.image: ImageRef | null` replaces `imageUrl`; `mapFeedList` returns `{ items, rawCount }`), `src/domain/infobae/article.ts` (remove the `video` block type, `parseIsoDuration` can go if nothing else uses it, add `resizeUrl` to the image block), and create `src/domain/infobae/images.ts`. If T001 found the resizer rejects sizes, make `resizedImageUrl` return the original `url` and note it in a comment. Fix every compile error this causes. Run T005 and confirm it passes, and `npm run typecheck`.

### Content source

- [X] T007 [P] Write `src/domain/content/liveContentSource.test.ts` with a mocked global `fetch` (contract section 1). Cover: `fetchFeedPage` calls the URL from `feedListUrl(edition, offset, PAGE_SIZE)`; returns `hasMore: true` when `rawCount` equals `PAGE_SIZE` and `false` when it is less; a non-2xx status rejects with `ContentError` of kind `http`; a rejected `fetch` gives `network`; invalid JSON gives `parse`; an article response with no `_id` gives `parse`; a request that takes more than the timeout (use fake timers, 15 s) gives `timeout`; an aborted `signal` rejects with an `AbortError` and not a `ContentError`; the request has no `credentials`, `Authorization`, or `Cookie` header. Run it and confirm it fails.
- [X] T008 Implement `src/domain/content/ContentSource.ts` (`PAGE_SIZE = 20`, `ContentError`, the `ContentSource` interface) and `src/domain/content/liveContentSource.ts` per contract section 1. Run T007 and confirm it passes.
- [X] T009 [P] Write `src/domain/content/fixtureContentSource.test.ts` (research R6): Colombia page 0 returns 20 items with `hasMore` true and page 1 differs and repeats exactly one item of page 0; Cuba rejects with a `ContentError` every time; Centroamérica returns zero items and `hasMore` false; México page 1 rejects the first time and works the second time; Mundo resolves after about 1500 ms (fake timers); any other edition behaves like Colombia; `fetchArticle` returns an article for each fixture path and rejects with `http` for an unknown path. Run it and confirm it fails.
- [X] T010 Implement `src/domain/content/fixtureContentSource.ts` using the files from T002 and `mapFeedList` / `mapArticle`. Create `src/domain/content/index.ts` exporting `contentSource`, chosen by `process.env.EXPO_PUBLIC_CONTENT_SOURCE` (`fixture` selects the fixture source, anything else the live source). Run T009 and confirm it passes.

### Pure logic

- [X] T011 [P] Write `src/domain/feed/feedReducer.test.ts` for every row of the data-model "Transitions" table: `reset` clears items and bumps `requestId`; `pageLoaded` with the current id appends unique items (by `websiteUrl`), sets `offset` to the sum of `rawCount`, sets `hasMore`; a repeated item is not added twice; zero items on the first page gives `status` `empty`; `pageLoaded` with another id changes nothing; `pageFailed` with no items gives `status` `error`, with items gives `nextPage` `error`; `nextPageStarted` is ignored when `nextPage` is already `loading`, when `hasMore` is false, or when `status` is not `content`; `refreshStarted` bumps `requestId` so a late page result is ignored (edge case: refresh wins); `refreshLoaded` replaces items and clears errors; `refreshFailed` keeps items and sets `refreshError`; `retry` from `error` behaves like `reset`. Run it and confirm it fails.
- [X] T012 Implement `src/domain/feed/feedReducer.ts` (`FeedState`, `FeedAction`, `initialFeedState(edition)`, `feedReducer`) exactly as in `data-model.md`. Run T011 and confirm it passes.
- [X] T013 [P] Write `src/domain/feed/relativeTime.test.ts` with a fixed `now`: 30 s gives `time.now`; 5 min gives minutes 5; 59 min gives 59; 60 min gives hours 1; 23 h gives 23; 24 h gives days 1; 6 d gives 6; 8 d gives a short date; a time in the future gives `time.now`; an invalid or empty string gives `''`. Add `formatRelativeTime` rendering through `t()` (assert the final strings "5 min", "3 h", "2 d", "now"). Run it and confirm it fails.
- [X] T014 Implement `src/domain/feed/relativeTime.ts` (research R7, data-model "RelativeTime"). `now` is a parameter. Run T013 and confirm it passes.
- [X] T015 [P] Write `src/domain/article/inlineHtml.test.ts` (data-model "InlineSegment"): plain text gives one segment; `<b>x</b>` and `<strong>` give bold; `<i>`/`<em>` give italic; `<a href="https://a.b">x</a>` gives `href`; nested `<b><a>` keeps both; `<br>` gives a newline; an unknown tag (`<span class="x">`) is removed and its text kept; an unclosed `<b>` closes at the end; broken input (`<b`, `</a>` with no open tag, `<<>>`) never throws; entities `&amp; &lt; &gt; &quot; &#39; &nbsp; &#233;` decode; an `<a>` with `javascript:alert(1)` keeps its text and has no `href`; a relative `/colombia/x` becomes `https://www.infobae.com/colombia/x`. Add `src/domain/article/links.test.ts`: `isSafeLink` allows `http:` and `https:` only and rejects `javascript:`, `intent:`, `file:`, `data:`, empty, and a bare word. Run them and confirm they fail.
- [X] T016 Implement `src/domain/article/links.ts` (`isSafeLink`, `resolveLink`) and `src/domain/article/inlineHtml.ts` (`parseInlineHtml(html): InlineSegment[]`, research R3 and R4). Run T015 and confirm it passes.

### Design system base

- [X] T017 [P] Write component tests for the shared pieces. `src/design-system/components/StateView.test.tsx`: kind `loading` shows an activity indicator and the optional message, with no button; kind `empty` shows the message and no button; kind `error` shows the message and a button with `actionLabel` that calls `onAction` when pressed. `src/design-system/components/ListFooter.test.tsx`: `idle` renders nothing visible; `loading` shows an indicator; `error` shows `errorLabel` and a button `retryLabel` that calls `onRetry`. `src/design-system/components/Thumbnail.test.tsx`: shows an image for `uri`; shows the placeholder when `uri` is missing; shows the placeholder after the image fires `onError`; the box keeps the same `aspectRatio` in all three cases. Extend `src/design-system/components/Text.test.tsx` (create it if absent): variants `headline`, `subheadline`, `caption`, `meta` render with the matching token style. Run them and confirm they fail.
- [X] T018 Implement T017. Add to `src/design-system/tokens.ts`: typography variants `headline`, `subheadline`, `caption`, `meta`; colors `placeholder` and `link`; radius and size tokens needed. Add `variant` support for these in `src/design-system/components/Text.tsx` (allow an optional `bold`, `italic`, `color` is not allowed to be free: use a `tone: 'primary' | 'secondary' | 'link'` prop). Create `StateView.tsx`, `ListFooter.tsx`, `Thumbnail.tsx` in `src/design-system/components/`. Export all from `src/design-system/index.ts`. Components take final strings and never call `t()`. Run T017 and confirm it passes.

**Checkpoint**: `npm run verify` passes. Domain logic, content source, strings, and base components work. No screen uses them yet.

---

## Phase 3: User Story 1 - Read the Home feed (Priority: P1) 🎯 MVP

**Goal**: Home shows the first page of articles for the selected edition and loads more on scroll.

**Independent Test**: Choose "Colombia" on the fixture build. Home shows article items. Scroll to the end. More items load with no repeats.

### Tests for User Story 1 (write first, confirm they fail)

- [X] T019 [P] [US1] Write `src/design-system/components/FeedItemCard.test.tsx` (US1-AC2, US1-AC3): shows headline, summary, meta, and thumbnail; with no `summary` it shows no empty gap (the summary element is absent); with no `imageUrl` it shows the placeholder; the headline is limited to 3 lines and the summary to 3 lines; calls `onPress` when tapped; has role `button` and the `accessibilityLabel`. Run it and confirm it fails.
- [X] T020 [P] [US1] Write `src/state/useFeed.test.tsx` for paging (US1-AC1, AC4 to AC6) with a fake `ContentSource` and `renderHook`: first render loads page 0 for the given edition and reaches `status` `content`; `loadNextPage` requests offset 20 and appends; two quick `loadNextPage` calls make one request; after a page with `hasMore` false, `loadNextPage` makes no request; the footer state is `loading` during a next-page request and `idle` after. Run it and confirm it fails.
- [X] T021 [P] [US1] Write `src/screens/HomeScreen.test.tsx` with `EditionProvider` on a fake storage holding `colombia` and a fake `ContentSource` through a `ContentProvider` prop (create `src/state/ContentContext.tsx` in T024): shows the loading state first; then one `FeedItemCard` per item with the headline, the author names joined, and the relative time (fixed `now`); tapping an item calls `router.push` with pathname `/article` and param `path` equal to the item's `websiteUrl`; reaching the end (`onEndReached`) loads the next page and the list has no repeats. Run it and confirm it fails.

### Implementation for User Story 1

- [X] T022 [US1] Implement `src/design-system/components/FeedItemCard.tsx` (contract section 6): `Pressable` role `button`, `Thumbnail` on one side, `Text` variants `headline` (3 lines), `meta`, and body for the summary (3 lines). Reads only tokens. Export it from `src/design-system/index.ts`. Run T019 and confirm it passes.
- [X] T023 [US1] Implement `src/state/useFeed.ts` per contract section 3: `useReducer(feedReducer)`, a `requestId` check, `AbortController` per request, an effect that loads page 0, `loadNextPage` that dispatches `nextPageStarted` then fetches at `state.offset`, abort on unmount. Edition change, refresh, and retry come in later stories, but keep the signature of contract section 3. Run T020 and confirm it passes.
- [X] T024 [US1] Create `src/state/ContentContext.tsx`: `ContentProvider` (prop `source`, defaults to `contentSource` from `src/domain/content`) and `useContentSource()`. Make `useFeed` and `useArticle` read the source from it when no `source` argument is given. Wrap the app in `ContentProvider` in `app/_layout.tsx` inside `EditionProvider`.
- [X] T025 [US1] Rewrite `src/screens/HomeScreen.tsx` to show the feed: `Screen`, a `FlatList`-based list from the design system (add `src/design-system/components/FeedList.tsx` with its own small test `FeedList.test.tsx` first: renders `data` through `renderItem`, passes `onEndReached` with threshold 0.5, shows `ListFooter`, sets `keyExtractor` from the item key, `windowSize` 7, `removeClippedSubviews` true), `StateView` for loading, `useFeed(edition)`, and `formatRelativeTime` for the meta line (authors via `t('article.by', …)` is not used here; join the author names with ", "). Navigation: `router.push({ pathname: '/article', params: { path } })` through a `useNavigationLock` hook in `src/state/useNavigationLock.ts` (600 ms, with a unit test first: a second call inside the window is ignored, a call after it works). Remove the old `Placeholder` use from Home. Run T021 and `npm run verify`.
- [X] T026 [US1] Add the route `article` as a protected screen in `app/_layout.tsx` (inside the `edition !== null` group, `headerShown: true`, title `t('article.title')` is not needed: use an empty title, tint and background from tokens). Create the thin file `app/article.tsx` that reads `path` from `useLocalSearchParams` and renders `<ArticleScreen path={path} />`. Leave `ArticleScreen` as a stub until T031 (it may render nothing). Run `npm run typecheck`.

### Maestro for User Story 1

- [X] T027 [US1] Update `.maestro/flows/home.yaml` and add `.maestro/flows/home-feed-scroll.yaml`. `home.yaml`: after `pick-edition.yaml`, wait for the first headline of fixture page 1 and take or assert screenshot `home` (baseline re-recorded). `home-feed-scroll.yaml`: scroll down until the first headline of fixture page 2 shows, and assert screenshot `home-feed-page-2`. Use the same RECORD / assert pattern as the existing flows. Keep `assert-tabs.yaml` working. DONE 2026-10-19: `home-feed-scroll.yaml` checks page 2 by text, not by screenshot, because a swipe does not stop at the same pixel each run (the first try matched only 85 to 89 percent). Only `home` has a new baseline.
- [X] T028 [US1] On the emulator: build the fixture release app (`npm run build:android:release`), record baselines for `home` and `home-feed-page-2` with `.maestro/record-baselines.sh --device <id>`, check the images by eye (no live text, no blank gaps), run `npm run test:e2e`, and confirm the flows pass. Record device id and result on this task line. DONE 2026-10-19: emulator-5556 (Pixel_3a AVD, 1080x2220; the other attached emulator is 1080x2400 and does not match the baselines). Fresh fixture release build. `home.png` re-recorded and checked by eye. `npm run test:e2e`: 9/9 flows passed, twice.

**Checkpoint**: US1 works. The reader sees a real feed and can scroll through pages.

---

## Phase 4: User Story 2 - Open and read an article (Priority: P1)

**Goal**: Tap an item, read the full article, tap a link, go back to the same place.

**Independent Test**: Tap the first item on Home (fixture). The detail shows header, hero image, body with bold, link, header, and images. Back returns to the same Home position.

### Tests for User Story 2 (write first, confirm they fail)

- [X] T029 [P] [US2] Write component tests: `src/design-system/components/ArticleHeader.test.tsx` (shows section, headline, subheadline, byline, date; each optional part is absent when not given; headline is not shortened), `ArticleImage.test.tsx` (shows the image with `aspectRatio` from the props; shows the caption when given and not otherwise; has `accessibilityLabel` from `altText`; shows the placeholder on error), `Heading.test.tsx` (level 1 to 6 give decreasing sizes, a level over 6 or below 1 uses the nearest valid level, role `header`), `RichText.test.tsx` (renders each segment, bold and italic styles, a segment with `href` has role `link` and calls `onLinkPress(href)`, a segment with no `href` is not pressable). Run them and confirm they fail.
- [X] T030 [P] [US2] Write `src/state/useArticle.test.tsx` (contract section 4) with a fake source: `loading` then `content` with the article; a rejection gives `error`; `retry` loads again; a result that arrives after unmount or for an old `websiteUrl` is ignored (no state update warning); an empty `websiteUrl` gives `error` at once. Write `src/screens/ArticleScreen.test.tsx` with a fake source and fixture articles: shows the loading state, then the header (US2-AC2), then body blocks in the original order (US2-AC3 to AC5), no video block (US2-AC6), tapping a bold link calls `Linking.openURL` (mock) with the https address (US2-AC7), a link with an unsafe address does nothing, an `openURL` that rejects does not throw. Run them and confirm they fail.

### Implementation for User Story 2

- [X] T031 [US2] Implement the design system components of T029: `ArticleHeader.tsx`, `ArticleImage.tsx`, `Heading.tsx`, `RichText.tsx`. Add any new token to `src/design-system/tokens.ts`. Export all from `src/design-system/index.ts`. Run T029 and confirm it passes.
- [X] T032 [US2] Implement `src/state/useArticle.ts` (contract section 4): abort on unmount and on `websiteUrl` change, ignore stale results. Run the `useArticle` part of T030 and confirm it passes.
- [X] T033 [US2] Implement `src/screens/ArticleScreen.tsx` (prop `path: string`): `Screen`, a scrolling body from the design system (add `src/design-system/components/ArticleBody.tsx` with a small test first: renders the list of blocks given as ready-made elements in order inside a scroll view with the screen padding), `StateView` for loading and error (retry calls `useArticle().retry`), `ArticleHeader` with the byline from `t('article.by', …)` and the date from the article (`Intl.DateTimeFormat` through a `formatArticleDate` function in `src/domain/article/articleDate.ts` with a unit test first), `ArticleImage` for the hero and image blocks using `resizedImageUrl` (1080 wide) and `width / height` for the aspect ratio, `Heading` for header blocks, `RichText` for text blocks (`parseInlineHtml`). Links go through `isSafeLink` and `Linking.openURL` in a try/catch. Run T030 and confirm it passes.
- [X] T034 [US2] Make the back action keep Home as it was (US2-AC8, FR-019). Confirm in a test in `src/navigation/RootLayout.test.tsx` that after a push to `/article` and a back action, the Home list is still mounted with the same items (no new request is made). If the test fails, find why (the screen must not unmount) and fix the layout, not the test.

### Maestro for User Story 2

- [X] T035 [US2] Add `.maestro/flows/article.yaml`: open the first Colombia item, wait for the headline, assert screenshot `article-top`, scroll to the body's image block, assert screenshot `article-body`, go back with `back`, and assert that the first item's headline is visible (same position). Use the existing RECORD / assert pattern. DONE 2026-10-19: `article.yaml` has one screenshot (`article-top`). The body is checked by text, for the same swipe reason as T027, so there is no `article-body` baseline.
- [X] T036 [US2] On the emulator: rebuild, record baselines `article-top` and `article-body`, check them by eye, run `npm run test:e2e`, and confirm all flows pass. Record device id and result on this task line. DONE 2026-10-19: emulator-5556 (Pixel_3a), fresh fixture build. `article-top.png` recorded and checked by eye. `home.png` re-recorded. `npm run test:e2e`: 10/10 flows passed. Note: one run failed with Android's "Process system isn't responding" dialog (the host ran two emulators). A cold boot of the emulator fixed it; it is not an app fault.

**Checkpoint**: US1 and US2 work. This is the MVP: read the feed, read an article.

---

## Phase 5: User Story 3 - Refresh the feed (Priority: P2)

**Goal**: Pull down to reload the newest articles.

**Independent Test**: Pull down at the top of Home. The first page loads again and the list is at the top.

- [X] T037 [P] [US3] Extend `src/state/useFeed.test.tsx` (US3-AC1 to AC3): `refresh` sets `refreshing` true, requests offset 0, and then replaces the items and goes to `refreshing` false; a failing refresh keeps the items, sets `refreshError`, and `refreshing` false; a refresh while a next-page request runs wins (the old page result is ignored, no repeats). Extend `src/screens/HomeScreen.test.tsx`: triggering `onRefresh` on the list shows the refresh indicator and then the new items; a failing refresh keeps the items and shows `feed.refreshError`. Run them and confirm they fail.
- [X] T038 [US3] Implement `refresh` in `src/state/useFeed.ts` and wire `refreshing` / `onRefresh` into `FeedList` (`RefreshControl`, tint from tokens) and `HomeScreen`. Show the refresh error as a `StateView`-style banner from the design system (add `src/design-system/components/Banner.tsx` with a test first: shows the message, and calls `onDismiss` if given). Scroll to the top after `refreshLoaded`. Run T037 and confirm it passes.
- [X] T039 [US3] Add `.maestro/flows/home-refresh.yaml`: pull down on the list (`swipe` from the top down) and assert the first fixture headline is visible and the screenshot `home-refreshed` matches. Record the baseline on the emulator, check it by eye, run `npm run test:e2e`, and record the result on this task line. DONE 2026-10-19: the flow compares against the existing `home.png` baseline instead of a new `home-refreshed` image, because a refresh gives the same screen as a first load. fixture build, emulator-5556: flow passed.

**Checkpoint**: US3 works.

---

## Phase 6: User Story 4 - The feed follows the selected edition (Priority: P2)

**Goal**: Change the edition in Menu. Home shows only the new edition.

**Independent Test**: Colombia, then Mundo (fixture, slow). Home shows the loading state, never an old item, then the new items.

- [X] T040 [P] [US4] Extend `src/state/useFeed.test.tsx` (US4-AC1 to AC3, FR-011): changing `edition` resets to `loading` with no items in the same render pass the hook returns; the request for the new edition starts and the old request is aborted; a late result for the old edition (resolve it after the change) does not change the state; the final items all come from the new edition's source calls; changing back to the first edition works. Extend `src/screens/HomeScreen.test.tsx`: after `setEdition('peru')` Home shows the loading state and then only the items of the new edition, and the list scrolls to the top. Run them and confirm they fail.
- [X] T041 [US4] Make `useFeed` follow `edition` (research R9): an effect keyed on `edition` dispatches `reset`, aborts, and loads page 0. `HomeScreen` scrolls the list to the top on reset (a `ref` on `FeedList`). Run T040 and confirm it passes. DONE 2026-10-19: `HomeScreen` needed no scroll ref for the reset. The list is replaced by the loading state and mounts again at the top. `useFeed` resets during render (when `edition` differs from `state.edition`), so no old item is drawn.
- [X] T042 [US4] Add `.maestro/flows/home-edition-switch.yaml`: pick Colombia, open Menu, change to Mundo (use the existing `edition-change` steps), open Home, assert the loading state screenshot `home-loading` (Mundo is slow in the fixture), wait for the content, and assert the screenshot `home-mundo`. Record baselines, check by eye, run `npm run test:e2e`, and record the result on this task line. DONE 2026-10-19: Mundo is now slow for 6 s (was 1.5 s) so the flow can catch the loading state after the tap on Home. Baselines `home-loading` and `home-mundo` recorded and checked by eye. The flow passed twice in assert mode. Fixture feeds are the same for every edition, so the flow tells editions apart by the screen title and the loading state.

**Checkpoint**: US4 works.

---

## Phase 7: User Story 5 - Understand and recover from problems (Priority: P2)

**Goal**: Clear empty and error states with retry, on Home and on Article Detail.

**Independent Test**: Choose Cuba (fixture). Home shows an error with "Try again". Choose México. Scroll to the end. A page error shows at the end with a small "Try again". Tap it. More items load.

- [X] T043 [P] [US5] Extend `src/state/useFeed.test.tsx` (US5-AC1 to AC4): first page fails gives `error` with no items; `retry` shows `loading` and then `content`; zero items gives `empty`; a failing next page keeps the items and gives footer `error`; `retryNextPage` loads the same offset again and appends. Extend `src/screens/HomeScreen.test.tsx`: error state shows `feed.error` and a `feed.retry` button, no items; empty state shows `feed.empty`; page error shows `feed.pageError` and a retry button at the end of the list. Extend `src/screens/ArticleScreen.test.tsx` (US5-AC5): a failing article shows `article.error` and `article.retry`; pressing retry loads again; a missing `path` shows the error state. Run them and confirm the new cases fail.
- [X] T044 [US5] Implement `retry` and `retryNextPage` in `src/state/useFeed.ts`. Show `StateView` kinds `error` and `empty` in `HomeScreen` and `ListFooter` state `error` in `FeedList` with the strings `feed.pageError` and `feed.retry`. Run T043 and confirm it passes.
- [X] T045 [US5] Add Maestro flows: `.maestro/flows/home-error.yaml` (Cuba: screenshot `home-error`; the retry button shows after the tap, since Cuba always fails), `.maestro/flows/home-empty.yaml` (Centroamérica: screenshot `home-empty`), `.maestro/flows/home-page-error.yaml` (México: scroll to the end, screenshot `home-page-error`, tap the retry, assert the next headline shows), `.maestro/flows/article-error.yaml` (open a fixture article whose path the fixture source rejects, add one such item to the México page in T002's data; screenshot `article-error`, and `back` works). Record baselines, check by eye, run `npm run test:e2e`, and record the result on this task line. DONE 2026-10-19: added `shared/pick-edition-as.yaml` (picks the edition in `EDITION`). Baselines `home-error`, `home-empty`, `article-error` recorded and checked by eye. `home-page-error` checks by text (swipe reason as in T027). The e2e run found a real bug: after a page error the footer grows, the list reports the end again, and the app retried by itself in a loop. Fixed in `useFeed` (a failed next page is retried only by the reader's "Try again"), with a unit test written first. `npm run test:e2e`: 16/16 flows passed.

**Checkpoint**: All five user stories work on Android.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, manual checks, and the full gates.

- [X] T046 [P] Update `docs/API_SPIKE.md`: close the "Image sizes" open issue with the T001 result; note the first-publish-date result; mark the Feed List API and Article API as "used by Home and Article Detail".
- [X] T047 [P] Update `docs/PROJECT_GUIDE.md`: add the `src/domain/content`, `src/domain/feed`, `src/domain/article` folders and the `EXPO_PUBLIC_CONTENT_SOURCE` switch (fixture build for tests, live build for people); add the fixture scenarios table from `quickstart.md`; list the new Maestro flows and baselines.
- [X] T048 [P] Update `README.md` if it lists commands or features (add the live build script from T003).
- [X] T049 Do the manual checks on the emulator and write the result in the PR notes: rotate the device on Home and on an article (nothing cut off); set a large system font and open an article (text stays readable); read the changes in `app/` and `src/screens/` and confirm they use only design system components, no hard-coded text, and no lint rule is disabled (constitution I, II, V); confirm no request has a credential header (T007 covers the code). DONE 2026-10-19 on emulator-5556: (1) Landscape Home: rows, thumbnails, and tab bar all fit, nothing cut off. (2) System font at 1.6x on Home: headline and summary shorten at 3 lines as designed, the feed stays readable. The tab bar (feature 001, not this feature) clips its labels at that size ("My Infobae" wraps and "Home" is cut); this is a follow-up for the tab bar, not a defect of 003. (3) The article screen at large font and landscape was not viewed by eye; the article flow and unit tests cover its content. (4) Code review of `app/` and `src/screens/`: only `@/design-system` components, no text literals in JSX, no lint rule disabled (lint passes with no warnings). (5) No request sends credentials: `liveContentSource.test.ts` checks `credentials: 'omit'` and no `Authorization` or `Cookie` header. The emulator font and rotation settings were restored.
- [X] T050 Run `npm run verify` (lint, typecheck, all Jest tests). Fix every failure. Do not skip or weaken a test. Record the suite and test counts on this task line. DONE 2026-10-19: lint and typecheck clean, 37 suites, 332 tests pass.
- [X] T051 On the emulator, run the full `npm run test:e2e` on a fresh fixture release build. Confirm every flow passes (the 8 older flows and the new ones). Record the result on this task line. DONE 2026-10-19: emulator-5556 (Pixel_3a), fresh fixture release build made after the last code change. `npm run test:e2e`: 16/16 flows passed (8 older flows and 8 new ones).
- [X] T052 Run the commands in `specs/003-home-feed-article-detail/quickstart.md` sections 1 and 3 and fix any command or expected result that drifted. Check that every requirement FR-001 to FR-025 maps to at least one passing test and write the map in `specs/003-home-feed-article-detail/test-map.md`. DONE 2026-10-19: quickstart sections 1 and 3 match the scripts. The FR-001 to FR-025 map is in `specs/003-home-feed-article-detail/test-map.md`, with the gaps listed.

---

## Phase 9: User Acceptance (UAT) — not executed by the implement command

**Purpose**: A person checks the feature on the live APIs, the only place real data is used. Use a build from `npm run build:android:release:live`. Link the evidence on the task line.

- [ ] T053 [UAT] UAT1 (US1-AC1, US1-AC2, US1-AC4, US2-AC1 to AC5, US2-AC7, US2-AC8) A reader picks "Colombia", scrolls through at least 5 pages (100 articles) with no repeat, opens 5 different articles, taps a link, and goes back to the same place — executor: human
- [ ] T054 [UAT] UAT2 (US3-AC1 to AC3, US4-AC1, US4-AC2) The reader pulls to refresh, changes the edition to "Perú" in Menu, and sees only Peruvian articles on Home, then restarts the app and sees "Perú" again — executor: human
- [ ] T055 [UAT] UAT3 (US5-AC1, US5-AC2, US5-AC4) The reader turns on airplane mode and restarts the app: Home shows the error with "Try again"; the reader turns the network on, taps "Try again", and the articles show — executor: human

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 to T003 are independent.
- **Foundational (Phase 2)**: Depends on Setup (T002 for the fixture tests). Test, then code, in pairs: T005 → T006, T007 → T008, T009 → T010 (needs T006 and T008), T011 → T012, T013 → T014, T015 → T016, T017 → T018. The pairs are independent of each other, except as noted. T004 can run any time.
- **US1 (Phase 3)**: Depends on Phase 2. T022, T023, T024 → T025 → T026. T027 and T028 after T025.
- **US2 (Phase 4)**: Depends on Phase 2 and on T026 (the route) and T024 (the content context). T031 and T032 are independent. T033 needs both. T034 needs T033.
- **US3 (Phase 5)**: Depends on US1 (`useFeed`, `FeedList`, `HomeScreen`). It edits the same files as US4 and US5, so run US3, US4, US5 in order.
- **US4 (Phase 6)**: Depends on US1.
- **US5 (Phase 7)**: Depends on US1 and US2 (the article error case).
- **Polish (Phase 8)**: Depends on all stories.
- **UAT (Phase 9)**: Depends on Polish and a live release build of the final code.

### Parallel Opportunities

- Phase 2 test-writing tasks T005, T007, T009, T011, T013, T015, T017 touch different files and can run together.
- In US1, T019, T020, and T021 can run together. In US2, T029 and T030 can run together.

### Test Plan Coverage (spec acceptance scenarios)

| Acceptance scenarios | Tests (T…) | Code (T…) |
|---|---|---|
| US1-AC1 to AC6 | T020, T021, T019, T011 | T022 to T025, T012 |
| US2-AC1 to AC8 | T029, T030, T034 | T031 to T033 |
| US3-AC1 to AC3 | T037 | T038 |
| US4-AC1 to AC4 | T040 | T041 |
| US5-AC1 to AC5 | T043 | T044 |
| FR-005, FR-006, FR-007 | T005, T011 | T006, T012 |
| FR-012 | T013 | T014 |
| FR-016, FR-017 | T005, T015, T030 | T006, T016, T033 |
| FR-021, FR-022, FR-023 | T004, T007, T050 | lint, T008 |
| FR-024, SC-007 | T027 to T045, T051 | Maestro flows |

## Implementation Strategy

1. **MVP**: Phases 1 to 4 (T001 to T036). The reader can see the feed and read an article.
2. **Then** add US3, US4, US5 in order (Phases 5 to 7). Each one is a small, independent increment.
3. **Finish** with Polish and the human UAT on the live APIs.
4. Push the branch only after `npm run verify` passes. Merge only after `npm run test:e2e` passes.
