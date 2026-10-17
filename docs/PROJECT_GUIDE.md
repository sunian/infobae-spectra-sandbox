# Project Guide

Infobae is a React Native (Expo, TypeScript) news reader. This guide covers the scaffold only.
Product intent is in `vision.md`. Rules are in `.specify/memory/constitution.md`.

## Prerequisites

- Node.js 20+ and npm
- Android Studio with an emulator (Android), and/or Xcode with a simulator (iOS)
- Maestro CLI (`brew install maestro`) for screenshot tests

## Run the app

1. `npm install`
2. `npm start`
3. Press `a` for the Android emulator or `i` for the iOS simulator.
4. Expect five tabs: Home, My Infobae, Media, Chat, Menu. Each shows its name.

## Folder layout

| Path                 | What goes here                                                                       |
| -------------------- | ------------------------------------------------------------------------------------ |
| `app/`               | Expo Router routes. Thin files that only render a screen from `src/screens/`.        |
| `src/screens/`       | Screen components. Built only from `@/design-system` components.                     |
| `src/navigation/`    | Navigation config (`tabs.ts`: tab keys, order, label keys).                          |
| `src/design-system/` | Tokens (colors, fonts, spacing, typography) and reusable components.                 |
| `src/localization/`  | `en.json` (all user-facing text) and `t()`.                                          |
| `src/domain/`        | Business logic. Every module needs unit tests.                                       |
| `*.test.ts(x)`       | Unit tests, next to the code they test.                                              |
| `.maestro/`          | Screenshot flows (`flows/`), baselines (`baselines/`), device notes (`config.yaml`). |

## Where does new code go?

- **New screen**: add `src/screens/XScreen.tsx` built from `@/design-system`. Add a route file in
  `app/` that renders it. Add a Maestro flow and baseline.
- **New design system component**: add `src/design-system/components/X.tsx`. It reads only tokens.
  Export it from `src/design-system/index.ts`. Add a unit test next to it.
- **New string**: add the key to `src/localization/en.json`. Use `t('key')` in code. Never write
  text in JSX.
- **New business logic**: add a module in `src/domain/` with a test file next to it.
- **New test**: unit test goes next to the code. Screenshot test goes in `.maestro/flows/` with its
  baseline in `.maestro/baselines/`.

## Rules (from the constitution)

- Design system first: no raw `Text`/`View`/`StyleSheet` in `app/` or `src/screens/` (lint enforces).
- Localized strings only: no string literals as JSX children (lint enforces).
- Business logic has unit tests.
- Every screen has a Maestro screenshot test.
- TypeScript strict, no `any`, lint clean.

## Quality gates

| When              | Command                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| Before a push     | `npm run verify` (runs `npm run lint`, `npm run typecheck`, `npm test`) |
| Before a PR merge | `npm run test:e2e` (Maestro screenshot flows)                           |

Screenshot tests need the app installed on the fixed device from `.maestro/config.yaml` (Android
emulator `Pixel_3a_API_34_extension_level_7_arm64-v8a`, portrait). Build and install steps are in
that file. Re-record baselines with `.maestro/record-baselines.sh --device <id>`.
Note: the status bar clock is part of each image. The 98% threshold absorbs it.

**iOS baselines are not recorded yet.** The scaffold was built on a machine without Xcode.

## Starter template

The base project came from `expo-template-blank-typescript` version 58.0.23
(`npx create-expo-app@latest --template blank-typescript`). `package.json`, `app.json`,
`tsconfig.json`, and `assets/` started from it. The sample `App.tsx` and `index.ts` were removed.
