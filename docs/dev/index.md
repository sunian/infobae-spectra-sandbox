---
title: Developer Portal
purpose: Helps a new developer learn how the Infobae app is built and where to put new code.
portal: dev
nav_order: 3
has_children: true
---

# Developer Portal

Infobae is a React Native news reader written in TypeScript with Expo. It runs on Android and iOS.
It reads content from the public Infobae APIs.

## Start here

1. Run the app. Follow the [project guide]({{ site.baseurl }}{% link PROJECT_GUIDE.md %}).
2. Read the [architecture]({{ site.baseurl }}{% link dev/architecture.md %}) to see the main parts.
3. Read the [patterns]({{ site.baseurl }}{% link dev/patterns.md %}) before you add code.
4. Check the [dependencies]({{ site.baseurl }}{% link dev/dependencies.md %}) before you add a library.
5. Read the [decisions]({{ site.baseurl }}{% link dev/decisions/001-project-scaffold.md %}) when you ask "why is it like this?".

## Where things are

| Folder | What is in it |
|---|---|
| [`app/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app) | Routes (Expo Router). Thin files that render a screen. |
| [`src/screens/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/screens) | Screen components. |
| [`src/design-system/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system) | Colors, fonts, and reusable components. |
| [`src/domain/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain) | Business logic with unit tests. |
| [`src/state/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state) | Shared state and hooks. |
| [`src/localization/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/localization) | The text file for all words on screen. |
| [`specs/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs) | The spec, plan, and tasks for each feature. |
| [`.maestro/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro) | Screenshot tests. |

The rules the team follows are in the [constitution](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.specify/memory/constitution.md). Product
intent is in [`vision.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/vision.md). To see the app from a user's side, open the
[Product Portal]({{ site.baseurl }}{% link product/index.md %}).
