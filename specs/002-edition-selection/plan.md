# Implementation Plan: Edition Selection

**Branch**: `002-edition-selection` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-edition-selection/spec.md`

## Summary

Ask the reader for a news edition on first launch, save the choice on the device, and let the reader
change it from the Menu tab. Home shows the selected edition name until the feed feature exists.

The approach has four parts:

1. A pure domain module reads and validates the saved edition id. It takes a storage object as an
   argument, so tests use a fake.
2. One React context holds the selected edition. Every screen reads it from there (FR-016).
3. Expo Router route guards (`Stack.Protected`) decide between the edition list and the tabs. This
   gives "no tabs until a choice" (FR-003) and no way back to the tabs by the system back action.
4. Two new design system components (a tappable row and an option list) build both edition screens.

The test plan at [test-plan.md](./test-plan.md) sets the tests. See "Testing obligations" below.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20+

**Primary Dependencies**: Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58 (already
installed). New: `@react-native-async-storage/async-storage` 2.2.0 and `expo-splash-screen` ~58.0.10,
both installed with `npx expo install` so the versions match the SDK.

**Storage**: Device-local key-value storage (AsyncStorage). One key holds the edition id string.

**Testing**: `jest-expo` + React Native Testing Library for unit and integration tests. Maestro for
end-to-end and screenshot tests.

**Target Platform**: Android and iOS. iOS checks stay deferred (see "Deferred work").

**Project Type**: mobile-app

**Performance Goals**: A saved edition is read before the first screen shows. The native splash
screen stays up until the read ends, so the reader never sees the edition list flash (this is the plan's
answer to the open spec gap, see R4).

**Constraints**: Works offline. No network call at launch. A failed or bad read or write never crashes
the app.

**Scale/Scope**: 9 editions, 1 new screen component (used by 2 routes), 2 changed screens, 2 new design system components, 1
changed design system component, about 10 new strings, 3 new Maestro flows, 5 changed Maestro flows.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How the plan meets it |
|-----------|--------|-----------------------|
| I. Design System First | PASS | The edition screens use only `@/design-system`. Two new components (`ListRow`, `OptionList`) are added to the design system first. Lint already blocks raw `Text`, `View`, `StyleSheet`, and `Pressable` in `app/` and `src/screens/`. |
| II. Localization | PASS | Edition names, titles, and labels go in `src/localization/en.json`. A unit test checks each edition id has a name key. Lint already bans string literals in JSX. |
| III. Unit-Tested Logic | PASS | `src/domain/edition/preference.ts` has unit tests for read, validate, and save, including every bad-value case. The context has integration tests. |
| IV. Screenshot Tests | PASS | New flows for the edition selection screen and the Menu edition list. The Home and Menu baselines are re-recorded. All flows get a first-launch step. |
| V. Static Analysis | PASS | Same ESLint, Prettier, and strict TypeScript. No `any`. |
| VI. Edition-Aware, Public-API Content | PASS | This feature implements the "select at first launch, save, change in Menu" half of the principle. It uses no private back end and no network. |

Post-design re-check: PASS. No violations. Complexity Tracking is not needed.

## Testing obligations

This section carries the approved test plan into the plan. Source: [test-plan.md](./test-plan.md).

1. **Every P1 condition has a task that writes the test before the code it covers.** The P1 conditions
   are T1, T2, T4 to T14, T22, and T29. Test-first applies to T1 to T7, T9, T10, T12 to T14, T22 (unit and
   integration). The Maestro conditions (T8, T11, T29) are written with the flows, after the screens exist.
2. **Each condition is tested at the level the test plan assigns it.**

   | Level | Conditions | Where the tests live |
   |---|---|---|
   | unit | T2, T5, T12, T27 | `src/domain/edition/preference.test.ts`, `src/domain/infobae/infobae.test.ts` (names), `src/localization/index.test.ts` (existing) |
   | integration | T1, T3, T4, T6, T7, T9, T10, T13 to T18, T20 to T22 | `src/state/EditionContext.test.tsx`, `src/screens/*.test.tsx`, `src/design-system/components/*.test.tsx` |
   | end-to-end | T8, T11, T19, T23, T24, T29 | `.maestro/flows/edition-*.yaml` |
   | manual | T25, T26, T28 | PR review and a device check, recorded in the PR |

3. **The regression scope stays green.** The five existing Maestro flows, `assert-tabs.yaml`,
   `tabs.test.ts`, `index.test.ts` (localization), `Placeholder.test.tsx`, and `infobae.test.ts`. The five flows
   change in this feature. They get a shared `pick-edition.yaml` step (the test plan's risk-driven
   addition).
4. **UAT.** The three UAT scenarios (UAT1 to UAT3) become tasks in a final phase titled "User Acceptance
   (UAT) — not executed by the implement command". Each uses the format
   `[UAT] UAT<n> (<verifies>) <journey> — executor: <executor>`. All three executors are `human`.

## Project Structure

### Documentation (this feature)

```text
specs/002-edition-selection/
├── spec.md
├── test-plan.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── edition-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                 # CHANGED: wraps the stack in EditionProvider, adds route guards
├── select-edition.tsx          # NEW: thin route, first-launch edition list
├── change-edition.tsx          # NEW: thin route, edition list opened from Menu
└── (tabs)/                     # unchanged

src/
├── domain/
│   ├── edition/
│   │   ├── preference.ts       # NEW: parse, load, and save the saved edition id
│   │   └── preference.test.ts  # NEW
│   └── infobae/                # existing. editions.ts is the edition list
├── state/
│   ├── EditionContext.tsx      # NEW: provider and useEdition() hook
│   └── EditionContext.test.tsx # NEW
├── screens/
│   ├── EditionScreen.tsx       # NEW: one screen, two modes (first-launch, change)
│   ├── EditionScreen.test.tsx  # NEW
│   ├── HomeScreen.tsx          # CHANGED: shows the selected edition name
│   └── MenuScreen.tsx          # CHANGED: shows the current edition, opens change-edition
├── design-system/
│   ├── components/
│   │   ├── ListRow.tsx         # NEW: tappable row with label, optional value, selected mark
│   │   ├── OptionList.tsx      # NEW: scrolling list of rows, one can be marked selected
│   │   ├── Placeholder.tsx     # CHANGED: optional detail line
│   │   └── *.test.tsx          # NEW tests for ListRow and OptionList
│   └── index.ts                # CHANGED: exports
└── localization/
    └── en.json                 # CHANGED: editions.*, editionSelect.*, menu.* keys

.maestro/
├── flows/
│   ├── edition-select.yaml     # NEW
│   ├── edition-persist.yaml    # NEW
│   ├── edition-change.yaml     # NEW
│   └── home.yaml, menu.yaml, my-infobae.yaml, media.yaml, chat.yaml   # CHANGED
├── shared/pick-edition.yaml    # NEW
└── baselines/                  # NEW and re-recorded images

docs/PROJECT_GUIDE.md           # CHANGED: adds src/state/ to the folder layout
```

**Structure Decision**: Keep the scaffold layout. Routes stay thin. Screens live in `src/screens/` and
use only design system components. Business logic (reading and validating the saved value) stays in
`src/domain/`, free of React. Shared app state is new, so it gets one new folder, `src/state/`, and the
guide's folder table is updated in the same PR.

## Deferred work

- **iOS verification** of this feature. The same user decision as `001-project-scaffold` T025 and T055
  applies. The code is cross-platform and uses no platform-specific API. Back-action behavior (T8) exists
  on Android only.
- **A second language.** Only `en.json` exists.

## Complexity Tracking

Not needed. There are no constitution violations.
