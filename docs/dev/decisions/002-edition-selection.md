---
title: Edition selection decisions
purpose: Records why edition selection was built the way it was.
portal: dev
feature: 002-edition-selection
parent: Developer Portal
nav_order: 5
---

# Edition selection decisions

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Eight decisions on saving, guarding, and showing the selected edition.
> - **Why:** They explain how one edition value drives the whole app.
> - **Scope / Approach / Order:** Storage, route guard, shared state, splash, names, screens, components, tests.
> - **Biggest risk or open question:** The splash screen hold is checked on a device, not in unit tests.
> - **Check this:** State updates before the save, so a failed save still works for the session.

Source: [`specs/002-edition-selection/research.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs/002-edition-selection/research.md).

| Decision | Reason | Applies to |
|---|---|---|
| Save one edition id with `async-storage` | It is the standard Expo store for small values. Code reads it through a small interface, so tests use a fake. | [`src/domain/edition/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/edition) |
| Guard routes with `Stack.Protected` | A guarded route cannot be reached by a link or back action. The router moves to the tabs on its own after a choice. | [`app/_layout.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app/_layout.tsx) |
| Keep the edition in one React context | Home, Menu, and the guards need the same value. State updates before the save. | [`src/state/EditionContext.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state/EditionContext.tsx) |
| Hold the splash screen until the saved value is read | Showing the list for a moment and then the tabs looks like a bug. | Root layout |
| Keep edition names in `en.json`, with a test that they match the model | Every user-facing string must be in the localization file. | [`en.json`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/localization/en.json) |
| One `EditionScreen` with a `mode` prop | Both lists must show the same editions in the same order. | [`src/screens/EditionScreen.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/screens/EditionScreen.tsx) |
| Add `ListRow` and `OptionList` to the design system first | There was no tappable row or list. A scrolling list covers small screens. | [`src/design-system/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system) |
| Add a shared Maestro step that picks "Colombia" | Existing flows start from a clean install and would stop on the list. | [`.maestro/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro) |
