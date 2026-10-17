# Implementation Plan: Project Scaffold

**Branch**: `001-project-scaffold` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-scaffold/spec.md`

## Summary

Create an empty, working Infobae app shell with five placeholder tabs, a small design system,
localized strings, a linter, a type check, unit tests, and Maestro screenshot tests. The base
project comes from the official Expo `blank-typescript` starter template. The template is
downloaded and extracted, not hand-written (FR-017). Only the files that the template does not
provide are written. No product feature is built.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20+ (24.1 is installed here)

**Primary Dependencies**: Expo SDK 58 (`expo-template-blank-typescript@58.0.23`), React Native 0.88,
React 19.3, Expo Router (file-based tabs), `expo-localization`, `i18n-js`

**Storage**: N/A (no persistence in this feature)

**Testing**: `jest-expo` + React Native Testing Library for unit tests; Maestro for screenshot tests

**Target Platform**: Android and iOS (Expo managed workflow, development builds not required)

**Project Type**: mobile-app

**Performance Goals**: Cold start to visible tab bar feels instant on a mid-range device (no
measured target; no content loads)

**Constraints**: Works offline. No network call at runtime. One fixed Maestro device configuration.

**Scale/Scope**: 5 placeholder screens, about 5 design system components, one `en` locale file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How the plan meets it |
|-----------|--------|-----------------------|
| I. Design System First | PASS | `src/design-system/` holds tokens and components. Screens import only from it. A lint rule blocks direct use of raw `Text` and `View` styling in `app/` and `src/screens/`. |
| II. Localization | PASS | All text comes from `src/localization/en.json` through a `t()` helper. A lint rule bans string literals in JSX. |
| III. Unit-Tested Logic | PASS | The `t()` lookup and its fallback have unit tests. The tab config has a test. |
| IV. Screenshot Tests | PASS | One Maestro flow per placeholder screen, with baselines. |
| V. Static Analysis | PASS | ESLint (`eslint-config-expo`) + Prettier. TypeScript strict. `no-explicit-any` as error. |
| VI. Edition/Public API | N/A | No content or edition work in this feature. |

Post-design re-check: PASS. No violations. Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-scaffold/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── project-commands.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
app/                         # Expo Router routes. Thin files only.
├── _layout.tsx              # Root layout
└── (tabs)/
    ├── _layout.tsx          # Bottom tab bar (uses design system TabBar config)
    ├── index.tsx            # Home
    ├── my-infobae.tsx
    ├── media.tsx
    ├── chat.tsx
    └── menu.tsx
src/
├── design-system/           # tokens (colors, fonts, spacing), theme, components/, index.ts
├── localization/            # en.json, index.ts (t() with fallback)
├── navigation/              # tabs.ts (tab names, order, keys)
├── screens/                 # Screen components built from design system
├── domain/                  # Business logic (empty now, with README)
└── __tests__/ or *.test.ts  # Unit tests next to code
.maestro/                    # Screenshot flows + baselines + config
docs/                        # Layout guide (or README section)
eslint.config.js
.prettierrc
package.json  app.json  tsconfig.json   # from the template
```

**Structure Decision**: A single Expo project at the repository root. Route files in `app/` only
render a screen from `src/screens/`. This keeps routing separate from UI and logic, and keeps the
design system independent.

## Complexity Tracking

No constitution violations.
