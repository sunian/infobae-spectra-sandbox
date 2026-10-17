# Research: Project Scaffold

Versions were checked on the npm registry on 2026-10-16.

## R1. Starter template (FR-017, FR-018)

- **Decision**: Use `expo-template-blank-typescript` (58.0.23). Run
  `npx create-expo-app@latest <tmp-dir> --template blank-typescript --no-install`, then move the
  files into the repository root. Run `npm install` once.
- **Rationale**: It is the official minimal Expo template. It has TypeScript and no sample
  screens. It supports Android and iOS. It is maintained by the Expo team and matches the
  constitution stack. `create-expo-app` needs an empty folder, so extract to a temp folder and
  move the files. The repository already holds `vision.md`, `specs/`, and `.specify/`.
- **Alternatives**: `expo-template-default` (has Expo Router and demo screens that we must remove, so
  more cleanup). `expo-template-tabs` (same issue). Bare React Native CLI template (more native
  setup, no managed workflow). Hand-written project (rejected by the user).

## R2. Navigation

- **Decision**: Add Expo Router and use a `(tabs)` route group for the five tabs.
- **Rationale**: It is the Expo standard, needs little config, and gives a bottom tab bar from the
  folder layout. It also gives later features deep-link-ready routes.
- **Alternatives**: React Navigation bottom tabs directly (more manual wiring, same result).

## R3. Localization

- **Decision**: `expo-localization` to read the device locale, and `i18n-js` for lookup. One file
  `src/localization/en.json`. Default and fallback locale is `en`.
- **Rationale**: Small, common, works offline. Meets FR-009 and FR-010.
- **Alternatives**: `i18next` (more features than the scaffold needs).

## R4. Lint and type check

- **Decision**: ESLint flat config with `eslint-config-expo` (58.0.4), plus Prettier. Add rules:
  `@typescript-eslint/no-explicit-any` as error, `react-native/no-raw-text` or
  `react/jsx-no-literals` for literal strings, and `no-restricted-imports` so `app/` and
  `src/screens/` cannot import raw `Text` and `View` from `react-native` for styling.
  `tsc --noEmit` with `strict: true`.
- **Rationale**: Enforces Principles I, II, and V by tool, not by review alone.
- **Alternatives**: Biome (less React Native rule coverage).
- **Open check**: Confirm exact rule names when the rules are written. The import restriction may
  need an allowlist for the design system folder.

## R5. Unit tests

- **Decision**: `jest-expo` (58.0.11) with `@testing-library/react-native`.
- **Rationale**: The Expo preset handles the React Native transform setup.
- **Alternatives**: Vitest (poor React Native support).

## R6. Screenshot tests

- **Decision**: Maestro flows in `.maestro/`. Each flow launches the app, opens one tab, and uses
  Maestro's screenshot assertion against a saved baseline image. Run on one fixed simulator and one
  fixed emulator.
- **Rationale**: The constitution requires Maestro Visual Testing.
- **Risks**: Maestro is not installed on this machine. It is a prerequisite (see quickstart). The
  exact screenshot assertion command and baseline folder rules MUST be confirmed against the
  installed Maestro version before tasks are written. Expo Go shows extra UI, so a development
  build or a built app may be needed for stable screenshots.

## R7. Command surface

- **Decision**: npm scripts: `lint`, `typecheck`, `test`, `test:e2e` (Maestro), `verify` (lint +
  typecheck + test, used before push).
- **Rationale**: One command per gate (FR-011 to FR-015).
