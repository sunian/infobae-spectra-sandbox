# Feature Specification: Home Feed and Article Detail

**Feature Branch**: `003-home-feed-article-detail`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Home feed and Article Detail. Home tab shows a vertically scrolling feed of article summaries (headline, summary, hero thumbnail, author, time) for the user's currently selected edition, newest first, with paging (infinite scroll), pull-to-refresh, and loading/empty/error states. Switching edition in Menu updates the feed. Tapping any article opens an Article Detail screen that shows the header (headline, subheadline, author, date, section), hero image, body text (with bold and links), header blocks, and image embeds with captions. Video embeds are out of scope for now. All strings in localization json, all UI from the design system, unit tests for business logic, Maestro screenshot tests for the screens."

## User Scenarios & Testing *(mandatory)*

The reader has chosen an edition (feature 002). This feature shows real news for that edition. The
Home tab shows a feed of article summaries. The reader taps a summary to read the full article.
Content comes from the public Infobae APIs described in `docs/API_SPIKE.md`. Video, live stream, and
audio content are not part of this feature.

### User Story 1 - Read the Home feed (Priority: P1)

A reader opens the app. The Home tab shows a vertical list of the newest articles for the selected
edition. Each item shows a headline, a one-sentence summary, a thumbnail image, the author names,
and how long ago it was published. The reader scrolls down to see older articles.

**Why this priority**: The feed is the core of a news reader. Without it the app has no content.

**Independent Test**: Choose "Colombia". Open Home. A list of Colombian articles shows, newest
first. Each item shows the five parts. Scroll to the end of the list. More, older articles load.

**Acceptance Scenarios**:

1. **Given** the reader has chosen an edition, **When** Home shows, **Then** a loading state shows
   first, and then the first page of articles for that edition shows, newest first.
2. **Given** an article item shows, **When** the reader looks at it, **Then** it shows the headline,
   the summary, the thumbnail, the author names, and the relative publish time.
3. **Given** an article has no thumbnail, no summary, or no author, **When** its item shows,
   **Then** the item shows the parts it has, with no blank gap or broken image.
4. **Given** the reader scrolls near the end of the loaded articles, **When** more articles exist,
   **Then** the next page loads and is added below, with no repeated article.
5. **Given** the next page is loading, **When** the reader looks at the end of the list, **Then** a
   small loading indicator shows there.
6. **Given** the reader reached the end of all articles, **When** no more pages exist, **Then** no
   further request is made and no loading indicator shows.

---

### User Story 2 - Open and read an article (Priority: P1)

The reader taps an article in the feed. The Article Detail screen opens. It shows the article
header, the hero image, and the full body. The reader scrolls to read. The reader goes back to the
feed at the same scroll position.

**Why this priority**: Reading the article is the reason to open the feed. The constitution requires
this screen.

**Independent Test**: Tap the first article on Home. The detail screen shows the headline,
subheadline, author, date, section, hero image, and the body text with its images. Go back. Home
shows the same position.

**Acceptance Scenarios**:

1. **Given** the feed shows, **When** the reader taps an item, **Then** the Article Detail screen
   opens for that article, and a loading state shows until the article is ready.
2. **Given** the article is ready, **When** the screen shows, **Then** it shows the headline, the
   subheadline (if any), the author names, the publish date and time, the section name, and the hero
   image with its caption (if any).
3. **Given** the article body has text blocks, **When** the screen shows, **Then** the text shows in
   order, bold text shows bold, and links show as links.
4. **Given** the body has header blocks, **When** the screen shows, **Then** each header shows as a
   heading at its level, in order with the text.
5. **Given** the body has image embeds, **When** the screen shows, **Then** each image shows in
   order with its caption (if any), at the right shape for the image.
6. **Given** the body has a video embed or any block type the app does not support, **When** the
   screen shows, **Then** the app leaves that block out, and the rest of the article shows with no
   error.
7. **Given** the reader taps a link in the body, **When** the link is a valid web address, **Then**
   it opens in the phone's browser.
8. **Given** the Article Detail screen shows, **When** the reader uses the back action, **Then** the
   reader returns to the feed at the same scroll position.

---

### User Story 3 - Refresh the feed (Priority: P2)

The reader pulls down on the feed. The feed loads the newest articles again and replaces the list.

**Why this priority**: News goes old fast. The reader needs a way to get new articles without
leaving the app.

**Independent Test**: Scroll down the feed. Scroll back to the top and pull down. A refresh
indicator shows. The list reloads from the first page.

**Acceptance Scenarios**:

1. **Given** the feed shows, **When** the reader pulls down from the top, **Then** a refresh
   indicator shows and the first page loads again.
2. **Given** a refresh finishes, **When** the list shows, **Then** it holds the new first page, and
   the scroll position is at the top.
