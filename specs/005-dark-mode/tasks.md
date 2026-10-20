---

description: "Task list for Dark Mode"
---

# Tasks: Dark Mode

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** 46 tasks that add a light and a dark palette, a theme provider, the System / Light / Dark choice, a Menu Theme row, and dark screenshot tests.
> - **Why:** Readers want the app to match the phone and to override it (issue #3).
> - **Scope / Approach / Order:** Setup, then palettes and component migration, then US1 (follow the phone), then US2 (Menu override and saved choice), then polish.
> - **Biggest risk or open question:** Three facts need a check in T001 (splash dark option, router `ThemeProvider`, Maestro tag flags). The splash does not follow the in-app override (plan R6).
> - **Check this:** US1 alone is the MVP and ships a working dark mode (T020 to T030). Screenshot tasks (T030, T042) need the emulator and a release build.

**Input**: Design documents from `/specs/005-dark-mode/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/theme-contracts.md, quickstart.md

**Tests**: Required (constitution III and IV, spec SC-005 and SC-006). Test tasks come before the code they cover. See each test fail for the right reason before you write the code. Do not edit a test to make it pass.

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root (`/Users/jamessun/Projects/infobae-spectra-sandbox`). Spec acceptance scenarios are named "US1-AC1" and so on. Spec requirements are named "FR-001" and so on. Plan decisions are named "R1" and so on (`research.md`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: Which user story the task belongs to (US1 or US2)
- Each task names exact file paths

## Key Rules for All Tasks

- **Constitution I**: Screens in `app/` and `src/screens/` use only components from `src/design-system/`. No screen or route holds a color literal. Palettes live only in `src/design-system/tokens.ts`.
- **Constitution II**: No user-facing string literals in JSX. All text comes from `t()` and `src/localization/en.json`.
- **Constitution V**: No `any` types. TypeScript strict. Lint clean. No lint rule disabled.
- **Constitution VI**: No content or API change. The theme choice and the edition choice stay separate (FR-015).
- **Light stays the same.** `lightColors` keeps today's nine values. A changed light baseline in Maestro means a regression.
- **iOS**: iOS checks stay deferred (`001-project-scaffold` T025 and T055). Write cross-platform code. Do not claim iOS verification.
- **Emulator tasks** need Maestro 2.11.0, the Android emulator from `.maestro/config.yaml`, and a fresh release build (`npm run build:android:release`, which uses the fixture content source). `userInterfaceStyle` is a native setting, so Expo Go is not enough.
- **Gate before push**: `npm run verify` passes. **Gate before merge**: `npm run test:e2e` and the dark pass both pass.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Close three open facts and set the native configuration.

- [ ] T001 Check three facts and write each answer into `specs/005-dark-mode/research.md` under R6, R7, and R8 (change "verify" to the result). (a) The exact option name for a dark splash background in the `expo-splash-screen` plugin for SDK 58 (read `node_modules/expo-splash-screen` docs or its `app.plugin.js`). (b) Whether `expo-router` 58 exports `ThemeProvider` (run `grep -rn "ThemeProvider" node_modules/expo-router/build/index.d.ts`). If it does not, write the fallback in R7: per-screen `contentStyle` and header options from `useColors()`. (c) Whether Maestro 2.11.0 accepts `--include-tags` and `--exclude-tags` on `maestro test`, and the `tags:` key in a flow's front matter (run `maestro test --help`). If tag flags do not exist, write the fallback in R8: a `dark/` flow folder run by a second `maestro test` command.
- [ ] T002 Change `app.json`: set `expo.userInterfaceStyle` to `"automatic"` (R1). Change the `"expo-splash-screen"` plugin entry from a plain string to `["expo-splash-screen", { ... }]` with a light background `#FFFFFF` and a dark background `#121212`, using the option name found in T001(a). Do not add or change an image. Run `npx expo config --type public` and confirm it prints without error.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Palettes, the theme provider, the migrated components, and the navigation theme. Both user stories need these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. The static `colors` export stays until T027 so every task here compiles.

### Palettes

- [ ] T003 [P] Create `src/design-system/tokens.test.ts` first (R2, R9). Tests: `lightColors` and `darkColors` have exactly the same keys (`background`, `surface`, `textPrimary`, `textSecondary`, `tabActive`, `tabInactive`, `border`, `placeholder`, `link`); every value is a 6-digit hex string; `lightColors` equals today's values (`background` `#FFFFFF`, `surface` `#F5F5F5`, `textPrimary` `#111111`, `textSecondary` `#666666`, `tabActive` `#0A5CFF`, `tabInactive` `#8A8A8A`, `border` `#E0E0E0`, `placeholder` `#E6E6E6`, `link` `#0A5CFF`). Add a local `contrastRatio(foreground, background)` helper (WCAG 2.x relative luminance) and assert, for both palettes: `textPrimary`, `textSecondary`, and `link` on `background` and on `surface` are at least 4.5; `tabActive` on `background` is at least 4.5; `tabInactive` on `background` is at least 3. Run the file and confirm it fails because `darkColors` does not exist.
- [ ] T004 Edit `src/design-system/tokens.ts`: add `export const lightColors` (today's nine values, `as const`), `export const darkColors` with the same keys (start from the R2 values: `background` `#121212`, `surface` `#1E1E1E`, `textPrimary` `#F2F2F2`, `textSecondary` `#A8A8A8`, `tabActive` `#6EA2FF`, `tabInactive` `#8A8A8A`, `border` `#2E2E2E`, `placeholder` `#2A2A2A`, `link` `#6EA2FF`), and `export type ColorPalette = Record<keyof typeof lightColors, string>`. Type `darkColors` as `ColorPalette` so a missing key fails the compile. Keep `export const colors = lightColors;` for now with a comment "removed in T027". Run T003 and confirm it passes. If a contrast assertion fails, adjust only the dark values (and note the change in `research.md` R2).

### Theme provider

- [ ] T005 [P] Create `src/design-system/theme.test.tsx` first (contract section 3). Tests: `useColors()` returns `lightColors` with no provider; under `<ThemeProvider scheme="dark">` it returns `darkColors`; under `scheme="light"` it returns `lightColors`; `useColorSchemeName()` returns `'light'` with no provider and the given scheme under a provider; `useThemedStyles(factory)` calls the factory with the active palette, returns the same object across re-renders with the same scheme (memoized), and returns a new object when the scheme changes. Use a small test component. Confirm the file fails because `theme.tsx` does not exist.
- [ ] T006 Create `src/design-system/theme.tsx` with `ThemeProvider({ scheme, children })`, `useColors()`, `useColorSchemeName()`, and `useThemedStyles(factory)` (the last wraps the factory result in `StyleSheet.create` and memoizes by palette). Use a React context whose default value is the light scheme. Export all four names, `lightColors`, `darkColors`, and the `ColorPalette` type from `src/design-system/index.ts`. Run T005 and confirm it passes.

### Component migration

Each task below changes one component and its test. The component stops reading the static `colors` and reads `useColors()` or `useThemedStyles()`. Move the colored `StyleSheet.create` entries into a factory `(colors: ColorPalette) => ({ ... })`. Keep layout values (padding, sizes) where they are. The test renders the component under `<ThemeProvider scheme="light">` and `<ThemeProvider scheme="dark">` and checks the color style for each scheme (use `lightColors` and `darkColors` values, not literals). Run the component test and `npm run typecheck`.

- [ ] T007 [P] Migrate `src/design-system/components/Banner.tsx` (`surface`, `border`) and update `src/design-system/components/Banner.test.tsx`.
- [ ] T008 [P] Migrate `src/design-system/components/FeedItemCard.tsx` (`border`, `background`, `surface` for the pressed state) and update `src/design-system/components/FeedItemCard.test.tsx`.
- [ ] T009 [P] Migrate `src/design-system/components/FeedList.tsx` (`tabActive` for the `RefreshControl` `colors` and `tintColor`) and update `src/design-system/components/FeedList.test.tsx`.
- [ ] T010 [P] Migrate `src/design-system/components/ListFooter.tsx` (`tabActive` for the spinner) and update `src/design-system/components/ListFooter.test.tsx`.
- [ ] T011 [P] Migrate `src/design-system/components/ListRow.tsx` (`border`, `background`, `surface` for the pressed state) and update `src/design-system/components/ListRow.test.tsx`.
- [ ] T012 [P] Migrate `src/design-system/components/RichText.tsx` (`textPrimary`, `link`) and update `src/design-system/components/RichText.test.tsx`.
- [ ] T013 [P] Migrate `src/design-system/components/Screen.tsx` (`background`) and update `src/design-system/components/Screen.test.tsx`.
- [ ] T014 [P] Migrate `src/design-system/components/StateView.tsx` (`tabActive` for the spinner, `border`, `surface`) and update `src/design-system/components/StateView.test.tsx`.
- [ ] T015 [P] Migrate `src/design-system/components/TabBarLabel.tsx` (`tabActive`, `tabInactive`; this includes the `tabBarIcon` helper if it reads a color) and add a test file `src/design-system/components/TabBarLabel.test.tsx` if none exists.
- [ ] T016 [P] Migrate `src/design-system/components/Text.tsx`: the `TONES` map moves inside the component and reads `useColors()` (`textPrimary`, `textSecondary`, `link`). Update `src/design-system/components/Text.test.tsx` so the tone test checks both schemes.
- [ ] T017 [P] Migrate `src/design-system/components/Thumbnail.tsx` (`placeholder`) and update `src/design-system/components/Thumbnail.test.tsx`. Then run `grep -rn "colors" src/design-system/components --include=*.tsx -l` and open each file the grep lists that is not in T007 to T016. Components such as `ArticleHeader`, `ArticleBody`, `ArticleImage`, `Heading`, `OptionList`, `ListHeader`, and `Placeholder` should only compose the migrated ones. If one reads a color directly, migrate it the same way and add its test.

### Navigation theme

- [ ] T018 [P] Create `src/navigation/navigationTheme.test.ts` first (contract section 4). Tests: for `light` and `dark`, `navigationTheme(scheme, palette)` returns `dark: scheme === 'dark'`, `colors.background` is `palette.background`, `colors.card` is `palette.surface`, `colors.text` is `palette.textPrimary`, `colors.border` is `palette.border`, `colors.primary` is `palette.tabActive`. Confirm it fails.
- [ ] T019 Create `src/navigation/navigationTheme.ts` that returns the object above. Add the font fields the navigation library requires by spreading the library's `DefaultTheme` and overriding `dark` and `colors` (import the types and the default theme from the package the T001(b) check found). Run T018 and confirm it passes.

**Checkpoint**: `npm run verify` passes. The app still looks the same (everything is light).

---

## Phase 3: User Story 1 - App matches the phone's light or dark setting (Priority: P1) 🎯 MVP

**Goal**: With no manual choice, the app shows the theme of the phone and follows phone changes.

**Independent Test**: Phone dark, clean install, pick an edition. Every screen is dark. Switch the phone to light. The app turns light without a restart (spec US1).

### Preference logic (resolve only)

- [ ] T020 [P] [US1] Create `src/domain/theme/preference.test.ts` first (data-model "ColorScheme"). Tests for `resolveScheme(preference, system)`: `light` with any system value gives `light`; `dark` with any system value gives `dark`; `system` with `light` gives `light`; `system` with `dark` gives `dark`; `system` with `null` and with `undefined` gives `light`. Confirm it fails.
- [ ] T021 [US1] Create `src/domain/theme/preference.ts` with `export type ThemePreference = 'system' | 'light' | 'dark'`, `export type ColorScheme = 'light' | 'dark'`, `export const THEME_STORAGE_KEY = 'preferences.theme'`, `export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']`, and `resolveScheme`. Import nothing from React. Run T020 and confirm it passes.

### Theme state (phone only)

- [ ] T022 [P] [US1] Create `src/state/ThemeContext.test.tsx` first. Mock `useColorScheme` from `react-native` (`jest.spyOn` on the module export or `jest.mock('react-native/Libraries/Utilities/useColorScheme')`, whichever works with `jest-expo`). Tests: with the phone `dark`, a child that calls `useThemePreference()` sees `scheme: 'dark'` and `preference: 'system'`, and a child that calls `useColors()` sees `darkColors` (US1-AC1); with the phone `light`, `lightColors` (US1-AC2); changing the mocked scheme and re-rendering changes the scheme with no remount (US1-AC3, FR-003); a phone value of `null` gives `light` (edge case); `useThemePreference()` outside a provider throws "useThemePreference must be used inside a ThemeProvider." Confirm it fails.
- [ ] T023 [US1] Create `src/state/ThemeContext.tsx` (contract section 2, phone part). `ThemeProvider({ children })` reads `useColorScheme()`, computes `scheme` with `resolveScheme('system', systemScheme)`, and renders the design system `ThemeProvider` around the children. Export `useThemePreference()` returning the `ThemeState` of `data-model.md` with `status: 'ready'`, `preference: 'system'`, and a `setPreference` that does nothing yet (T035 completes it). Add a comment that storage comes in US2. Run T022 and confirm it passes.

### Wire the app

- [ ] T024 [US1] Edit `app/_layout.tsx`. Wrap the tree in the state `ThemeProvider` (inside `EditionProvider` or beside it, but above `RootNavigator`). In `RootNavigator` read `useColors()` and `useThemePreference().scheme`. Replace `colors.background` and `colors.textPrimary` in the two header option blocks with `useColors()` values. Wrap the `Stack` in the navigation `ThemeProvider` with `navigationTheme(scheme, colors)` (or the T001(b) fallback). Replace `<StatusBar style="dark" />` with a style of `light` for the dark scheme and `dark` for the light scheme (FR-012). Do not import a palette in this file; use hooks only.
- [ ] T025 [P] [US1] Edit `app/(tabs)/_layout.tsx`: read `useColors()` inside `TabsLayout` and use it for `tabBarActiveTintColor`, `tabBarInactiveTintColor`, and `tabBarStyle`.
- [ ] T026 [US1] Update `src/navigation/RootLayout.test.tsx` so it still passes with the new provider. Add tests: with the phone dark, the status bar style is `light` and the stack header background is `darkColors.background`; with the phone light, `dark` and `lightColors.background` (FR-012, US1-AC4). Run the file.
- [ ] T027 [US1] Remove `export const colors = lightColors;` from `src/design-system/tokens.ts` and the `colors` name from `src/design-system/index.ts`. Fix every import the compiler reports (for example `src/design-system/components/Text.test.tsx` and `RichText.test.tsx` use `lightColors` or `useColors()`). Run `npm run typecheck` and `npm run lint`, then `grep -rn "colors" app src --include=*.tsx --include=*.ts -l` and confirm no file outside `src/design-system/` imports a palette directly (hooks only).

### Screenshot tests (dark pass)

- [ ] T028 [P] [US1] Create dark Maestro flows in `.maestro/flows/`: `edition-select-dark.yaml`, `home-dark.yaml`, `article-dark.yaml`, `my-infobae-dark.yaml`, `media-dark.yaml`, `chat-dark.yaml`. Each copies its light flow (`edition-select.yaml`, `home.yaml`, `article.yaml`, `my-infobae.yaml`, `media.yaml`, `chat.yaml`), adds `tags: [dark]` in the front matter, and uses the baseline name `<screen>-dark`. Keep the RECORD switch and the 98 percent threshold of the existing flows. The edition-select dark flow must not pick an edition before its screenshot. Do not create `menu-dark.yaml` here (T041).
- [ ] T029 [US1] Edit `.maestro/config.yaml` so the default run skips the `dark` tag (use the filter syntax found in T001(c)), and document the night-mode pass in its header comment (`adb shell cmd uimode night yes`, then `maestro test --include-tags=dark .maestro`, then `adb shell cmd uimode night no`). Edit `.maestro/record-baselines.sh` to run both passes, to switch the emulator to night mode for the second pass, and to restore day mode on exit (use a `trap`). It accepts `--device <id>` as before.
- [ ] T030 [US1] On the emulator, build with `npm run build:android:release`, install the APK, and run `.maestro/record-baselines.sh`. Confirm that (a) every existing light baseline in `.maestro/baselines/` is byte-different by less than the 98 percent threshold (run `git diff --stat .maestro/baselines` and `npm run test:e2e` and confirm the light pass passes), and (b) the new `edition-select-dark.png`, `home-dark.png`, `article-dark.png`, `my-infobae-dark.png`, `media-dark.png`, and `chat-dark.png` show a dark screen with readable text (open each image and check). Run the dark pass with `maestro test --include-tags=dark .maestro` and confirm it passes. If an emulator is not available, leave this task unchecked and say so in the final report.

**Checkpoint**: US1 works alone. A dark phone gives a dark app. This is the MVP.

---

## Phase 4: User Story 2 - Override the theme from the Menu (Priority: P2)

**Goal**: The reader picks System, Light, or Dark in the Menu. The app applies it at once and remembers it.

**Independent Test**: Phone light. Menu, Theme, Dark. All screens dark. Close and reopen. Still dark. Choose System. Light again (spec US2).

### Strings

- [ ] T031 [P] [US2] Add the keys of `contracts/theme-contracts.md` section 5 to `src/localization/en.json`: `menu.theme` "Theme", `themeSelect.title` "Theme", `theme.system` "System", `theme.light` "Light", `theme.dark` "Dark". Run `src/localization/index.test.ts` and confirm it passes.

### Preference logic (save and load)

- [ ] T032 [P] [US2] Extend `src/domain/theme/preference.test.ts` first. Tests: `parseThemePreference` returns the value for `'system'`, `'light'`, `'dark'`, and returns `'system'` for `'sepia'`, `''`, `null`, `undefined`, `42`, and an object (FR-009); `loadThemePreference` returns the stored value, returns `'system'` when nothing is stored, and returns `'system'` when `getItem` rejects; `saveThemePreference` calls `setItem` with `THEME_STORAGE_KEY` (`preferences.theme`) and the value and returns `true`, and returns `false` without rejecting when `setItem` rejects (FR-010). Use a fake `KeyValueStorage`. Confirm the new tests fail.
- [ ] T033 [US2] Add `parseThemePreference`, `loadThemePreference`, and `saveThemePreference` to `src/domain/theme/preference.ts`. Import the `KeyValueStorage` type from `src/domain/edition/preference.ts`. Copy the never-reject style of the edition module. Run the file and confirm every test passes.

### Theme state (storage and choice)

- [ ] T034 [US2] Extend `src/state/ThemeContext.test.tsx` first. Tests: `status` is `loading` until the saved value is read, then `ready`; a saved `dark` with the phone `light` gives `scheme: 'dark'` and `preference: 'dark'` (US2-AC6); an unknown saved value gives `preference: 'system'` (FR-009); a read that rejects gives `system` and `ready`; `setPreference('dark')` changes `scheme` in the same render and calls `setItem` with `dark` (US2-AC2); after `setPreference('light')` a phone change to `dark` does not change `scheme` (US2-AC4, FR-007); after `setPreference('system')` a phone change is followed again (US2-AC5); when `setItem` rejects the scheme still changes (FR-010); three quick `setPreference` calls end on the last value and do not throw (edge case). Confirm the new tests fail.
- [ ] T035 [US2] Complete `src/state/ThemeContext.tsx`: add an optional `storage` prop (default `AsyncStorage`, as `EditionProvider` does), load the saved value in an effect that ignores a result after unmount, expose `status: 'loading' | 'ready'`, and make `setPreference` update state first, then call `saveThemePreference` and log a `__DEV__` warning on `false` (copy the edition wording). While `loading`, `preference` is `system`. Run T034 and the T022 tests and confirm they pass.
- [ ] T036 [US2] Edit `app/_layout.tsx`: `RootNavigator` waits for both `useEdition().status` and `useThemePreference().status` to be `ready` before it calls `SplashScreen.hideAsync()` and before it renders the stack (FR-008, R6). Register the new route inside the protected group: `<Stack.Screen name="change-theme" options={{ headerShown: true, title: t('themeSelect.title'), headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />`, with `colors` from `useColors()`. Add a test to `src/navigation/RootLayout.test.tsx`: the splash does not hide while the theme read is pending, and hides when both reads finish.

### Theme screen and Menu row

- [ ] T037 [P] [US2] Create `src/screens/ThemeScreen.test.tsx` first (contract section 5). Mock `expo-router` like `src/screens/MenuScreen.test.tsx`. Tests: three rows show in the order "System", "Light", "Dark"; the current choice has `accessibilityState.selected` true and the others false; a new install marks "System" (US2-AC1); tapping "Dark" calls `setPreference('dark')` and `router.back()`; tapping the marked row changes nothing visible and does not throw; every row has the `button` role. Confirm it fails.
- [ ] T038 [US2] Create `src/screens/ThemeScreen.tsx` and `app/change-theme.tsx`. The screen uses `Screen` with the `['left', 'right', 'bottom']` edges (like the edition `change` mode), `OptionList` with one option per entry in `THEME_PREFERENCES` (label `t(`theme.${key}`)`), `selectedKey` from `useThemePreference().preference`, and an `onSelect` that validates the key with `parseThemePreference`, calls `setPreference`, and calls `router.back()`. The route file renders `<ThemeScreen />` and nothing else. Run T037 and confirm it passes.
- [ ] T039 [P] [US2] Update `src/screens/MenuScreen.test.tsx` first. Add tests: the Menu shows a "Theme" label with the value "System" for a new install, and "Dark" when the saved choice is dark; tapping the Theme row calls `push('/change-theme')`; the Edition row still works. Wrap the existing renders in the state `ThemeProvider` with a fake storage. Confirm the new tests fail.
- [ ] T040 [US2] Edit `src/screens/MenuScreen.tsx`: add a second `ListRow` with `label={t('menu.theme')}`, `value={t(`theme.${preference}`)}` from `useThemePreference()`, and `onPress={() => router.push('/change-theme')}`. Run T039 and confirm it passes.

### Screenshot tests (override)

- [ ] T041 [P] [US2] Create Maestro flows in `.maestro/flows/`: `menu-dark.yaml` (tag `dark`, OS night mode, baseline `menu-dark`), `theme-select.yaml` (clear state, pick edition, open Menu, tap "Theme", screenshot `theme-select`), `theme-select-dark.yaml` (tag `dark`, same, baseline `theme-select-dark`), `theme-override.yaml` (day mode: clear state, pick edition, Menu, Theme, tap "Dark", wait, screenshot `theme-override-menu` on the Menu after the pop, tap "Home", screenshot `theme-override-home`), and `theme-persist.yaml` (day mode: clear state, pick edition, set Dark as above, then `launchApp` with no `clearState`, assert a dark Menu screenshot `theme-persist-menu` and that the Menu shows "Dark"; then Theme, tap "System", assert a light Menu screenshot against the existing `menu` look using baseline `theme-system-menu`). Keep the RECORD switch and the 98 percent threshold.
- [ ] T042 [US2] On the emulator, build with `npm run build:android:release`, install the APK, and run `.maestro/record-baselines.sh`. Confirm that `menu.png` and `menu-dark.png` now show the Theme row, that `theme-select*.png`, `theme-override-*.png`, `theme-persist-menu.png`, and `theme-system-menu.png` show the right theme (open each image), and that both passes pass (`npm run test:e2e`, then the dark pass). Confirm no other baseline changed (`git status .maestro/baselines`). If an emulator is not available, leave this task unchecked and say so in the final report.

**Checkpoint**: US1 and US2 both work. The choice survives a relaunch.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T043 [P] Create or extend `src/state/ThemeContext.test.tsx` with an integration test for FR-015: render `EditionProvider` and `ThemeProvider` together with separate fake storages, call `setPreference('dark')` and confirm the edition value and its storage are untouched; call `setEdition('peru')` and confirm the theme value and its storage are untouched.
- [ ] T044 [P] Run `grep -rnE "#[0-9A-Fa-f]{6}|rgba?\(" app src --include=*.ts --include=*.tsx` and confirm every match is in `src/design-system/tokens.ts` or in a test file (FR-014). Fix any other match by moving the color into a palette key (add the key to both palettes and to `data-model.md`).
- [ ] T045 Run `npm run verify` (lint, typecheck, all Jest tests) and confirm it passes. Run `npm run verify:docs` and confirm 0 errors (the docs hook may have changed pages).
- [ ] T046 Run the manual steps in `quickstart.md` section 3 on a device or emulator in a release build. Record the result of each of the 7 steps under a "Manual check" heading at the end of `quickstart.md`. Step 1 (dark splash) and step 2 (live phone change) are the UAT scenarios that only a person can confirm. If a step cannot run, say which one and why.

---

## Dependencies & Execution Order

- **Phase 1** (T001, T002): T002 needs T001(a). Start first.
- **Phase 2** (T003 to T019): needs Phase 1 only for T019 (T001(b)). T003 then T004. T005 then T006 (T006 also needs T004). T007 to T017 need T006 and run in parallel. T018 then T019. Phase 2 blocks every user story.
- **US1** (T020 to T030): needs Phase 2. T020, T021 and T022, T023 are two test-then-code pairs (T023 needs T021). T024 and T025 need T023 and T019. T026 needs T024. T027 needs T024, T025, and T007 to T017. T028 needs T027 for a stable app but can be written earlier. T029 then T030 (T030 needs T028 and T029).
- **US2** (T031 to T042): needs US1 (T023 and T024 especially). T031, T032, T037, T039 can start together once US1 is done. T033 needs T032. T034 then T035 (T035 needs T033). T036 needs T031 and T035. T038 needs T031, T035, T037. T040 needs T031, T035, T039. T041 needs T038 and T040. T042 needs T041.
- **Polish** (T043 to T046): needs US1 and US2. T043 and T044 are parallel. T045 after them. T046 last.

### Story order

US1 (P1) first. It has no dependency on US2. US2 (P2) builds on US1's provider and wiring. Do not start US2 until the US1 checkpoint holds.

## Parallel Opportunities

- Phase 2: after T006, run T007 to T017 in parallel (11 files). T003 and T005 are parallel, and T018 is parallel with both.
- US1: T020 and T022 (two test files). T024 with T025 after T023. T028 (flows) while T024 to T027 are in progress.
- US2: T031, T032, T037, T039 start together. T041 can be drafted while T040 finishes.
- Polish: T043 and T044.

### Example: Phase 2 component migration

```text
Agent A: T007 Banner         T008 FeedItemCard     T009 FeedList
Agent B: T010 ListFooter     T011 ListRow          T012 RichText
Agent C: T013 Screen         T014 StateView        T015 TabBarLabel
Agent D: T016 Text           T017 Thumbnail + grep check
```

## Implementation Strategy

1. **MVP = Phase 1 + Phase 2 + US1** (T001 to T030). The app follows the phone. This is releasable.
2. **Increment = US2** (T031 to T042). The Menu override and the saved choice.
3. **Finish = Polish** (T043 to T046).

Stop after each checkpoint and run `npm run verify`. Commit per task or per small group. After
implement, the docs hook updates the Product and Developer portals, including the design system page
(new palettes and `useColors`).

## Notes

- Test counts: tests are written first for T003, T005, T018, T020, T022, T032, T034, T037, T039, and in the migration tasks T007 to T017.
- If a dark color fails the contrast test, change the dark value, not the test.
- Do not change a light value. Do not move a layout value into a palette.
