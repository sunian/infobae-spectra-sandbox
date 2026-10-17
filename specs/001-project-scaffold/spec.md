# Feature Specification: Project Scaffold

**Feature Branch**: `001-project-scaffold`

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Read vision.md. Specify the project scaffold only: app shell, navigation, folder layout, lint, and test setup. No product features yet."

## User Scenarios & Testing *(mandatory)*

The "users" of this feature are the developers who build the Infobae app, plus anyone who opens the
app to check it. This feature adds no news content. It gives the team a working, empty app and the
tools to build on it safely.

### User Story 1 - Launch the app shell (Priority: P1)

A developer clones the repository, installs dependencies, and starts the app on an Android and an
iOS target. The app opens and shows a shell with five bottom tabs: Home, My Infobae, Media, Chat,
and Menu. Each tab opens a placeholder screen.

**Why this priority**: Nothing else can be built or tested until the app starts and shows the shell.

**Independent Test**: Start the app on Android and iOS. Tap each tab. Each tab shows its own
placeholder screen.

**Acceptance Scenarios**:

1. **Given** a fresh clone with dependencies installed, **When** the developer starts the app on
   Android, **Then** the app opens with no errors and shows the five tabs.
2. **Given** the same setup, **When** the developer starts the app on iOS, **Then** the app opens
   with no errors and shows the five tabs.
3. **Given** the app is open, **When** the user taps any tab, **Then** that tab becomes active and
   its placeholder screen shows.
4. **Given** the user switched tabs, **When** the user taps the first tab again, **Then** the
   Home placeholder shows.

---

### User Story 2 - Build screens from a design system and localized strings (Priority: P2)

A developer adds a new screen. The developer finds a design system module with fonts, colors,
themes, and a small set of reusable components. The placeholder screens already use it. All text
on screen comes from one localization file.

**Why this priority**: The constitution requires every screen to use the design system and
localized text. The first screens must set this pattern so later work follows it.

**Independent Test**: Review the placeholder screens. Each uses design system components only. Each
shows text that comes from the localization file. Change a string in the file and see the screen
change.

**Acceptance Scenarios**:

1. **Given** the scaffold, **When** a developer opens a placeholder screen, **Then** the screen is
   built only from design system components.
2. **Given** the scaffold, **When** a developer changes a string in the localization file,
   **Then** the matching text on screen changes with no other code change.
3. **Given** the scaffold, **When** a developer looks for fonts, colors, and themes, **Then** they
   are all in the design system module.

---

### User Story 3 - Run quality checks (Priority: P3)

A developer runs the linter, the unit tests, and the screenshot tests with one command each. The
checks pass on the scaffold. A developer can see a clear failure when code breaks a rule.

**Why this priority**: The constitution sets quality gates for push and merge. The gates must work
before feature work starts.

**Independent Test**: Run the three commands on a clean scaffold. All pass. Add a style error, a
failing test, and a changed placeholder screen. Each check reports a failure.

**Acceptance Scenarios**:

1. **Given** the scaffold, **When** the developer runs the lint command, **Then** it passes with no
   errors.
2. **Given** the scaffold, **When** the developer runs the unit test command, **Then** the sample
   tests pass.
3. **Given** the scaffold, **When** the developer runs the screenshot test command, **Then** one
   screenshot test for each of the five placeholder screens passes against saved baselines.
4. **Given** a screen changed in a visible way, **When** the screenshot tests run, **Then** the
   affected test fails.
5. **Given** code with a style error, **When** the lint command runs, **Then** it reports the error
   and exits with a failure status.

---

### User Story 4 - Find where code belongs (Priority: P3)

A developer reads a short guide in the repository. It explains the folder layout and where new
screens, design system components, strings, business logic, and tests go.

**Why this priority**: A shared layout keeps later features consistent and easy to review.

**Independent Test**: A developer who did not write the scaffold uses the guide to place a sample
screen, component, string, and test in the correct folders.

**Acceptance Scenarios**:

1. **Given** the scaffold, **When** a developer opens the repository, **Then** separate, named
   locations exist for screens, navigation, design system, localization, business logic, and tests.
2. **Given** the guide, **When** a developer adds a new screen, **Then** the guide tells them
   where each part goes.

---

### Edge Cases

- A developer runs the app with no network. The shell MUST still open, because it needs no content.
- The device language is not in the localization file. The app MUST fall back to the default
  language and show no blank or raw key text.
- A developer rotates the device or uses a small screen. The tab bar MUST stay usable.
- A developer runs the screenshot tests on a different device size than the baselines. The tests
  MUST use one fixed, documented device configuration.