3. **Given** a refresh fails, **When** the failure happens, **Then** the articles already on screen
   stay, and the reader sees a short error message.

---

### User Story 4 - The feed follows the selected edition (Priority: P2)

The reader changes the edition in the Menu (feature 002). The reader goes back to Home. Home shows
articles for the new edition.

**Why this priority**: The constitution requires that all feeds show the selected edition.

**Independent Test**: Choose "Colombia". Open Home and see Colombian articles. Change the edition
to "Perú" in Menu. Open Home. Peruvian articles show.

**Acceptance Scenarios**:

1. **Given** Home shows articles for edition A, **When** the reader changes to edition B and opens
   Home, **Then** Home shows articles for edition B only, with a loading state while it loads.
2. **Given** the reader changed the edition, **When** Home shows, **Then** no article of the old
   edition shows, not even for a moment, and the list is at the top.
3. **Given** the reader changes the edition while a request for the old edition is still running,
   **When** that request ends, **Then** its result is ignored.
4. **Given** the reader opens the app later, **When** Home shows, **Then** it shows articles for the
   saved edition.

---

### User Story 5 - Understand and recover from problems (Priority: P2)

The network is slow, off, or the server fails. The reader sees a clear message and a way to try
again. The app never shows a blank screen or crashes.

**Why this priority**: Mobile networks fail often. A news app must stay usable and clear.

**Independent Test**: Turn on airplane mode. Open the app with a saved edition. Home shows an error
message with a "Try again" action. Turn the network on. Tap "Try again". Articles show.

**Acceptance Scenarios**:

1. **Given** the first page fails to load, **When** the failure happens, **Then** Home shows an
   error message and a "Try again" action, and no article items.
2. **Given** the error state shows, **When** the reader taps "Try again", **Then** the loading state
   shows and the request runs again.
3. **Given** the first page loads with zero articles, **When** Home shows, **Then** it shows an
   empty-state message.
4. **Given** a later page fails to load, **When** the failure happens, **Then** the loaded articles
   stay, and a small "Try again" action shows at the end of the list.
5. **Given** the article fails to load on Article Detail, **When** the failure happens, **Then** the
   screen shows an error message and a "Try again" action, and the back action still works.

---

### Edge Cases

- A response has an item with a missing headline or a missing article path: the app skips that item.
- The same article shows in two pages (the list moved between requests): the list shows it once.
- The reader taps two items very fast: only one Article Detail screen opens.
- The reader leaves Article Detail before the article loads: the request result is ignored, no error.
- The reader pulls to refresh while a next page is loading: the refresh wins, and the old page result
  is ignored.
- The body text has HTML the app does not support, or broken HTML: the app shows the plain text and
  does not crash.
- An image fails to load: the item shows a neutral placeholder, and the layout does not jump.
- A very long headline or summary: the feed item shortens it (a set number of lines). The detail
  screen shows it in full.
- The device is in landscape or has a large font setting: text stays readable and nothing is cut off
  in the detail screen.
- Feed order is "newest first", not the editor order of the infobae.com home page (see assumptions).

## Requirements *(mandatory)*

### Functional Requirements

**Home feed**

- **FR-001**: The Home tab MUST show a vertical scrolling list of article summaries for the
  currently selected edition.
- **FR-002**: The list MUST be ordered newest first by first publish time.
- **FR-003**: Each item MUST show the headline, the summary, a thumbnail, the author names, and the
  relative publish time. An item MUST still show correctly when the summary, thumbnail, or author is
  missing.
- **FR-004**: The app MUST load the list in pages of a fixed size. It MUST load the next page when the
  reader scrolls near the end. It MUST NOT load the next page after the last page.
- **FR-005**: The list MUST NOT show the same article twice.
- **FR-006**: The app MUST skip an item that has no headline or no article path.
- **FR-007**: The feed MUST load summaries only. It MUST NOT download full article bodies.
- **FR-008**: The reader MUST be able to refresh the feed by pulling down. A refresh MUST replace the
  list with the new first page.
- **FR-009**: Home MUST show a loading state for the first load, an empty state for zero articles, and
  an error state with a retry action when the first load fails.
- **FR-010**: When a later page fails, the loaded articles MUST stay and a retry action MUST show at
  the end of the list. When a refresh fails, the loaded articles MUST stay and an error message MUST
  show.
- **FR-011**: When the selected edition changes, Home MUST show only articles of the new edition. It
  MUST discard the old list and ignore any late result for the old edition.
- **FR-012**: Relative times MUST show in a short form (for example "5 min", "3 h", "2 d") and follow
  the app's localization.

**Article Detail**

- **FR-013**: Tapping a feed item MUST open the Article Detail screen for that article. Only one
  detail screen MUST open for fast repeated taps.
