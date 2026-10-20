# Quickstart: Dark Mode

> **TL;DR:** Check the feature with automated tests, a night-mode screenshot pass, and a short manual run on a device. **Check this:** Step 3 (manual run) proves the phone-follow behavior that tests cannot.

How to check that the feature works. Contracts: [contracts/theme-contracts.md](./contracts/theme-contracts.md).
Data rules: [data-model.md](./data-model.md).

## Prerequisites

- Branch `005-dark-mode`. `npm install` done.
- Maestro 2.11.0 and the Android emulator from `.maestro/config.yaml` for the screenshot checks.
- A native build. `userInterfaceStyle` is a native setting, so Expo Go does not show the real
  behavior. Use `npm run build:android:release` for the screenshot passes.

## 1. Unit and integration tests

```sh
npm run verify
```

Expected: lint, typecheck, and all Jest tests pass. This includes the contrast test for both
palettes and the preference tests for bad and missing saved values.

## 2. Screenshot tests

```sh
npm run test:e2e                                    # pass 1: day mode, existing and override flows
adb shell cmd uimode night yes
maestro test --include-tags=dark .maestro           # pass 2: night mode, choice System
adb shell cmd uimode night no
```

Expected: both passes are green. Existing light baselines are unchanged. Every screen has a `-dark`
baseline.

## 3. Manual run on a device or emulator

1. Set the phone to dark. Clear the app data. Open the app. The splash is dark. The edition list is
   dark. Pick an edition. Home, Media, My Infobae, Chat, and Menu are dark. Open an article. It is
   dark.
2. With the app open, switch the phone to light. Every screen turns light in about one second.
3. Open Menu. The Theme row shows "System". Tap it. System is marked. Choose Dark. The app is dark.
4. Switch the phone to dark, then light. The app stays dark.
5. Force close the app. Open it. The app is dark from the first screen. The Theme row shows "Dark".
6. Open Menu, Theme, choose System. The app follows the phone again.
7. Change the edition in Menu. The theme does not change. Change the theme. The edition does not
   change.

## 4. Failure checks (automated, listed here for reference)

- A saved value `"sepia"` opens as System with no crash.
- A storage read error opens as System. A storage write error still changes the theme for the
  session.