- A tab is tapped quickly several times. The app MUST show the last tapped tab and MUST NOT crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST start on both Android and iOS from a fresh clone, with documented steps.
- **FR-002**: The app MUST show a bottom tab bar with five tabs in this order: Home, My Infobae,
  Media, Chat, Menu.
- **FR-003**: Each tab MUST open a placeholder screen. The placeholder MUST NOT show news content or
  call any content service.
- **FR-004**: The tab bar MUST show which tab is active.
- **FR-005**: The repository MUST have a folder layout with separate places for screens,
  navigation, design system, localization, business logic, and tests.
- **FR-006**: The repository MUST include a short guide that explains the layout and where new code
  belongs.
- **FR-007**: The design system module MUST contain fonts, colors, styles/themes, and a small set of
  reusable components that the placeholder screens and tab bar need.
- **FR-008**: All screens in the scaffold MUST be built from design system components. The scaffold
  MUST have no one-off views.
- **FR-009**: All user-facing text MUST come from one localization file. No screen MUST hard-code
  user-facing text.
- **FR-010**: The app MUST use a default language and MUST fall back to it for a missing string.
- **FR-011**: A linter MUST be installed and configured. One command MUST run it over the whole
  codebase. The scaffold MUST pass with no errors.
- **FR-012**: The code MUST use a strict typed language setting. One command MUST run the type check.
  The scaffold MUST pass.
- **FR-013**: A unit test setup MUST exist. One command MUST run all unit tests. The scaffold MUST
  include sample tests that pass, including one for the localization lookup and its fallback.
- **FR-014**: A screenshot test setup MUST exist. One command MUST run all screenshot tests. The
  scaffold MUST include one test for each placeholder screen, with saved baseline images.
- **FR-015**: The repository MUST document one command or sequence for each gate: lint and unit
  tests before a push, and screenshot tests before a PR merge.
- **FR-016**: The scaffold MUST NOT include edition selection, article feeds, article detail, media
  playback, chat, user accounts, or any other product feature from the product vision.
- **FR-017**: The project foundation MUST start from an existing, maintained, empty-project starter
  template that is downloaded and extracted. The team MUST NOT hand-write the base project files
  (build config, entry point, platform setup) from scratch. Only files the template does not
  provide (tab shell, design system, localization, test setup, guide) are written for this feature.
- **FR-018**: The chosen starter template MUST be a minimal one with no sample product content. Any
  sample screens, demo assets, or example code that the template ships and this scaffold does not
  need MUST be removed before the work is done. The template name and version MUST be recorded in
  the repository guide.

### Key Entities

- **Tab**: One of the five top-level areas of the app. It has a name, an order, and a placeholder
  screen.
- **Design system component**: A reusable view with a defined look. Screens are built from these.
- **Localized string**: A text value found by key in the localization file. It has a default
  language value.
- **Screenshot baseline**: A saved image of a screen that screenshot tests compare against.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer with the required tools installed can go from a fresh clone to the running
  app on Android or iOS in under 15 minutes by following the repository guide.
- **SC-002**: 100% of the five tabs open their placeholder screen on both Android and iOS.
- **SC-003**: The lint, type check, unit test, and screenshot test commands all pass on the
  unmodified scaffold on the first run.
- **SC-004**: 100% of text shown in the scaffold comes from the localization file.
- **SC-005**: 100% of scaffold screens use only design system components.
- **SC-006**: A developer who did not write the scaffold can place a new screen, component, string,
  and test in the correct locations on the first try, using only the guide.
- **SC-007**: A deliberate rule violation (style error, failing unit test, or visual change) is
  caught by the matching check 100% of the time.
- **SC-008**: 0 base project files are hand-written. The project foundation comes from the starter
  template, and every file added on top is part of this feature's scope.

## Assumptions

- The team follows the Infobae Constitution v1.0.0. This feature sets up what its principles I to V
  require. Principle VI (editions and content) is out of scope and comes in later features.
- The edition selection at first launch is a product feature. It is out of scope here and will have
  its own specification.
- Placeholder screens show only the tab name through localized text. Their look can be simple.
- The default language is English. More languages can be added later by adding to the localization
  file.
- Placeholder tab icons and visual style are basic. The brand look comes in a later design system
  feature.
- Developers have the mobile build tools installed for at least one platform.
- No server, account, or network access is needed to run the app. Network access is needed once, to
  download the starter template and dependencies.
- The starter template is chosen at planning time. It must support the stack in the constitution and
  be actively maintained. This choice saves effort and avoids errors in hand-written base files.
