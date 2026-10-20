# Feature Specification: Dark Mode

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The app gets a light theme and a dark theme. By default it matches the phone's setting. The reader can override it in the Menu.
> - **Why:** Readers want comfortable reading in low light and want the app to match their phone (GitHub issue #3).
> - **Scope / Approach / Order:** First follow the phone setting (P1), then add the Menu override with a saved choice (P2). Every screen supports both themes.
> - **Biggest risk or open question:** Existing screens and screenshot tests may show colors that only suit light mode.
> - **Check this:** The Menu offers three choices: System, Light, Dark (FR-005). "System" is the default and follows phone changes while the app runs (FR-002, FR-003).

**Feature Branch**: `005-dark-mode`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "https://github.com/sunian/infobae-spectra-sandbox/issues/3" — Issue #3 "Dark Mode": the app should support both light and dark mode themes. By default, match the OS preference. The user should be able to manually override the theme in the app menu.

## User Scenarios & Testing *(mandatory)*

Today the app has one look. This feature adds a second look for dark settings. The app picks the
look from the phone setting by default. The reader can choose a look by hand in the Menu. The
choice stays saved.

### User Story 1 - App matches the phone's light or dark setting (Priority: P1)

A reader has set the phone to dark mode. The reader opens the app for the first time. The app shows
the dark theme on every screen. If the phone is set to light mode, the app shows the light theme.
If the reader changes the phone setting while the app is open, the app changes theme at once.

**Why this priority**: This gives a working dark mode with no action from the reader. It is the
default for every reader who never opens the theme setting.

**Independent Test**: Set the phone to dark. Install and open the app. Pick an edition. All screens
show the dark theme. Switch the phone to light. The app shows the light theme without a restart.

**Acceptance Scenarios**:

1. **Given** the phone is set to dark and the reader never chose a theme, **When** the app
   launches, **Then** every screen shows the dark theme.
2. **Given** the phone is set to light and the reader never chose a theme, **When** the app
   launches, **Then** every screen shows the light theme.
3. **Given** the app is open with no manual choice, **When** the reader changes the phone setting
   between light and dark, **Then** the app changes to the matching theme without a restart.
4. **Given** the dark theme shows, **When** the reader views any screen (edition list, Home,
   Article Detail, Media, My Infobae, Chat, Menu), **Then** text is readable and no part of the
   screen keeps light-theme colors.
5. **Given** the app launches in dark mode, **When** the splash screen ends, **Then** no bright
   flash of the light theme shows.

---

### User Story 2 - Override the theme from the Menu (Priority: P2)

A reader wants a theme that differs from the phone setting. For example, the phone is light, but
the reader wants dark for night reading in this app only. The reader opens the Menu, finds the
theme setting, and picks System, Light, or Dark. The app changes theme at once. The app remembers
the choice on the next launch.

**Why this priority**: The override is valuable, but the app already works well with US1 alone.

**Independent Test**: Set the phone to light. Open Menu. Choose Dark. All screens show dark. Close
and reopen the app. It still shows dark. Choose System. The app shows light again.

**Acceptance Scenarios**:

1. **Given** the Menu shows, **When** the reader looks at the theme setting, **Then** it shows
   three choices (System, Light, Dark) and marks the current one. A new install marks System.
2. **Given** the phone is light, **When** the reader chooses Dark, **Then** the app changes to the
   dark theme at once, on the Menu and on every other screen.
3. **Given** the phone is dark, **When** the reader chooses Light, **Then** the app changes to the
   light theme at once.
4. **Given** the reader chose Light or Dark, **When** the reader changes the phone setting,
   **Then** the app theme does not change.
5. **Given** the reader chose Light or Dark, **When** the reader chooses System, **Then** the app
   follows the phone setting again, including later phone changes.
6. **Given** the reader chose a theme, **When** the app is closed and opened again, **Then** the
   same choice is marked and applied from the first visible screen.
7. **Given** the reader chose a theme, **When** the reader changes the edition or opens an
   article, **Then** the theme choice does not change.

---

### Edge Cases

- The saved theme choice cannot be read or has an unknown value. The app MUST treat it as System
  and MUST NOT crash.
- Saving the choice fails (for example, the device storage is full). The app MUST still apply the
  new theme for the current session and MUST NOT show an error that blocks reading.
- The phone setting reports no preference. The app MUST use the light theme when the choice is
  System.
- The reader taps theme choices quickly several times. The app MUST keep the last tap and MUST NOT
  crash or flicker between themes.
- The reader changes the phone setting while the Menu theme list shows. The mark MUST stay on
  System (the reader's choice), and the colors MUST update.
- Images and article embeds with transparent or white backgrounds MUST remain legible in the dark
  theme.
- The first-launch edition list shows before any theme choice exists. It MUST use the theme from
  the phone setting.
- Status bar and system navigation bar text MUST stay readable on both themes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a light theme and a dark theme. Each theme MUST define every
  color that screens use.
- **FR-002**: When the reader has not chosen a theme (choice is System), the app MUST use the
  theme that matches the phone's light or dark setting.
- **FR-003**: When the choice is System, the app MUST change theme without a restart when the
  phone setting changes.
- **FR-004**: Every screen and component MUST render correctly in both themes. This includes the
  edition list, all five tabs, the Home feed, and Article Detail with its header, text, and image
  embeds.
- **FR-005**: The Menu MUST show a theme setting with three choices: System, Light, and Dark. It
  MUST mark the current choice. The default choice MUST be System.
- **FR-006**: When the reader picks a choice, the app MUST apply it at once on all screens, with
  no restart.
- **FR-007**: When the reader picks Light or Dark, the app MUST ignore later phone setting changes
  until the reader picks System.
- **FR-008**: The app MUST save the choice on the device. The app MUST apply the saved choice
  from the first visible screen on the next launch, with no flash of the other theme.
- **FR-009**: If the saved choice is missing, unreadable, or not one of the three values, the app
  MUST use System.
- **FR-010**: If saving the choice fails, the app MUST still apply the choice for the current
  session.
- **FR-011**: Text and interactive elements MUST be readable in both themes. Body text and
  controls MUST meet at least the WCAG AA contrast ratio against their background.
- **FR-012**: The status bar style MUST match the active theme.
- **FR-013**: All new user-facing text (setting title, the three choice names) MUST be in the
  localization JSON file.
- **FR-014**: All theme colors and the Menu theme control MUST live in the design system module.
  Screens MUST NOT hard-code colors.
- **FR-015**: The theme choice MUST be independent of the edition choice. Changing one MUST NOT
  change the other.

### Key Entities

- **Theme**: A named set of colors, fonts, and styles. There are two: light and dark.
- **Theme Preference**: The reader's choice of System, Light, or Dark. It is saved on the device.
  Its default is System.
- **Active Theme**: The theme the app shows now. It comes from the Theme Preference and, when the
  preference is System, from the phone setting.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a new install and the phone set to dark, 100% of screens show the dark theme at
  first launch with no manual step.
- **SC-002**: When the phone setting changes while the app is open (choice System), the app shows
  the matching theme within 1 second.
- **SC-003**: A reader can change the theme from the Menu in 3 taps or fewer, and the change shows
  on screen within 1 second.
- **SC-004**: After a manual choice, 100% of relaunches show the chosen theme from the first
  visible screen, with no visible flash of the other theme.
- **SC-005**: 100% of screens pass a contrast check (WCAG AA) for text in both themes.
- **SC-006**: Every screen has a regression screenshot for both light and dark themes.

## Assumptions

- The three-way choice (System, Light, Dark) is the intended meaning of "override". The issue says
  the reader can override the theme but does not name the choices.
- The theme setting lives in the existing Menu tab, next to the edition setting from feature 002.
- The default is System for all readers, including readers who already use the app.
- Brand colors for the dark theme follow the existing design system. The design team can tune
  exact values during planning.
- No other appearance settings (font size, high contrast, accent color) are in scope.
- Video and live stream embeds are out of scope for now, as in feature 003.
- Screens that exist today (features 001 to 003) are the full set that must support both themes.
