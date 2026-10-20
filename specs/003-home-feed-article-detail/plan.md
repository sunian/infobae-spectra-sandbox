# Implementation Plan: Home Feed and Article Detail

**Branch**: `003-home-feed-article-detail` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-home-feed-article-detail/spec.md`

## Summary

Home shows a paged, newest-first feed of article summaries for the selected edition. A tap opens an
Article Detail screen with the header, hero image, and body (text, headers, images).

The approach has six parts:

1. **Content source.** A small `ContentSource` interface has two methods: `fetchFeedPage` and
   `fetchArticle`. The live implementation calls the Infobae public APIs with `fetch`. A fixture
   implementation serves bundled JSON. Tests and Maestro builds use the fixture (R6).
2. **Feed state.** A pure reducer (`feedReducer`) holds items, paging, and status. It de-duplicates,
   resets on an edition change, and ignores results with a stale request id. A hook (`useFeed`) runs
   the reducer and the requests.
3. **Article state.** A hook (`useArticle`) loads one article with the same status model.
4. **Body text.** A small parser (`parseInlineHtml`) turns a text block's HTML into styled segments
   (plain, bold, link). It has no new dependency (R3).
5. **Design system.** New components: `FeedItemCard`, `Thumbnail`, `ArticleHeader`, `ArticleImage`,
   `RichText`, `Heading`, `StateView` (loading, empty, error with retry), `ListFooter`. Screens use
   only these.
6. **Navigation.** A new route `app/article.tsx` takes the article path as a parameter. It sits above
   the tabs in the root stack, so Home stays mounted and keeps its scroll position (FR-019).

No new npm packages are needed.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20+

**Primary Dependencies**: Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58. All installed.
Built-in `fetch`, `FlatList`, `RefreshControl`, `Image`, and `Linking`. No new packages.

**Storage**: None. Feed and article data live in memory only (spec assumption).

**Testing**: `jest-expo` and React Native Testing Library for unit and integration tests. Maestro for
screenshot tests, run against a build that uses the fixture content source.

**Target Platform**: Android and iOS. iOS checks stay deferred (feature 001 T025 and T055).

**Project Type**: mobile-app

**Performance Goals**: First page (20 items, about 28 KB) shows in under 3 seconds on a normal
connection (SC-001). `FlatList` with `getItemLayout` not used (item heights vary), but with
`windowSize` and `removeClippedSubviews` tuned so 100+ items scroll without stutter (SC-004).

**Constraints**: No auth and no personal data in requests. Every request has a timeout (15 s) and can
be aborted. A bad response never crashes the app.

**Scale/Scope**: 2 new screens, 2 new routes' worth of navigation (1 new route), about 8 new design
system components, about 25 new strings, 1 reducer, 2 hooks, 1 parser, 1 time formatter, 1 content
source with 2 implementations, 8 new Maestro flows and baselines, 2 changed flows (`home.yaml`,
`menu.yaml` if affected).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How the plan meets it |
|-----------|--------|-----------------------|
| I. Design System First | PASS | Every new view is a design system component, built before the screen (tasks order this). Lint already blocks raw `Text`, `View`, `StyleSheet`, `Pressable` in `app/` and `src/screens/`. |
| II. Localization | PASS | All new text (states, retry, relative times, a11y labels) goes in `en.json`. Article content is Spanish data, not an app string. Lint bans literals in JSX. |
| III. Unit-Tested Logic | PASS | Unit tests for URL building (paging), mapping (raw count), reducer, relative time, inline HTML parser, content source error handling, link scheme check. Hooks get integration tests. |
| IV. Screenshot Tests | PASS | Maestro flows for each state of Home and Article Detail, on the fixture source. Baselines recorded on Android. |
| V. Static Analysis | PASS | Same ESLint, Prettier, strict TS. No `any`. |
| VI. Edition-Aware, Public-API Content | PASS | The feed takes the edition from `useEdition()`. Only public APIs from `docs/API_SPIKE.md` are called, with no credentials. |

Post-design re-check: PASS. No violations. Complexity Tracking is not needed.

## Testing obligations

1. Test-first. For each logic module, write the test and see it fail before the code.
2. Levels:

   | Level | What | Where |
   |---|---|---|
   | unit | URL paging, mapper raw count, reducer, relative time, inline HTML parser, link check, live source (mock `fetch`) | `src/domain/**/*.test.ts` |
   | integration | `useFeed` (edition switch, stale result, paging, refresh), `useArticle`, `HomeScreen`, `ArticleScreen`, design system components | `src/**/*.test.tsx` |
   | end-to-end | Home: loading, content, scroll, empty, error and retry, page-2 error, pull to refresh; Article: content, error, back keeps position; edition switch | `.maestro/flows/*.yaml` |
3. Regression scope: the existing 8 Maestro flows. `home.yaml` baseline changes (Home now shows a feed).
4. UAT: 3 scenarios, executor `human`, for the live APIs (the only check against real data).

## Project Structure

### Documentation (this feature)

```text
specs/003-home-feed-article-detail/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── feed-article-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                  # CHANGED: add the `article` route in the protected group
└── article.tsx                  # NEW: thin route, reads `path` param, renders ArticleScreen

src/
├── domain/
│   ├── infobae/
│   │   ├── feed.ts              # CHANGED: mapFeedList returns items and raw count; thumbnail URL
│   │   ├── urls.ts              # unchanged (feedListUrl already pages)
│   │   └── images.ts            # NEW: resized image URL builder
│   ├── content/
│   │   ├── ContentSource.ts     # NEW: interface, error type
│   │   ├── liveContentSource.ts # NEW: fetch + timeout + abort + mapping
│   │   ├── fixtureContentSource.ts # NEW: bundled data, per-edition scenarios
│   │   └── index.ts             # NEW: picks the source from EXPO_PUBLIC_CONTENT_SOURCE
│   ├── feed/
│   │   ├── feedReducer.ts       # NEW: pure state machine
│   │   └── relativeTime.ts      # NEW: "5 min", "3 h", "2 d" via localization keys
│   └── article/
│       ├── inlineHtml.ts        # NEW: <b>, <a>, entities -> segments
│       └── links.ts             # NEW: http/https check
├── state/
│   ├── useFeed.ts               # NEW
│   └── useArticle.ts            # NEW
├── design-system/
│   ├── tokens.ts                # CHANGED: new typography variants, sizes
│   └── components/              # NEW: FeedItemCard, Thumbnail, ArticleHeader, ArticleImage,
│                                #      RichText, Heading, StateView, ListFooter
├── screens/
│   ├── HomeScreen.tsx           # CHANGED: the feed
│   └── ArticleScreen.tsx        # NEW
└── localization/en.json         # CHANGED: feed, article, state, time keys

.maestro/
├── flows/                       # NEW: home-feed*, article*, edition switch flows
├── baselines/                   # NEW baselines (Android)
└── record-baselines.sh          # CHANGED: build with the fixture source
```

**Structure Decision**: Follow the 002 layout. Pure logic in `src/domain`, React state in `src/state`,
views in `src/design-system`, screens in `src/screens`, thin routes in `app/`.

## Deferred work

- iOS verification (same as features 001 and 002).
- Video, live, audio (Media tab feature). Sections inside an edition. Offline cache. Sharing.
- Live API check on a device is a human UAT task, because CI and Maestro use the fixture source.
