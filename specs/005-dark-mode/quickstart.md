# Quickstart: Dark Mode

> **TL;DR:** Check the feature with automated tests, a night-mode screenshot pass, and a short manual run on a device. An agent ran all three on the emulator on 2026-10-21 (see "Manual check"). **Check this:** The dark splash (step 1) and the phone change while Dark is chosen (step 4) still need a person on a real device.

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

## Manual check

Run on 2026-10-21 on the Android emulator from `.maestro/config.yaml` (release build, fixture content source). An agent ran it. Steps marked "human" still need a person.

| Step | Result | How it was checked |
|---|---|---|
| 1. Phone dark, clean install: dark splash, dark edition list and screens | Partly checked. Screens: pass. Splash: **human** | `edition-select-dark`, `home-dark`, `article-dark` and the other dark flows pass in night mode. The splash is too short to capture, so its dark color needs a person on a real device. |
| 2. Phone changes while the app is open | Pass | Screenshots 1.5 seconds apart: the Home screen turned from light to dark after `cmd uimode night yes`, with no restart. |
| 3. Menu Theme row shows System, list marks System, choosing Dark turns the app dark | Pass | `theme-select`, `theme-override-menu`, `theme-override-home` |
| 4. Phone changes while Dark is chosen: no change | Not run on a device | Covered by the `ThemeContext` unit test "ignores phone changes after a manual choice". **human** to confirm on a device. |
| 5. Force close, reopen: dark from the first screen, Theme row shows Dark | Pass | `theme-persist` (relaunch without clearing state) |
| 6. Choose System: the app follows the phone again | Pass | `theme-persist` (ends on System with the phone light) and the unit test for System |
| 7. Edition and theme do not change each other | Pass | Unit test "stay independent of each other" and the `ThemeContext` tests |

Known gaps found while checking:

- Fixed after this check (research R10): with the phone Light and the choice Dark, the Android navigation bar stayed light. It now follows the choice. Checked on the Android 14 emulator in both directions with `theme-override` and `theme-override-light-dark`. An Android 15 device is still worth a manual look.
- The native splash screen follows the phone, not the in-app choice (plan R6).
- `home-edition-switch` failed once in a full light pass (it asserts a short loading state, and that run was slow). It passed in 3 of 3 reruns.
