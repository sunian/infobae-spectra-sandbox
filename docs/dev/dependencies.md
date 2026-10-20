---
title: Dependencies
purpose: Lists the main frameworks and libraries of the app and why each one is used.
portal: dev
parent: Developer Portal
nav_order: 3
---

# Dependencies

## App

| Package | Purpose |
|---|---|
| `expo` | The framework and build tools for React Native. Starter: `expo-template-blank-typescript`. |
| `react-native`, `react` | The UI layer for Android and iOS. |
| `expo-router` | File-based routes and the bottom tabs. `Stack.Protected` guards routes until an edition is chosen. |
| `i18n-js`, `expo-localization` | Looks up text in `en.json` and reads the device language. |
| `@react-native-async-storage/async-storage` | Saves the selected edition on the device. |
| `expo-splash-screen` | Keeps the splash screen visible until the saved edition is read. |
| `react-native-safe-area-context`, `react-native-screens` | Safe areas and native screens, needed by the router. |
| `expo-constants`, `expo-linking`, `expo-status-bar` | Expo support packages used by the router and the app shell. |

## Development tools

| Package | Purpose |
|---|---|
| `typescript` | Strict type checking (`npm run typecheck`). |
| `eslint`, `eslint-config-expo`, `eslint-config-prettier` | Lint rules, including the design system and localization rules. |
| `prettier` | Code format. |
| `jest`, `jest-expo`, `@testing-library/react-native` | Unit tests and component tests. |
| Maestro (installed on your machine, not in `package.json`) | Screenshot tests in [`.maestro/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro). |

## Documentation tools

The docs site uses its own small package in [`tools/portal/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/tools/portal). It is not part of
the app. It holds the page validator and its tests (`vitest`, `mermaid`, `jsdom`, `gray-matter`).
The site itself is built by GitHub Pages with Jekyll and the `just-the-docs` theme.

## Why no data-fetching library?

The feed has one query shape and simple paging. A reducer plus plain `fetch` is easy to unit test
and adds no dependency. Reconsider this when the app has more feeds. See the
[Home feed decisions]({{ site.baseurl }}{% link dev/decisions/003-home-feed-article-detail.md %}).