- **FR-014**: The Article Detail screen MUST show the headline, the subheadline (if any), the author
  names, the publish date and time, the section name, and the hero image with its caption (if any).
- **FR-015**: The screen MUST show the body blocks in their original order: text (with bold and
  links), headers (with level), and images (with captions).
- **FR-016**: The app MUST leave out body blocks it does not support, including video embeds, and
  MUST show the rest of the article. It MUST NOT crash or show an error for them.
- **FR-017**: A tap on a body link MUST open the web address in the phone's browser. The app MUST open
  only `http` and `https` addresses.
- **FR-018**: The screen MUST show a loading state while the article loads, and an error state with a
  retry action if it fails. The back action MUST always work.
- **FR-019**: The back action MUST return the reader to the feed at the same scroll position, with the
  loaded pages kept.
- **FR-020**: Article Detail MUST open from any feed. Home is the only feed in this feature, but the
  screen and its route MUST NOT depend on Home.

**Cross-cutting**

- **FR-021**: All user-facing strings MUST come from the localization JSON file (constitution II).
- **FR-022**: All screens MUST use design system components. New views (feed item, thumbnail, body
  blocks, loading, empty, and error states) MUST be added to the design system first (constitution I).
- **FR-023**: The app MUST get content only from the public APIs in `docs/API_SPIKE.md`, and MUST NOT
  send any login, key, or personal data (constitution VI).
- **FR-024**: All business logic (request building, mapping, paging, merging, de-duplication, edition
  switching, relative time, body HTML parsing) MUST have unit tests (constitution III). Every screen
  and every state of it (loading, content, empty, error) MUST have Maestro screenshot tests
  (constitution IV). Tests MUST NOT depend on the live network.
- **FR-025**: The feature MUST work on Android and iOS with the same code. Only Android is verified
  for now, as set by earlier decisions.

### Key Entities

- **Feed Item**: A summary of one article. It has a path (its identity), a headline, an optional
  summary, an optional thumbnail, author names, and a publish time.
- **Feed Page**: A fixed-size group of Feed Items for one edition, plus a flag that says whether more
  pages exist.
- **Article**: The full article. It has a header (headline, optional subheadline, authors, publish
  time, section, optional hero image with caption) and a body.
- **Body Block**: One part of the body, in order. Its kind is text (with bold and links), header (with
  level), or image (with caption). Unsupported kinds are not kept.
- **Feed State**: What Home shows now: loading, content, empty, or error, together with the selected
  edition, the loaded items, the paging position, and the refresh and next-page status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a normal mobile connection, a reader sees the first articles within 3 seconds of Home
  opening, and sees a loading state at once.
- **SC-002**: A reader can go from app launch to reading an article body in 3 taps or fewer after the
  first launch (open the app, tap an item, read).
- **SC-003**: After an edition change, 100% of the articles on Home belong to the new edition, and 0
  articles of the old edition show at any moment.
- **SC-004**: Scrolling through at least 100 articles (5 or more pages) shows no repeated article and
  no visible stutter or blank gaps on a mid-range device.
- **SC-005**: With no network, every screen shows a clear message with a retry action within 10
  seconds, and 0 crashes or blank screens occur in any failure case in the edge case list.
- **SC-006**: 100% of the supported body block kinds in a set of at least 10 real sample articles show
  in the right order, and 0 samples fail because of an unsupported block.
- **SC-007**: Every screen state (Home: loading, content, empty, error; Article Detail: loading,
  content, error) has a passing Maestro screenshot test.

## Assumptions

- The reader has already chosen an edition (feature 002). Home reads it from the saved choice.
- The feed uses the Feed List API and the article uses the Article API, as in `docs/API_SPIKE.md`.
  These are not documented by Infobae and can change. Terms of use are not yet checked. This is a risk
  for a public release, not for this feature.
- The feed order is "newest first". It is not the curated editor order of infobae.com. This is a
  product choice for now. The Argentina edition is approximate, as the spike notes.
- The page size is 20 articles, the size tested in the spike.
- Feed thumbnails and detail images use resized image URLs when the API gives them, to save data. The
  exact sizes are a planning choice.
- No feed or article is saved on the device for offline use. The reader needs a network. A short-lived
  in-memory copy while the app runs is allowed.
- Video embeds, live streams, audio, comments, sharing, saving, and search are out of scope. The Media
  tab and My Infobae stay as placeholders.
- Section menus inside an edition (Sections JSON) are out of scope. Home shows one feed for the edition.
- The text language of the app chrome stays English from `en.json`. Article content is in Spanish, as
  published.
- Back-end content can be missing fields. The app must handle each optional field as absent.
- Only Android is verified (iOS checks are deferred, see feature 001 tasks T025 and T055).
