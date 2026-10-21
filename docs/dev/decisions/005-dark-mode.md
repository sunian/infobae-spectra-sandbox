---
title: Dark mode decisions
purpose: Records why dark mode was built the way it was.
portal: dev
feature: 005-dark-mode
parent: Developer Portal
nav_order: 8
---

# Dark mode decisions

Source: [`specs/005-dark-mode/research.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs/005-dark-mode/research.md).

| Decision | Reason | Applies to |
|---|---|---|
| Read the phone scheme with `useColorScheme()` and set `userInterfaceStyle` to `automatic` | With `light` the system locks the app to light and the hook never reports dark. This is a native setting, so it needs a new build. | [`app.json`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app.json) |
| Two palettes (`lightColors`, `darkColors`) with the same nine keys. The static `colors` export is gone | The compiler then finds every component that still reads a fixed color. The light values did not change, so light screenshots stay valid. | [`src/design-system/tokens.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system/tokens.ts) |
| A design system `ThemeProvider` with `useColors()` and `useThemedStyles()`. No provider means light | Components build styles per palette. The light default keeps component tests simple. | [`src/design-system/theme.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system/theme.tsx) |
| The saved value is the choice (`system`, `light`, `dark`), never the result | A saved `dark` would stop following the phone. An unknown or unreadable value reads as `system`. | [`src/domain/theme/preference.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/theme/preference.ts) |
| The theme state is its own provider, separate from the edition provider | The two choices must not change each other. A choice made before the saved one is read wins. | [`src/state/ThemeContext.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state/ThemeContext.tsx) |
| The Theme setting is a Menu row that opens a list, like the edition | It reuses `ListRow` and `OptionList`, so no new design system view is needed. It takes 3 taps. | [`src/screens/ThemeScreen.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/screens/ThemeScreen.tsx) |
| Keep the splash screen up until the edition and the theme are both read, and give the splash a dark background | No wrong-theme frame from the app. The native splash cannot follow the in-app choice, so it can differ from it for a moment. | [`app/_layout.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app/_layout.tsx) |
| Set the status bar style from the active scheme, not `auto`. Paint the navigation containers from the palette | `auto` follows the phone, not the choice. Without a navigation theme a dark app flashes white during a push or pop. | [`src/navigation/navigationTheme.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/navigation/navigationTheme.ts) |
| Two Maestro passes: day mode, and night mode with flows tagged `dark`. The tag filter is in the npm scripts, not the config | The first-launch edition list has no Menu, so only the phone setting makes it dark. A config `excludeTags` blocks `--include-tags`. | [`.maestro/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro) |
| A unit test checks WCAG contrast of text and tab colors in both palettes | It catches a later color change. The inactive tab uses 3:1. | [`tokens.test.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system/tokens.test.ts) |
