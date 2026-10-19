---

description: "Task list for Edition Selection"
---

# Tasks: Edition Selection

**Input**: Design documents from `/specs/002-edition-selection/`

**Prerequisites**: plan.md, spec.md, test-plan.md, research.md, data-model.md, contracts/edition-contracts.md, quickstart.md

**Tests**: Required. The approved [test-plan.md](./test-plan.md) names the conditions (T1 to T29). Test tasks come before the code they cover. The task IDs below are three digits (T001 and up). The test-plan condition IDs are one or two digits (T1 to T29). Always write a test-plan condition as "test-plan T5" and a task as "T005" so the two are never confused (the coverage table at the end uses the same rule).

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root (`/Users/jamessun/Projects/infobae-spectra-sandbox`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: Which user story the task belongs to (US1 to US3)
- Each task names exact file paths

## Key Rules for All Tasks

- **Constitution I**: Screens in `app/` and `src/screens/` use only components from `src/design-system/`. A view the design system lacks is added there first (T007, T008).
- **Constitution II**: No user-facing string literals in JSX. All text comes from `t()` and `src/localization/en.json`.
- **Constitution V**: No `any` types. TypeScript strict. Lint clean.
- **Test-first**: For each test task, run the test and see it fail for the right reason before writing the code. Do not edit a test to make it pass.
- **No content**: Do NOT load news or call the network. Home shows only the edition name (FR-011).
- **iOS**: iOS checks stay deferred (`001-project-scaffold` T025 and T055). Write cross-platform code. Do not claim iOS verification.
- **Emulator tasks** (T020, T024, T032, T037) need Maestro 2.11.0 and the Android emulator from `.maestro/config.yaml`, plus a fresh release build (`npm run build:android:release`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the two new packages and make them testable.

- [ ] T001 First, create and switch to the feature branch: `git switch -c 002-edition-selection` (the constitution gates a push of a feature branch, and the spec and plan name this branch). Then install the packages with Expo's pinned versions: run `npx expo install @react-native-async-storage/async-storage expo-splash-screen`. Confirm `package.json` shows `@react-native-async-storage/async-storage` at `2.2.0` and `expo-splash-screen` at `~58.0.10`. If `expo install` picks other versions, record them in `specs/002-edition-selection/research.md` R1 and R4. `app.json` has no splash settings and no `expo-splash-screen` plugin entry today. Check the Expo SDK 58 `expo-splash-screen` docs and add a plugin entry only if they say `preventAutoHideAsync` needs one. If the splash does not hold, nothing fails at build time and the list would only flash, so T024 and UAT2 (T040) are the real check. Record what you decided in `specs/002-edition-selection/research.md` R4.
- [ ] T002 Add Jest mocks in a new file `jest.setup.ts` and register it in `package.json` under `jest.setupFilesAfterEnv`. The file must (a) mock `@react-native-async-storage/async-storage` with the package's official mock (`@react-native-async-storage/async-storage/jest/async-storage-mock`) and (b) mock `expo-splash-screen` so `preventAutoHideAsync` and `hideAsync` are `jest.fn()` that resolve. Run `npm test` and confirm the existing tests still pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Strings, the saved-value logic, the shared state, and two design system components. Every user story needs these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Write the unit test `src/domain/edition/editions-localization.test.ts` (test-plan T2, T27). It asserts: `EDITIONS` from `src/domain/infobae/editions.ts` has exactly nine editions whose `name` values are `Argentina`, `Estados Unidos`, `Colombia`, `España`, `México`, `Perú`, `Cuba`, `Centroamérica`, `Mundo`; and for every edition, `t('editions.' + id)` equals `name`. Also assert that `EDITIONS` is in this exact order (FR-002, clarified 2026-10-19): `argentina`, `estados-unidos`, `colombia`, `espana`, `mexico`, `peru`, `cuba`, `centroamerica`, `mundo`. Run it and confirm it fails (the keys do not exist yet).
- [ ] T004 Add these keys to `src/localization/en.json`, nested by area, with the exact English text from `contracts/edition-contracts.md` section 5: `editionSelect.title` ("Choose your edition"), `editionSelect.changeTitle` ("Change edition"), `menu.edition` ("Edition"), and `editions.<id>` for all nine ids (`argentina`, `estados-unidos`, `colombia`, `espana`, `mexico`, `peru`, `cuba`, `centroamerica`, `mundo`). Run T003 and `src/localization/index.test.ts` and confirm both pass.
- [ ] T005 [P] Write the unit test `src/domain/edition/preference.test.ts` (test-plan T5, T12) using a fake `KeyValueStorage` (an object with async `getItem` and `setItem`). Cover `parseStoredEdition`: a string equal to a known edition id returns that id; `null` returns `null`; an empty string, a string that is not an id (for example `not-an-edition` or ` colombia `), an unknown id, and any non-string value (number, object, `undefined`) all return `null`. Cover `loadEdition`: returns the saved id; returns `null` when the key is absent; returns `null` and does not throw when `getItem` rejects. Cover `saveEdition`: writes the id under the key `preferences.edition` exactly once and returns `true`; returns `false` and does not throw when `setItem` rejects; writes nothing when it is not called. Run it and confirm it fails (module missing).
- [ ] T006 Implement `src/domain/edition/preference.ts` per `data-model.md` and `contracts/edition-contracts.md` section 2. Export `KeyValueStorage`, `EDITION_STORAGE_KEY = 'preferences.edition'`, `parseStoredEdition(raw: unknown): EditionId | null`, `loadEdition(storage): Promise<EditionId | null>` (never rejects), and `saveEdition(storage, id): Promise<boolean>` (never rejects, `false` on failure). Validation rules, quoted from the data model: "A string equal to a known edition id → that edition id"; "Absent (`null`) → no edition"; "Empty string, a string with spaces or other text that is not an id, an unknown id → no edition"; "Any value that is not a string → no edition"; "The storage read throws → no edition". Use `getEdition` from `src/domain/infobae/editions.ts` to check ids. Never repair a bad saved value. Run T005 and confirm it passes.
- [ ] T007 [P] Write component tests (test-plan T25 support, FR-014): `src/design-system/components/ListRow.test.tsx` (shows the label; shows the optional value; calls `onPress` when tapped; has the accessibility role `button`; reports a selected state when `selected` is true and not otherwise) and `src/design-system/components/OptionList.test.tsx` (renders one row per option in the given order; calls `onSelect` with the tapped option's `key`; marks only the row whose key equals `selectedKey`; renders all nine options of a nine-item list). Extend `src/design-system/components/Placeholder.test.tsx` with a case that an optional `detail` string shows under the label and that omitting it shows no extra text. Run them and confirm they fail.
- [ ] T008 Implement the design system components per `contracts/edition-contracts.md` section 4: `src/design-system/components/ListRow.tsx` (props `label: string`, `value?: string`, `selected?: boolean`, `onPress: () => void`; reads only tokens; uses `Pressable` with role `button` and a selected accessibility state; shows a visible selected mark), `src/design-system/components/OptionList.tsx` (props `options: readonly { key: string; label: string }[]`, `selectedKey?: string`, `onSelect: (key: string) => void`; a scrolling `FlatList` of `ListRow`), and add the optional `detail?: string` prop to `src/design-system/components/Placeholder.tsx` (shown under the label with the `body` text variant). Add any new color or spacing token to `src/design-system/tokens.ts` instead of using literals. Export `ListRow` and `OptionList` from `src/design-system/index.ts`. Components take final display strings and never call `t()` for feature text. Run T007 and confirm it passes.
- [ ] T009 [P] Write the integration test `src/state/EditionContext.test.tsx` (test-plan T13, T14, T18, T21, T22 at state level) with a fake `KeyValueStorage` passed through the `storage` prop and a small consumer component that prints `status` and `edition`. Cover: `status` is `loading` first, then `ready`; a valid saved id gives `ready` with that edition; each bad saved value from the data model (absent, empty string, `not-an-edition`, unknown id) gives `ready` with `edition` `null` and no throw; a rejecting `getItem` gives `ready` with `null`; `setEdition('colombia')` updates `edition` before the save finishes and calls `setItem` with `preferences.edition` and `colombia`; when `setItem` rejects the `edition` still equals the choice and nothing throws (FR-012); calling `setEdition` with the current edition leaves `edition` unchanged and throws no error; several quick `setEdition` calls end on the last id; two consumers under one provider always show the same value (FR-016); `useEdition` throws outside the provider. Run it and confirm it fails.
- [ ] T010 Implement `src/state/EditionContext.tsx` per `contracts/edition-contracts.md` section 3 and the state table in `data-model.md`. Export `EditionProvider` (props `children`, optional `storage` that defaults to AsyncStorage) and `useEdition()`. State: `status` `'loading' | 'ready'`, `edition` `EditionId | null`. Read once at mount with `loadEdition`. `setEdition(id)` sets state first, then calls `saveEdition` in the background and ignores a `false` result (log a warning in development only). The state leaves `loading` exactly once. Run T009 and confirm it passes.

**Checkpoint**: `npm run verify` passes. The strings, the saved-value logic, the shared state, and the new components work. No screen uses them yet.

---

## Phase 3: User Story 1 - Choose an edition on first launch (Priority: P1) 🎯 MVP

**Goal**: A new reader sees an edition list first, cannot reach the tabs until a choice, and then sees the tabs with Home showing the edition name.

**Independent Test**: Install the app with no saved data. Open it. The list shows. Tap "Colombia". The five tabs show and Home shows "Colombia".

**Test-plan conditions**: T1, T4, T6, T7, T8, T14, T24 (first-launch part), T29 (edition selection screen). Test-plan T8 still says "the list stays on screen". The clarified rule is that the app leaves on back and the next launch shows the list. Re-run `/speckit-spectra-test-plan` to update `test-plan.md`.

### Tests for User Story 1 (write first, confirm they fail)

- [ ] T011 [P] [US1] Write `src/navigation/RootLayout.test.tsx` using `renderRouter` from `expo-router/testing-library` against the real `app/` directory, with `EditionProvider` getting an empty fake storage (test-plan T1, T4, T6, T7). Assert: with no saved edition the edition list shows and no tab label (`Home`, `My Infobae`, `Media`, `Chat`, `Menu`) shows; tapping `Colombia` shows the five tabs with Home active; Home then shows `Colombia`; navigating directly to a tab route while no edition is chosen does not show the tab (the list stays). Also assert that after several quick taps on different editions the tabs show exactly once (one tab bar, Home active) and nothing throws (test-plan T14). If `expo-router/testing-library` cannot render this layout, record why in the test file header and test the guard through a small exported component instead. Run it and confirm it fails.
- [ ] T012 [P] [US1] Write `src/screens/EditionScreen.test.tsx` for the `first-launch` mode (test-plan T2 at screen level, T4, T14): shows the title `Choose your edition`; shows nine rows named by the `editions.<id>` strings, in the order of `EDITIONS`; shows no back control; tapping a row calls `setEdition` with that edition's id once; tapping several rows quickly in a row (for example `colombia`, `peru`, `mexico`) leaves the last one as the saved choice and does not throw (test-plan T14). Use a fake provider storage. Run it and confirm it fails.

### Implementation for User Story 1

- [ ] T013 [US1] Create `src/screens/EditionScreen.tsx` with a `mode: 'first-launch' | 'change'` prop. Implement `first-launch` now: a `Screen` with a `Text` title (`t('editionSelect.title')`) and an `OptionList` whose options are `EDITIONS` mapped to `{ key: id, label: t('editions.' + id) }`. `onSelect` calls `setEdition` from `useEdition()`. For `change`, render the same list for now and mark it `// US3` for T028. Use only `@/design-system` imports. Run T012 and confirm it passes.
- [ ] T014 [US1] Create the thin route `app/select-edition.tsx` that renders `<EditionScreen mode="first-launch" />` and nothing else.
- [ ] T015 [US1] Update `app/_layout.tsx`: wrap the stack in `EditionProvider`. Read `useEdition()` in an inner component. While `status` is `loading`, return `null`. Otherwise render the `Stack` with `headerShown: false` and: `<Stack.Protected guard={edition === null}>` containing `<Stack.Screen name="select-edition" />`, and `<Stack.Protected guard={edition !== null}>` containing `<Stack.Screen name="(tabs)" />`. Keep the `StatusBar`. Run T011 and confirm it passes.
- [ ] T016 [US1] Update `src/screens/HomeScreen.tsx` so it shows the selected edition name (FR-011): read `edition` from `useEdition()` and render `<Placeholder labelKey="tabs.home" detail={edition ? t('editions.' + edition) : undefined} />`. Run T011 and `npm run verify`.

### Maestro for User Story 1

- [ ] T017 [P] [US1] Create `.maestro/shared/pick-edition.yaml` (`appId: com.infobae.scaffold`): wait for the edition list, tap the exact text `Colombia`, wait for animation to end, then assert the tab label `My Infobae` is visible. Add a header comment saying every flow that starts with `clearState: true` runs it next.
- [ ] T018 [US1] Update the five existing flows `.maestro/flows/home.yaml`, `menu.yaml`, `my-infobae.yaml`, `media.yaml`, and `chat.yaml`: right after `launchApp` with `clearState: true`, add `- runFlow: ../shared/pick-edition.yaml`. Keep every other step and every threshold.
- [ ] T019 [US1] Create `.maestro/flows/edition-select.yaml` (test-plan T8, T24, T29; US1-AC5 as clarified 2026-10-19): `launchApp` with `clearState: true`; assert `Choose your edition` is visible; assert `My Infobae` is not visible; take or assert the screenshot `edition-select` using the same `RECORD` pattern and 98% threshold as `home.yaml`; press the Android back key (`back`), which leaves the app to the phone's home screen, then `launchApp` without `clearState` and assert `Choose your edition` is visible again and `My Infobae` is not; tap `Colombia` (a single tap); assert `My Infobae` is visible and the exact text `Colombia` shows on Home. Do not add a back handler: on Android the app is meant to leave.
- [ ] T020 [US1] On the emulator: run `npm run build:android:release`, install the APK, and record baselines with `.maestro/record-baselines.sh --device <id>` (this writes `edition-select.png` and re-records `home.png`). Open the new images and check them by eye. Run `npm run test:e2e` and confirm the five updated flows and `edition-select` pass. Record the device id and result in this task line.

**Checkpoint**: User Story 1 works on Android. Typing `npm run verify` and the Maestro flows pass.

---

## Phase 4: User Story 2 - Keep the choice between launches (Priority: P1)

**Goal**: After a choice, every later launch goes straight to the tabs with the same edition, with no prompt, even with no network, and without a flash of the list.

**Independent Test**: Choose "Perú". Fully close the app. Open it. The tabs show at once and Home shows "Perú".

**Test-plan conditions**: T9, T10, T11, T13, T23, T30.

### Tests for User Story 2 (write first, confirm they fail)

- [ ] T021 [US2] Extend `src/navigation/RootLayout.test.tsx` (test-plan T9, T10, T13, T30; research R4): with a valid saved edition the tabs show and the edition list never renders (assert the list title is never found, including on the first render); `fetch` is a spy and is never called during launch (T10); for each bad saved value (empty string, `not-an-edition`, a non-string such as a stored number, a rejecting `getItem`) the edition list shows and nothing throws (T13); `SplashScreen.preventAutoHideAsync` is called before the read ends and `SplashScreen.hideAsync` is called exactly once after it ends, whatever the read result, and nothing renders before then (test-plan T30; the native splash itself is checked on a device in T024 and UAT2). Run it and confirm the splash assertions fail.

### Implementation for User Story 2

- [ ] T022 [US2] Update `app/_layout.tsx` (research R4): call `SplashScreen.preventAutoHideAsync()` once at module load, and call `SplashScreen.hideAsync()` in an effect when `status` becomes `ready`. Keep returning `null` while `loading`. Run T021 and confirm it passes.

### Maestro for User Story 2

- [ ] T023 [US2] Create `.maestro/flows/edition-persist.yaml` (test-plan T11, T23). Part 1: `launchApp` with `clearState: true`, run `../shared/pick-edition.yaml`, `stopApp`, `launchApp` without `clearState`, assert `My Infobae` is visible, assert the exact text `Colombia` shows on Home, and assert `Choose your edition` is not visible. Part 2: `launchApp` with `clearState: true`, assert the list shows, `stopApp`, `launchApp` without `clearState`, assert the list shows again (nothing was saved).
- [ ] T024 [US2] On the emulator: rebuild and reinstall the release app, run `npm run test:e2e`, and confirm `edition-persist` and all earlier flows pass. Record the device id and result in this task line.

**Checkpoint**: User Stories 1 and 2 both work. A saved edition survives a full close and a bad saved value recovers to the list.

---

## Phase 5: User Story 3 - Change the edition from the Menu (Priority: P2)

**Goal**: The Menu shows the current edition. The reader can open the list, pick another edition, and see Home update at once. The choice stays saved.

**Independent Test**: Choose "Colombia". Open Menu. Change to "México". Open Home. It shows "México". Close and reopen the app. It still shows "México".

**Test-plan conditions**: T3, T15, T16, T17, T18, T19, T20, T21, T24, T29 (Menu list).

### Tests for User Story 3 (write first, confirm they fail)

- [ ] T025 [P] [US3] Extend `src/screens/EditionScreen.test.tsx` for the `change` mode (test-plan T3, T16, T17, T20): with `Colombia` as the current edition, the list shows the same nine editions in the same order as `first-launch` mode (T3); only the `Colombia` row is marked selected (T16); tapping `México` calls `setEdition('mexico')` and then `router.back()` (T17); leaving without a tap calls neither `setEdition` nor the storage `setItem` (T20); tapping `Colombia` again leaves the edition the same and throws no error (T21). Mock `expo-router`'s `useRouter`. Run it and confirm it fails.
- [ ] T026 [P] [US3] Write `src/screens/MenuScreen.test.tsx` (test-plan T15, T16): with `Colombia` selected the Menu shows the label `Edition` and the value `Colombia`; tapping that row calls `router.push('/change-edition')`. Run it and confirm it fails.
- [ ] T027 [US3] Extend `src/navigation/RootLayout.test.tsx` (test-plan T18, T20): start on the tabs with `Colombia`; open Menu, tap the edition, pick `México`; Home shows `México` with no remount of the provider and no restart; the fake storage holds `mexico`; a second run opens the list and goes back with no pick, and the storage still holds `colombia` and `setItem` was not called again. Run it and confirm it fails.

### Implementation for User Story 3

- [ ] T028 [US3] Implement the `change` mode in `src/screens/EditionScreen.tsx`: pass the current edition id as `selectedKey` to `OptionList`; on select call `setEdition` and then `router.back()`; no title change is needed in the body. Remove the `// US3` marker added in T013. Run T025 and confirm it passes.
- [ ] T029 [US3] Create the thin route `app/change-edition.tsx` that renders `<EditionScreen mode="change" />`. In `app/_layout.tsx` register `change-edition` inside the `Stack.Protected guard={edition !== null}` block, as `<Stack.Screen name="change-edition" options={{ headerShown: true, title: t('editionSelect.changeTitle'), headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />` so the back arrow works. Take every header color from `@/design-system` tokens, the way `app/(tabs)/_layout.tsx` does. Do not use color literals. `select-edition` and `(tabs)` keep `headerShown: false`.
- [ ] T030 [US3] Update `src/screens/MenuScreen.tsx`: render a `Screen` that contains a `Text` title `t('tabs.menu')` (so the Menu tab still shows its own name, as the scaffold did) and a `ListRow` with `label={t('menu.edition')}`, `value` set to the current edition's `t('editions.' + edition)`, and `onPress` calling `router.push('/change-edition')`. Use only `@/design-system` imports and no string literals. Run T026 and T027 and confirm they pass. T026 must also assert that the title `Menu` still shows.

### Maestro for User Story 3

- [ ] T031 [US3] Create `.maestro/flows/edition-change.yaml` (test-plan T19, T24, T29): `launchApp` with `clearState: true`; run `../shared/pick-edition.yaml`; tap the `Menu` tab; assert the exact text `Colombia` is visible; tap it; assert the list shows and take or assert the screenshot `edition-change`; tap `México`; tap the `Home` tab and assert `México` shows; `stopApp`; `launchApp` without `clearState`; assert `México` still shows on Home. Count taps: from Home the change takes the Menu tab, the edition row, and the new edition (three).
- [ ] T032 [US3] On the emulator: rebuild and reinstall the release app. Re-record baselines with `.maestro/record-baselines.sh --device <id>` (this writes `edition-change.png` and re-records `menu.png`). Check the images by eye. Run `npm run test:e2e` and confirm every flow passes. Record the device id and result in this task line.

**Checkpoint**: All three user stories work on Android.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs, manual checks, and the full gates.

- [ ] T033 [P] Update `docs/PROJECT_GUIDE.md`: add a `src/state/` row to the folder table ("Shared app state: React contexts and their hooks. Each has a test next to it."); change the "Run the app" expectation to "the first launch shows an edition list, then five tabs"; add a note that every Maestro flow runs `.maestro/shared/pick-edition.yaml` after a clean launch.
- [ ] T034 [P] Update the header comment in `.maestro/config.yaml`: add one line that flows start with a clean install and then pick an edition through `shared/pick-edition.yaml`, so baselines show the `Colombia` edition.
- [ ] T035 Do the manual checks from the test plan on the emulator (test-plan T25, T26, T28) and write the result in the PR notes: rotate the device on the edition list and scroll to `Mundo` (every row reachable, none cut off); read `app/` and `src/screens/` changes and confirm they use only design system components and no hard-coded text (also confirm lint passes with no rule disabled).
- [ ] T036 Run `npm run verify` (lint, typecheck, all Jest tests). Fix every failure. Do not skip or weaken a test.
- [ ] T037 On the emulator, run the full `npm run test:e2e` on a fresh release build and confirm all eight flows pass (five existing, plus `edition-select`, `edition-persist`, `edition-change`).
- [ ] T038 Run the commands in `specs/002-edition-selection/quickstart.md` sections 1 to 3 and fix any command or expected result that drifted. Check that every spec requirement FR-001 to FR-016 maps to at least one passing test (use the test plan's Verifies column).

---

## Phase 7: User Acceptance (UAT) — not executed by the implement command

**Purpose**: A person judges each journey in the reader's own terms, from the test plan's Suggested UAT Scenarios. The implement command does not run or tick these tasks. Link the evidence on the task line when a scenario passes. Use a clean install of the release build.

- [ ] T039 [UAT] UAT1 (US1-AC1, US1-AC2, US1-AC3, US1-AC4) A new reader installs the app, opens it, and picks "Colombia" — executor: human
- [ ] T040 [UAT] UAT2 (US2-AC1, US2-AC2, US2-AC3) The same reader closes the app fully, turns on airplane mode, and opens it again; the tabs show at once on "Colombia" with no list, not even briefly — executor: human
- [ ] T041 [UAT] UAT3 (US3-AC1, US3-AC2, US3-AC3, US3-AC4, US3-AC5) The reader opens Menu, sees "Colombia", taps it, picks "México", goes to Home, then closes and reopens the app — executor: human

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 then T002.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories. Test, then code, in pairs: T003 → T004, T005 → T006, T007 → T008, T009 → T010. The four pairs are independent of each other.
- **US1 (Phase 3)**: Depends on Phase 2. No dependency on other stories.
- **US2 (Phase 4)**: Depends on Phase 2 and on US1's `app/_layout.tsx` (T015) and `src/navigation/RootLayout.test.tsx` (T011).
- **US3 (Phase 5)**: Depends on Phase 2 and on US1's `EditionScreen` (T013) and layout (T015). It does not need US2, but it edits the same layout and test files, so run it after US2 to avoid merge conflicts.
- **Polish (Phase 6)**: Depends on all stories.
- **UAT (Phase 7)**: Depends on Polish and on a release build of the final code.

### Within Each Story

- Tests first, and see them fail, then code, then the Maestro flow, then the emulator run.
- T017 can run any time after Phase 2. T018 needs T017. T019 needs T017.

### Test Plan Coverage

| Test-plan condition (test-plan T…) | Task (T…) |
|---|---|
| T1, T4, T6, T7 | T011 (code T013 to T016) |
| T2 | T003, T012 |
| T3 | T025 |
| T5, T12 | T005 (code T006) |
| T8 | T019 |
| T9, T10, T13, T30 | T021 (code T022), T009 |
| T11, T23 | T023 |
| T14, T21, T22 | T009 (code T010), T025 |
| T15 to T18, T20 | T025 to T027 (code T028 to T030) |
| T19 | T031 |
| T24 | T019, T031 |
| T25, T26, T28 | T035 |
| T27 | T003, T004 |
| T29 | T019, T031, T032 |

### Parallel Opportunities

- Phase 2: T003, T005, T007, and T009 can start together (four different files). Each code task waits for its own test task.
- Phase 3: T011 and T012 can run together. T017 can run with them.
- Phase 5: T025 and T026 can run together.
- Phase 6: T033 and T034 can run together.

### Parallel Example: Phase 2

```text
Launch together:
  T003 src/domain/edition/editions-localization.test.ts
  T005 src/domain/edition/preference.test.ts
  T007 src/design-system/components/ListRow.test.tsx + OptionList.test.tsx + Placeholder.test.tsx
  T009 src/state/EditionContext.test.tsx
Then, in any order: T004, T006, T008, T010
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **Stop and check**: the list shows first, a tap opens the tabs, Home shows the name. Run `npm run verify` and the Maestro flows.

At this point the app asks for an edition but the choice only lasts until the app closes. US2 fixes that.

### Incremental Delivery

1. Setup and Foundational give the tested logic and state.
2. US1 gives the first-launch choice (MVP).
3. US2 makes the choice last and removes the flash.
4. US3 lets the reader change it.
5. Polish, then the human UAT pass.

### Notes

- Keep the saved-value logic free of React. Only `EditionContext.tsx` joins it to AsyncStorage.
- The `Stack.Protected` guards do the navigation after a first choice. Do not add a manual `router.replace` to the tabs.
- Commit after each task or small group, and run `npm run verify` before each push.
