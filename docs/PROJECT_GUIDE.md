# Project Guide

Infobae is a React Native (Expo, TypeScript) news reader. This guide covers the scaffold, edition selection, the Home feed, and Article Detail.
Product intent is in `vision.md`. Rules are in `.specify/memory/constitution.md`.

## Prerequisites

- Node.js 20+ and npm
- Android Studio with an emulator (Android), and/or Xcode with a simulator (iOS)
- Maestro CLI (`brew install maestro`) for screenshot tests

## Run the app

1. `npm install`
2. `npm start`
3. Press `a` for the Android emulator or `i` for the iOS simulator.
4. On a first launch the app shows an edition list. Tap an edition (for example Colombia). Expect five tabs: Home, My Infobae, Media, Chat, Menu. Home shows the news feed for that edition. Tap an article to read it. Later launches skip the list. The Menu tab changes the edition. The app reads the live Infobae APIs.

## Troubleshooting

- **Debug app cannot reach Metro on a phone**: run `adb reverse tcp:8081 tcp:8081`.
- **More than one device attached**: pass the device to the tool (`npx expo run:android --device`,
  `maestro --device <id> test .maestro`, `adb -s <id> ...`).

## Folder layout

| Path                 | What goes here                                                                       |
| -------------------- | ------------------------------------------------------------------------------------ |
| `app/`               | Expo Router routes. Thin files that only render a screen from `src/screens/`.        |
| `src/screens/`       | Screen components. Built only from `@/design-system` components.                     |
| `src/navigation/`    | Navigation config (`tabs.ts`: tab keys, order, label keys).                          |
| `src/state/`         | Shared app state: React contexts and their hooks. Each has a test next to it.        |
| `src/design-system/` | Tokens (colors, fonts, spacing, typography) and reusable components.                 |
| `src/localization/`  | `en.json` (all user-facing text) and `t()`.                                          |
| `src/domain/`        | Business logic. Every module needs unit tests. See "Content sources" below.          |
| `*.test.ts(x)`       | Unit tests, next to the code they test.                                              |
| `.maestro/`          | Screenshot flows (`flows/`), baselines (`baselines/`), device notes (`config.yaml`). |

## Content sources

Home and Article Detail read from a `ContentSource` (`src/domain/content/`). There are two.

| Source    | When                                          | What it does                                                       |
| --------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `live`    | Default. `npm start`, `build:android:release:live`. | Calls the public Infobae APIs (see `docs/API_SPIKE.md`). 15 s timeout. |
| `fixture` | Jest, and `npm run build:android:release`.    | Serves bundled data from `src/domain/content/__fixtures__/`.       |

`EXPO_PUBLIC_CONTENT_SOURCE=fixture` picks the fixture source. Jest sets it in `jest.setup.ts`, so
no test calls the live APIs. The screenshot build sets it so baselines do not depend on live news.

The fixture source picks its behavior from the edition, so a Maestro flow needs no hidden control:

| Edition       | Behavior in the fixture build                              |
| ------------- | ---------------------------------------------------------- |
| Colombia      | Two pages of articles, then an empty page                  |
| Cuba          | Always fails (error state)                                 |
| Centroamérica | Empty (empty state)                                        |
| México        | Page 2 fails once, then works (page error and retry)       |
| Mundo         | First page answers after 6 seconds (loading state)        |
| other         | Same as Colombia                                           |

Folders: `src/domain/content/` (sources), `src/domain/feed/` (paging reducer, relative time),
`src/domain/article/` (body HTML parser, link check, date), `src/domain/infobae/` (URLs, mappers,
images). Hooks that run them: `src/state/useFeed.ts`, `src/state/useArticle.ts`.

## Where does new code go?

- **New screen**: add `src/screens/XScreen.tsx` built from `@/design-system`. Add a route file in
  `app/` that renders it. Add a Maestro flow and baseline.
  - Screen in the tab bar: put the route in `app/(tabs)/`. Add the tab to `src/navigation/tabs.ts`
    (key, route, label key). The tab layout reads that list, so it needs no other edit. Add the
    label to `en.json`.
  - Screen outside the tab bar: put the route in `app/`, outside `app/(tabs)/`.
- **New design system component**: add `src/design-system/components/X.tsx`. It reads only tokens.
  Export it from `src/design-system/index.ts`. Add a unit test next to it.
- **New string**: add the key to `src/localization/en.json`. Keys are nested by area:
  `settings.title` goes under a `settings` object. Use `t('key')` in code. Never write
  text in JSX.
- **New business logic**: add a module in `src/domain/` with a test file next to it. Example:
  `src/domain/formatDate.ts` and `src/domain/formatDate.test.ts`.
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

Build and install the release app for screenshot tests with `npm run build:android:release` (fixture content). `npm run build:android:release:live` makes the same build with the live APIs, for a person to try. Install with
`adb -s <device-id> install -r android/app/build/outputs/apk/release/app-release.apk`. The script
forces a fresh JavaScript bundle. A plain Gradle build can reuse an old bundle and install stale text.

Every flow starts with a clean install, which shows the edition list. Each flow runs
`.maestro/shared/pick-edition.yaml` next, which taps `Colombia`. Baselines therefore show the `Colombia`
edition. A flow for another fixture scenario runs `.maestro/shared/pick-edition-as.yaml` with an
`EDITION` variable.

Do not take a screenshot after a swipe. A swipe does not stop at the same pixel on every run, so the
image would not match. Check scrolled content by text (`assertVisible`, `scrollUntilVisible`) and keep
screenshots for screens at rest. Maestro matches the whole text, so use `'.*part of the text.*'` to
match a part.

Screenshot tests need the app installed on the fixed device from `.maestro/config.yaml` (Android
emulator `Pixel_3a_API_34_extension_level_7_arm64-v8a`, portrait). Build and install steps are in
that file. Re-record baselines with `.maestro/record-baselines.sh --device <id>`. It rewrites every image, and the status bar clock differs on each run, so use `git checkout` to restore the images whose screen did not change.
Note: the status bar clock is part of each image. The 98% threshold absorbs it.

**iOS baselines are not recorded yet.** The scaffold was built on a machine without Xcode.

## Starter template

The base project came from `expo-template-blank-typescript` version 58.0.23
(`npx create-expo-app@latest --template blank-typescript`). `package.json`, `app.json`,
`tsconfig.json`, and `assets/` started from it. The sample `App.tsx` and `index.ts` were removed.
