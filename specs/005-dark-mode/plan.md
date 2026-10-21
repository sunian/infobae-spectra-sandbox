# Implementation Plan: Dark Mode

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The app gets a light palette and a dark palette. A theme provider picks one. The Menu gets a Theme row that opens a System / Light / Dark list.
> - **Why:** Readers want the app to match the phone and to override it (issue #3).
> - **Scope / Approach / Order:** Palettes and provider first, then move every design system component to the provider, then the preference and Menu screen, then dark Maestro baselines.
> - **Biggest risk or open question:** The native splash screen follows the phone, not the in-app override. A reader with phone Light and override Dark sees a light splash for a moment (R6).
> - **Check this:** The setting is a Menu row that opens a list, like the edition (R5). `app.json` changes from `light` to `automatic` (R1). The splash exception in R6 is acceptable.

**Branch**: `005-dark-mode` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-dark-mode/spec.md`

## Summary

The app shows a light or dark theme. By default the theme follows the phone. The reader can pick
System, Light, or Dark in the Menu. The pick is saved.

The approach has seven parts:

1. **Palettes.** `tokens.ts` replaces the single `colors` object with `lightColors` and
   `darkColors`. Both have the same keys and the type `ColorPalette`. Fonts, spacing, radius, and
   typography stay shared (R2).
2. **Theme provider.** A design system `ThemeProvider` takes a `scheme` (`light` or `dark`) and
   gives the matching palette. `useColors()` reads it. `useThemedStyles(factory)` builds styles from
   it. Without a provider, `useColors()` returns the light palette, so isolated tests still work
   (R3).
3. **Component migration.** Every design system component stops reading the static `colors` and
   uses `useColors()` or `useThemedStyles()`. No screen or route holds a color (FR-014).
4. **Preference logic.** A pure module `src/domain/theme/preference.ts` parses, loads, and saves the
   choice and resolves the active scheme. It uses the same `KeyValueStorage` type as the edition
   (R4).
5. **Theme state.** `src/state/ThemeContext.tsx` reads the saved choice, listens to the phone
   scheme, saves changes, and renders the design system `ThemeProvider`. The root layout keeps the
   splash screen up until the edition and the theme are both read (R6).
6. **Menu and screen.** A Theme row in the Menu opens a new `change-theme` route. It lists System,
   Light, and Dark with the existing `OptionList`. No new design system view is needed (R5).
7. **Native chrome.** `app.json` sets `userInterfaceStyle` to `automatic` and gives the splash
   screen a dark variant. The status bar style and the Android navigation bar style follow the
   active scheme. A navigation theme built from the palette colors the stack and tab chrome (R1, R6,
   R7, R10).

One new npm package is needed: `expo-navigation-bar`, for the Android navigation bar (R10).

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20+

**Primary Dependencies**: Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58,
`@react-native-async-storage/async-storage`, `expo-status-bar`, `expo-splash-screen`, and the new
`expo-navigation-bar` (R10). Uses the built-in `useColorScheme` from `react-native`.

**Storage**: One new key in the existing AsyncStorage store: `preferences.theme`. Values: `system`,
`light`, `dark`.

**Testing**: `jest-expo` and React Native Testing Library for unit and integration tests. Maestro for
screenshot tests on the fixture content source. Dark baselines run with the emulator in night mode
(R8).

**Target Platform**: Android and iOS. iOS checks stay deferred (feature 001 T025 and T055).

**Project Type**: mobile-app

**Performance Goals**: A theme change shows on every mounted screen in under 1 second (SC-002,
SC-003). A change re-renders through one context, with no navigation reset.

**Constraints**: No flash of the wrong theme from the first screen the app draws (FR-008). A failed
read or write never crashes the app (FR-009, FR-010). Text and controls meet WCAG AA contrast in both
palettes (FR-011).

**Scale/Scope**: 2 palettes of 9 colors each (see [data-model.md](./data-model.md)), 1 provider and 2
hooks in the design system, about 9 components migrated, 1 domain module, 1 state provider, 1 new
route and screen, 1 changed screen (`MenuScreen`), 1 navigation theme function, 3 new strings plus
1 Menu string, about 8 new dark Maestro baselines, 2 new Maestro flows for the override.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How the plan meets it |
|-----------|--------|-----------------------|
| I. Design System First | PASS | Palettes, `ThemeProvider`, `useColors`, and `useThemedStyles` live in `src/design-system/`. The Theme row reuses `ListRow` and `OptionList`. Lint already blocks raw `Text`, `View`, `StyleSheet`, `Pressable` in `app/` and `src/screens/`. The root layout reads colors only through `useColors()`. |
| II. Localization | PASS | The four new strings go in `en.json`. Lint bans literals in JSX. |
| III. Unit-Tested Logic | PASS | Unit tests for `parseThemePreference`, `loadThemePreference`, `saveThemePreference`, `resolveScheme`, `navigationTheme`, and the palette contrast check. Integration tests for `ThemeContext` and the Theme screen. |
| IV. Screenshot Tests | PASS | Every screen gets a dark baseline. Menu and the new Theme screen change in both themes. See R8. |
| V. Static Analysis | PASS | Same ESLint, Prettier, strict TS. No `any`. |
| VI. Edition-Aware, Public-API Content | PASS | No content or API change. The theme choice is independent of the edition (FR-015). |
| VII. TL;DR | PASS | Every new SpecKit document opens with a TL;DR. |

Post-design re-check: PASS. No violations. Complexity Tracking is not needed.

## Testing obligations

1. Test-first. For each logic module, write the test and see it fail before the code.
2. Levels:

   | Level | What | Where |
   |---|---|---|
   | unit | `parseThemePreference`, `loadThemePreference`, `saveThemePreference`, `resolveScheme`, `navigationTheme`, palette contrast (WCAG AA) and key parity | `src/domain/theme/*.test.ts`, `src/design-system/tokens.test.ts`, `src/navigation/navigationTheme.test.ts` |
   | integration | `ThemeContext` (default System, saved choice, unreadable value, failed save, phone scheme change, rapid taps), `ThemeScreen`, `MenuScreen` Theme row, every design system component in both schemes | `src/**/*.test.tsx` |
   | end-to-end | Dark pass (emulator night mode, choice System): every screen against its `-dark` baseline. Override pass (emulator day mode): Menu, Theme list, choose Dark, all main screens, relaunch keeps Dark | `.maestro/flows/*.yaml` |
3. Regression scope: the existing 15 Maestro flows. Baselines should not change in the default pass, because the light palette keeps today's values. A changed baseline means a regression.
4. UAT: 3 scenarios, executor `human`: live phone setting change while the app is open (SC-002), a real device in dark mode at first launch with the splash (US1 AC5), and a manual choice that survives a force close (SC-004).

## Project Structure

### Documentation (this feature)

```text
specs/005-dark-mode/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── theme-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
app.json                          # CHANGED: userInterfaceStyle automatic, splash dark variant,
                                  #          expo-navigation-bar plugin (enforceContrast false)

app/
├── _layout.tsx                   # CHANGED: ThemeProvider, navigation theme, status bar, splash gate,
│                                 #          `change-theme` route, header colors from useColors()
├── (tabs)/_layout.tsx            # CHANGED: tab colors from useColors()
└── change-theme.tsx              # NEW: thin route, renders ThemeScreen

src/
├── domain/
│   └── theme/
│       └── preference.ts         # NEW: ThemePreference, parse, load, save, resolveScheme
├── state/
│   └── ThemeContext.tsx          # NEW: provider and useThemePreference()
├── navigation/
│   └── navigationTheme.ts        # NEW: palette -> navigation theme
├── design-system/
│   ├── tokens.ts                 # CHANGED: lightColors, darkColors, ColorPalette; `colors` removed
│   ├── theme.tsx                 # NEW: ThemeProvider, useColors, useThemedStyles
│   ├── index.ts                  # CHANGED: export the new names
│   └── components/               # CHANGED: Banner, FeedItemCard, FeedList, ListFooter, ListRow,
│                                 #          RichText, Screen, StateView, TabBarLabel, Text, Thumbnail
├── screens/
│   ├── MenuScreen.tsx            # CHANGED: Theme row
│   └── ThemeScreen.tsx           # NEW: OptionList with System, Light, Dark
└── localization/en.json          # CHANGED: menu.theme, themeSelect.*, theme.* keys

.maestro/
├── config.yaml                   # CHANGED: default pass skips the `dark` tag; notes the night-mode pass
├── flows/                        # NEW: *-dark flows (tag `dark`), theme-override, theme-persist
├── baselines/                    # NEW: *-dark.png, menu-dark, theme-select(-dark)
└── record-baselines.sh           # CHANGED: second pass with the emulator in night mode
```

**Structure Decision**: Follow the 002 and 003 layout. Pure logic in `src/domain`, React state in
`src/state`, views and palettes in `src/design-system`, screens in `src/screens`, thin routes in
`app/`.

## Deferred work

- A segmented control or toggle on the Menu itself. The list screen matches the edition pattern and
  needs no new component (R5). Revisit if the 3-tap path (SC-003) tests badly.
- A separate dark splash image. Only the background color changes now (R6).
- iOS baselines and iOS device checks. They stay deferred with feature 001.
- Content-aware dark treatment for embedded article images with white backgrounds. Plan keeps the
  image as is and relies on a surface-colored frame (R9).
