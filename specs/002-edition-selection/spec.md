# Feature Specification: Edition Selection

**Feature Branch**: `002-edition-selection`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "edition selection"

## User Scenarios & Testing *(mandatory)*

Infobae publishes one edition for each country or region. The app must know which edition the
reader wants before it can show any news. This feature lets the reader choose an edition on first
launch, remembers the choice, and lets the reader change it later from the Menu. It does not load
or show news content. The feed comes in a later feature.

### User Story 1 - Choose an edition on first launch (Priority: P1)

A reader opens the app for the first time. Before the tabs show, the app asks the reader to pick a
news edition from a list. The reader taps one edition and continues. The app then shows the five
tabs. The Home tab shows the name of the chosen edition.

**Why this priority**: Every later feature depends on a selected edition. Without it, no feed can
know which content to load.

**Independent Test**: Install the app with no saved data. Open it. The edition list shows. Tap
"Colombia". The five tabs show, and Home shows "Colombia".

**Acceptance Scenarios**:

1. **Given** the app has never been opened, **When** it launches, **Then** the edition list shows
   and the tab bar does not show.
2. **Given** the edition list shows, **When** the reader taps one edition, **Then** the app shows
   the five tabs with Home active.
3. **Given** the reader chose an edition, **When** Home shows, **Then** it shows the name of that
   edition.
4. **Given** the edition list shows, **When** the reader has not chosen an edition, **Then** the
   reader cannot reach the tabs.
5. **Given** the edition list shows, **When** the reader presses the system back action, **Then**
   the app does not show the tabs and the list stays on screen.

---

### User Story 2 - Keep the choice between launches (Priority: P1)

A reader chose an edition, closed the app, and opens it again later. The app goes straight to the
tabs with the same edition. It does not ask again.

**Why this priority**: Asking on every launch would make the app unusable. Saving the choice is
part of the first-launch promise.

**Independent Test**: Choose "Perú". Fully close the app. Open it again. The tabs show at once,
and Home shows "Perú".

**Acceptance Scenarios**:

1. **Given** the reader chose an edition earlier, **When** the app launches again, **Then** the
   edition list does not show and the tabs show.
2. **Given** the reader chose an edition earlier, **When** the app launches with no network,
   **Then** the saved edition is still used.
3. **Given** the reader chose an edition earlier, **When** Home shows after a relaunch, **Then** it
   shows the same edition name.

---

### User Story 3 - Change the edition from the Menu (Priority: P2)

A reader moves to another country, or wants another edition. The reader opens the Menu tab and sees
the current edition. The reader taps it, picks a different edition from the list, and returns to
the Menu. The Home tab now shows the new edition. The choice stays saved.

**Why this priority**: Readers need a way out of a wrong or old choice. It is less urgent than the
first choice, because the first choice already gives a working app.

**Independent Test**: Choose "Colombia". Open Menu. Change to "México". Open Home. It shows
"México". Close and reopen the app. It still shows "México".

**Acceptance Scenarios**:

1. **Given** an edition is selected, **When** the reader opens the Menu tab, **Then** the Menu
   shows the name of the current edition.
2. **Given** the Menu shows the current edition, **When** the reader taps it, **Then** the edition
   list shows with the current edition marked.
3. **Given** the edition list shows from the Menu, **When** the reader taps a different edition,
   **Then** the selection changes, and the Menu shows the new edition name.
4. **Given** the reader changed the edition, **When** the reader opens Home, **Then** Home shows
   the new edition name.
5. **Given** the reader changed the edition, **When** the app is closed and opened again, **Then**
   the new edition is still selected.
6. **Given** the edition list shows from the Menu, **When** the reader leaves without choosing,
   **Then** the current edition does not change.

---

### Edge Cases

- The saved edition is no longer in the list of editions (for example, an edition was removed in an
  app update). The app MUST treat this as a first launch and ask again. It MUST NOT crash or show a
  blank edition.
- The saved preference cannot be read (corrupt or missing data). The app MUST treat this as a first
  launch and ask again.
- The reader taps editions quickly several times on first launch. The app MUST keep the last tap and
  MUST NOT show the tabs twice or crash.
- The reader taps the edition that is already selected in the Menu. The selection MUST stay the
  same, with no error.
