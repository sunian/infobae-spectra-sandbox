---
title: App shell decisions
purpose: Records why the project scaffold was built the way it was.
portal: dev
feature: 001-project-scaffold
parent: Developer Portal
nav_order: 4
---

# App shell decisions

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Seven decisions that set up the Expo project, tabs, text, checks, and tests.
> - **Why:** They explain the tools you see in the repo today.
> - **Scope / Approach / Order:** Template, navigation, localization, lint, unit tests, screenshots, commands.
> - **Biggest risk or open question:** The app was checked on Android only. iOS checks are open.
> - **Check this:** Lint rules enforce the constitution, not review alone.

Source: [`specs/001-project-scaffold/research.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs/001-project-scaffold/research.md).

| Decision | Reason | Applies to |
|---|---|---|
| Start from `expo-template-blank-typescript` | It is the official minimal template with TypeScript and no sample screens. | Whole repo |
| Use Expo Router with a `(tabs)` group for the five tabs | It is the Expo standard and gives a tab bar from the folder layout. | [`app/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app) |
| Use `i18n-js` and `expo-localization`, with one `en.json` | It is small, common, and works offline. | [`src/localization/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/localization) |
| Enforce rules in lint: no `any`, no text in JSX, no raw `Text`/`View` in screens | Tools enforce constitution principles I, II, and V. Review alone is not enough. | [`eslint.config.js`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/eslint.config.js) |
| Use `jest-expo` with Testing Library | The Expo preset handles the React Native setup. | Unit tests |
| Use Maestro flows with baseline images | The constitution requires screenshot tests. They run on one fixed emulator. | [`.maestro/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro) |
| One npm script per gate, and `verify` for the push gate | It keeps each check easy to run. | [`package.json`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/package.json) |
