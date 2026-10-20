# Test Map: Home Feed and Article Detail

Each requirement and the passing tests that cover it. Written for T052 on 2026-10-19.
Unit and integration tests run with `npm test`. Flows run with `npm run test:e2e`.

| Requirement | Covered by |
|---|---|
| FR-001 list for the selected edition | `HomeScreen.test.tsx` (items, edition title); `useFeed.test.tsx` (page 0 for the edition); flow `home` |
| FR-002 newest first | `urls` test in `infobae.test.ts` (`feedOrder: first_publish_date:desc`); the API orders the list, the app keeps its order (`feedReducer.test.ts` keeps order) |
| FR-003 item parts, missing parts | `FeedItemCard.test.tsx`; `HomeScreen.test.tsx` (meta line parts); `fixtureContentSource.test.ts` (items with no summary, author, image); flow `home` |
| FR-004 paging, no page after the last | `useFeed.test.tsx` (next offset, one request, none after last); `feedReducer.test.ts`; `liveContentSource.test.ts` (`hasMore`); flow `home-feed-scroll` |
| FR-005 no repeated article | `feedReducer.test.ts` (repeat in a page and across pages); `HomeScreen.test.tsx` (no repeat); `fixtureContentSource.test.ts` (fixture repeats one item) |
| FR-006 skip item with no headline or path | `infobae.test.ts` (dropped, still counted); `fixtureContentSource.test.ts` |
| FR-007 summaries only | `infobae.test.ts` ("does not carry an article body"); the feed URL has no body source |
| FR-008 pull to refresh | `useFeed.test.tsx` (refresh); `HomeScreen.test.tsx`; `FeedList.test.tsx`; flow `home-refresh` |
| FR-009 loading, empty, error states | `HomeScreen.test.tsx`; `StateView.test.tsx`; flows `home-edition-switch` (loading), `home-empty`, `home-error` |
| FR-010 later-page and refresh failures | `useFeed.test.tsx` (footer error, no auto retry, refresh error); `HomeScreen.test.tsx`; `ListFooter.test.tsx`; `Banner.test.tsx`; flow `home-page-error` |
| FR-011 edition change | `useFeed.test.tsx` ("edition change": reset in the same pass, abort, late result ignored); `HomeScreen.test.tsx`; flow `home-edition-switch` |
| FR-012 short relative time, localized | `relativeTime.test.ts`; `index.test.ts` (placeholders); `HomeScreen.test.tsx` |
| FR-013 tap opens detail, one screen for fast taps | `HomeScreen.test.tsx` (push `/article` with `path`); `useNavigationLock.test.ts` |
| FR-014 detail header and hero | `ArticleHeader.test.tsx`; `ArticleImage.test.tsx`; `ArticleScreen.test.tsx`; `articleDate.test.ts`; flow `article` |
| FR-015 body blocks in order | `ArticleScreen.test.tsx` (order, headers, bold, images, captions); `RichText.test.tsx`; `Heading.test.tsx`; `inlineHtml.test.ts` |
| FR-016 unsupported blocks left out | `infobae.test.ts` (video and unknown embeds); `ArticleScreen.test.tsx` (fixture-3) |
| FR-017 safe links only | `links.test.ts`; `inlineHtml.test.ts` (unsafe href); `ArticleScreen.test.tsx` (open, unsafe, rejection) |
| FR-018 detail loading and error | `useArticle.test.tsx`; `ArticleScreen.test.tsx`; flow `article-error` |
| FR-019 back keeps position | `RootLayout.test.tsx` ("keeps Home as it was ... no new request"); flow `article` (back to Home) |
| FR-020 detail does not depend on Home | `app/article.tsx` reads only `path`; `ArticleScreen.test.tsx` renders it alone |
| FR-021 strings in `en.json` | lint (`react/jsx-no-literals`); `index.test.ts` (every key resolves) |
| FR-022 design system only | lint (`no-restricted-imports` for `app/` and `src/screens/`); component tests in `src/design-system/components/` |
| FR-023 public APIs, no credentials | `liveContentSource.test.ts` (no credentials, no auth or cookie header) |
| FR-024 unit tests and screenshots | all of the above; baselines for `home`, `home-loading`, `home-mundo`, `home-empty`, `home-error`, `article-top`, `article-error` |
| FR-025 same code on both platforms | no platform branches in the code. Only Android is verified (iOS deferred). |

## Success criteria

| Criterion | Status |
|---|---|
| SC-001 first articles in 3 s | Not measured. Human UAT (T053) on the live APIs. |
| SC-002 three taps to read | Flow `article`: open the app, tap an item, read. |
| SC-003 no old-edition article after a change | `useFeed.test.tsx` and `HomeScreen.test.tsx` (nothing of the old edition right after the change). |
| SC-004 100 articles with no repeat or stutter | No repeat: `feedReducer.test.ts`. Smoothness: human UAT (T053). |
| SC-005 clear message and retry in a failure | Flows `home-error`, `home-page-error`, `article-error`; the 15 s request timeout is in `liveContentSource.test.ts`. |
| SC-006 supported blocks in order, no failure from an unsupported one | `ArticleScreen.test.tsx` with three fixture articles. The spec asks for 10 real articles; this is covered only by UAT (T053). |
| SC-007 every state has a screenshot test | Home: loading, content, empty, error. Article: content (top), error. The article loading state and the page-error and refreshed states are checked by text or by an existing baseline, not by their own image. |

## Gaps

- **Article loading state** has no screenshot. It shows for a moment only, and the fixture answers at once. `ArticleScreen.test.tsx` covers it.
- **SC-001, SC-004 (smoothness), SC-006 (10 real articles)** need the live APIs. They are in the UAT tasks.