- The reader closes the app while the edition list shows on first launch. The next launch MUST show
  the list again, because no choice was made.
- A small screen or rotated device. Every edition in the list MUST be reachable (the list can
  scroll), and no row may be cut off.
- Saving the choice fails (for example, the device storage is full). The app MUST still use the
  choice for the current session and MUST NOT crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On first launch, with no saved edition, the app MUST show an edition selection screen
  before the tab bar.
- **FR-002**: The app MUST offer these editions: Argentina, Estados Unidos, Colombia, España,
  México, Perú, Cuba, Centroamérica, and Mundo.
- **FR-003**: The reader MUST NOT be able to reach the tabs until an edition is chosen.
- **FR-004**: When the reader chooses an edition on first launch, the app MUST save it in local user
  preferences and show the tab bar with Home active.
- **FR-005**: On later launches, the app MUST read the saved edition and show the tab bar directly,
  without asking again and without a network connection.
- **FR-006**: If the saved edition is missing, unreadable, or not in the current list, the app MUST
  treat the launch as a first launch.
- **FR-007**: The Menu tab MUST show the name of the current edition and MUST let the reader open the
  edition list from it.
- **FR-008**: The edition list opened from the Menu MUST mark the current edition.
- **FR-009**: When the reader chooses an edition from the Menu, the app MUST save the new choice and
  use it as the selected edition everywhere in the app.
- **FR-010**: Leaving the edition list from the Menu without a choice MUST NOT change the selected
  edition.
- **FR-011**: The Home tab MUST show the name of the selected edition. This is a visible stand-in
  until the news feed is built.
- **FR-012**: If saving the choice fails, the app MUST still use the choice for the current session.
- **FR-013**: The edition selection screen on first launch and the edition list in the Menu MUST show
  the same editions in the same order.
- **FR-014**: All screens in this feature MUST be built from design system components. If a needed
  view is not in the design system, it MUST be added there first.
- **FR-015**: All user-facing text in this feature, including edition names, MUST come from the
  localization file.
- **FR-016**: The selected edition MUST be readable by any part of the app, and every part MUST see
  the same value, so later features (such as the Home feed) follow the reader's choice.

### Key Entities *(include if feature involves data)*

- **Edition**: A regional version of Infobae. Has a stable identifier, a display name, and the
  content sections that belong to it. The list of editions is fixed in the app for now.
- **Selected Edition Preference**: The reader's saved choice of one edition. Stored on the device
  only. It is empty until the reader chooses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new reader can go from opening the app to seeing the tabs with a single tap, on the
  edition they want.
- **SC-002**: After a choice, 100% of later launches, including launches with no network, open
  straight to the tabs with the same edition and no prompt.
- **SC-003**: A reader can change the edition from the Menu in 3 taps or fewer (Menu tab, current
  edition, new edition), and Home shows the new edition without restarting the app.
- **SC-004**: In 10 out of 10 test runs with a missing, corrupt, or unknown saved value, the app
  recovers by showing the edition list, with no crash.
- **SC-005**: Every user-facing string in the feature is in the localization file, and no screen in
  the feature contains hard-coded text.
- **SC-006**: The edition selection screen and the Menu edition list pass screenshot tests on both
  Android and iOS against saved baselines.

## Assumptions

- The reader has no account and no sign-in. The choice lives on the device only.
- The edition list is fixed in the app. It comes from the research in `docs/API_SPIKE.md` and is
  not loaded from the network. Editions can be added in an app update.
- No edition is pre-selected or guessed from the device region. The reader always chooses first.
  This keeps first launch simple and matches `vision.md`.
- The app has one language for now (Spanish edition names appear as Infobae spells them). Edition
  names go in the localization file so they can be translated later.
- This feature does not load news content. The Home tab shows only the edition name until the feed
  feature is built. The feed feature will read the selected edition from this feature.
- Changing the edition does not need confirmation, because it is easy to change back.
- iOS verification follows the project's existing deferral. Both platforms are in scope, but iOS
  checks wait until Xcode is available (see tasks T025 and T055 in `001-project-scaffold`).
- The My Infobae, Media, and Chat tabs stay as placeholders and do not use the edition yet.
