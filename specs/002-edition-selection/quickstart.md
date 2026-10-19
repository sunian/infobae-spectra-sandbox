# Quickstart: Edition Selection

Use this guide to prove the feature works. Commands run from the repository root. The test IDs
(T1, UAT1, and so on) come from [test-plan.md](./test-plan.md).

## Prerequisites

- `npm install` is done. The two new packages come from `npx expo install
  @react-native-async-storage/async-storage expo-splash-screen`.
- For end-to-end checks: Maestro 2.11.0 and the Android emulator from `.maestro/config.yaml`.
- Build the release app first: `npm run build:android:release`. Then install it with
  `adb -s <device-id> install -r android/app/build/outputs/apk/release/app-release.apk`.

## 1. Fast checks (before every push)

```bash
npm run verify
```

Expected: lint, typecheck, and all Jest tests pass. This covers T1 to T7, T9, T10, T12 to T18, T20 to
T22, and T27.

Spot checks:

```bash
npx jest src/domain/edition          # T5, T12: read, validate, save
npx jest src/state                   # T9, T10, T13, T14, T18, T21, T22
npx jest src/screens src/design-system   # T1, T3, T4, T6, T7, T15 to T17, T20
npx jest src/localization            # T27: every key resolves
```

## 2. End-to-end checks (before a PR merge)

```bash
npm run test:e2e
```

Expected: all flows pass, including `edition-select` (T8, T24, T29), `edition-persist` (T11, T23),
`edition-change` (T19, T24, T29), and the five existing flows.

If a screen changed in a visible way, re-record baselines on the fixed device, then check the images:

```bash
.maestro/record-baselines.sh --device <device-id>
```

## 3. Manual checks on a device

1. T25: Open the edition list. Rotate the device. Scroll to the last edition (Mundo). Every row is
   reachable and none is cut off.
2. T26 and T28: Read the new screens in the PR. Each uses design system components only and has no
   hard-coded text.

## 4. User acceptance (human, not run by the implement command)

Use a clean install of the release build.

1. **UAT1**: Open the app. The edition list shows, with no tabs. Tap "Colombia". The five tabs show and
   Home says "Colombia". Take screenshots.
2. **UAT2**: Close the app fully. Turn on airplane mode. Open the app. The tabs show at once on
   "Colombia", and the list never appears. Record the screen.
3. **UAT3**: Open Menu. It shows "Colombia". Tap it. The list marks "Colombia". Tap "México". Go to
   Home. It says "México". Close and reopen the app. It still says "México". Take screenshots.

## 5. Failure recovery check (T13)

The unit tests cover this. To see it on a device, use a debug build, set the saved value to `not-an-edition`
(in AsyncStorage under `preferences.edition`), and open the app. The edition list shows and the app does not crash.
