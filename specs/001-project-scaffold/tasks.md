---

description: "Task list for Project Scaffold"
---

# Tasks: Project Scaffold

**Input**: Design documents from `/specs/001-project-scaffold/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/project-commands.md, quickstart.md

**Tests**: The spec requires unit tests (FR-013) and screenshot tests (FR-014). Test tasks are included. No other test types are requested.

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root (`/Users/jamessun/Projects/infobae-spectra-sandbox`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1 to US4)
- Each task names exact file paths

## Key Rules for All Tasks

- **FR-017 / SC-008**: Do NOT hand-write base project files (`package.json`, `app.json`, `tsconfig.json`, `.gitignore`, build config). They come from the `blank-typescript` template. Edit them only to add what this plan needs (scripts, dependencies, plugins, strict flag).
- **Constitution I**: Screens in `app/` and `src/screens/` use only components from `src/design-system/`.
- **Constitution II**: No user-facing string literals in JSX. All text comes from `t()` and `src/localization/en.json`.
- **Constitution V**: No `any` types. TypeScript strict.
- **FR-016**: Do NOT add any product feature (editions, feeds, articles, media, chat, accounts).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the starter template and install dependencies.

- [X] T001 Download the template into a temp folder in the scratchpad: run `npx create-expo-app@latest <scratchpad>/infobae-template --template blank-typescript --no-install`. Confirm the generated `package.json` shows `expo-template-blank-typescript` version `58.0.23` (or record the actual version if it differs).
- [X] T002 Move the template files into the repository root: `package.json`, `app.json`, `tsconfig.json`, `.gitignore`, `assets/`, and any other generated files. Do NOT overwrite or delete `vision.md`, `specs/`, `.specify/`, `.claude/`, or `.git/`. If `.gitignore` already exists in the root, merge the entries.
- [X] T003 Install dependencies: run `npm install`, then `npx expo install expo-router expo-localization expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens`, then `npm install i18n-js`.
- [X] T004 Install dev dependencies: run `npm install --save-dev jest jest-expo @types/jest @testing-library/react-native eslint eslint-config-expo prettier eslint-config-prettier`. Use `npx expo install` for packages Expo pins (for example `jest-expo`). Check `package.json` for the exact versions that installed.
- [X] T005 Switch the entry to Expo Router. In `package.json` set `"main": "expo-router/entry"`. In `app.json` add `"scheme": "infobae"`, add `"expo-router"` to `plugins`, set `ios.bundleIdentifier` and `android.package` to `com.infobae.scaffold`, and keep `orientation` as the template sets it (or set `"default"` so rotation works).
- [X] T006 Remove template sample files that the scaffold does not need (FR-018): delete `App.tsx` and `index.ts` at the repository root. Keep only the `assets/` files that `app.json` references (icon, splash, adaptive icon). Delete any other demo asset or sample code.
- [X] T007 In `tsconfig.json` confirm `"strict": true` (add it under `compilerOptions` if the template did not set it) and add the path alias `"@/*": ["./src/*"]` under `compilerOptions.paths`, with `"baseUrl": "."`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, strings, and tooling that every user story needs.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 Create the folder skeleton with empty-folder markers: `src/design-system/components/`, `src/localization/`, `src/navigation/`, `src/screens/`, `src/domain/` (each with a `.gitkeep` that later tasks remove when real files arrive). Create `src/domain/README.md` with one short paragraph: "Business logic goes here. Each module needs unit tests."
- [X] T009 [P] Create theme tokens in `src/design-system/tokens.ts`. Export typed `colors` (background, surface, textPrimary, textSecondary, tabActive, tabInactive, border), `fonts` (regular, bold using system fonts), `spacing` (xs, sm, md, lg, xl as numbers), and `typography` (title, body, label as `{ fontSize, fontWeight, fontFamily }`). One light theme only. No `any`.
- [X] T010 [P] Create the localization file `src/localization/en.json` with exactly these keys: `tabs.home` = "Home", `tabs.myInfobae` = "My Infobae", `tabs.media` = "Media", `tabs.chat` = "Chat", `tabs.menu` = "Menu".
- [X] T011 Create `src/localization/index.ts` exporting `t(key: string): string`. Import `en.json`. Use `i18n-js` with `defaultLocale = 'en'`, `locale = 'en'`, `enableFallback = true`. This minimal version resolves keys from `en.json`. (US2 adds device-locale detection and the missing-key behavior.) Add `resolveJsonModule: true` to `tsconfig.json` if the template lacks it.
- [X] T012 [P] Create the Prettier config `.prettierrc` (for example `{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100 }`) and `.prettierignore` (ignore `node_modules`, `.expo`, `dist`, `specs`, `.specify`, `.claude`).
- [X] T013 [P] Create the Jest config in `package.json` under `"jest"`: `{ "preset": "jest-expo", "testPathIgnorePatterns": ["/node_modules/", "/.maestro/"] }`. Add `transformIgnorePatterns` from the jest-expo docs if imports fail.
- [X] T014 Add the npm scripts to `package.json` per `contracts/project-commands.md`: `"lint": "eslint ."`, `"typecheck": "tsc --noEmit"`, `"test": "jest"`, `"verify": "npm run lint && npm run typecheck && npm test"`, `"test:e2e": "maestro test .maestro/flows"`. Keep the template's `start`, `android`, and `ios` scripts. (The `test:e2e` command is finalized in T040.)

**Checkpoint**: Foundation ready. User stories can start.

---

## Phase 3: User Story 1 - Launch the app shell (Priority: P1) 🎯 MVP

**Goal**: The app opens on Android and iOS with five bottom tabs. Each tab shows a placeholder screen.

**Independent Test**: Run `npm start`, open on iOS and Android. Tap each tab. Each tab shows its own placeholder with its name.

### Implementation for User Story 1

- [X] T015 [P] [US1] Create the tab config in `src/navigation/tabs.ts`. Export type `Tab = { key: 'home' | 'my-infobae' | 'media' | 'chat' | 'menu'; route: string; labelKey: string }` and `export const tabs: readonly Tab[]` with exactly 5 tabs in this order: home (`route: 'index'`, `labelKey: 'tabs.home'`), my-infobae (`route: 'my-infobae'`, `labelKey: 'tabs.myInfobae'`), media (`'media'`, `'tabs.media'`), chat (`'chat'`, `'tabs.chat'`), menu (`'menu'`, `'tabs.menu'`).
- [X] T016 [P] [US1] Create design system component `Screen` in `src/design-system/components/Screen.tsx`. It wraps children in a safe-area view that uses `colors.background` and `spacing.md` from tokens. Props typed in TypeScript (`children: React.ReactNode`).
- [X] T017 [P] [US1] Create design system component `Text` in `src/design-system/components/Text.tsx`. It wraps React Native `Text`. Prop `variant: 'title' | 'body' | 'label'` (default `body`) picks a style from `typography`. Color comes from `colors.textPrimary`.
- [X] T018 [US1] Create design system component `Placeholder` in `src/design-system/components/Placeholder.tsx`. Prop `labelKey: string`. It renders a centered `Text` (variant `title`) with `t(labelKey)`. Uses `Screen`. (Depends on T011, T016, T017.)
- [X] T019 [P] [US1] Create the tab bar helper in `src/design-system/components/TabBarLabel.tsx`: a `TabBarLabel` component with props `{ labelKey: string; focused: boolean }` that renders `t(labelKey)` with `typography.label`. Color is `colors.tabActive` when focused, else `colors.tabInactive`. Also export a simple `tabBarIcon` helper that returns a basic shape view (a dot) tinted with the same colors. Use only token values.
- [X] T020 [US1] Create `src/design-system/index.ts` that exports all tokens and components (`Screen`, `Text`, `Placeholder`, `TabBarLabel`, `tabBarIcon`, `colors`, `fonts`, `spacing`, `typography`). All code outside the design system imports from `@/design-system` only.
- [X] T021 [P] [US1] Create five screen components in `src/screens/`: `HomeScreen.tsx`, `MyInfobaeScreen.tsx`, `MediaScreen.tsx`, `ChatScreen.tsx`, `MenuScreen.tsx`. Each is `export function XScreen() { return <Placeholder labelKey="tabs.x" /> }` with the matching key from T010. No content, no network calls, no raw `View` or `Text`.
- [X] T022 [US1] Create the root layout `app/_layout.tsx`: renders Expo Router `<Slot />` or `<Stack screenOptions={{ headerShown: false }} />` plus `<StatusBar />` from `expo-status-bar`.
- [X] T023 [US1] Create the tab layout `app/(tabs)/_layout.tsx` using Expo Router `Tabs`. Map over `tabs` from `@/navigation/tabs`. For each, add `<Tabs.Screen name={tab.route} options={{ tabBarLabel: ({ focused }) => <TabBarLabel labelKey={tab.labelKey} focused={focused} />, tabBarIcon: tabBarIcon, headerShown: false }} />`. Style the bar with token colors. The active tab must show as active (FR-004).
- [X] T024 [P] [US1] Create route files that only render a screen: `app/(tabs)/index.tsx` (HomeScreen), `app/(tabs)/my-infobae.tsx` (MyInfobaeScreen), `app/(tabs)/media.tsx` (MediaScreen), `app/(tabs)/chat.tsx` (ChatScreen), `app/(tabs)/menu.tsx` (MenuScreen). Each file is a default export that returns the screen from `src/screens/`. No logic.
- [ ] T025 [US1] Start the app with `npm start` and open it on the iOS simulator and the Android emulator (whichever are installed). Confirm: no errors, five tabs in order, each tab shows its own name, rapid tapping shows the last tapped tab, the app works with network off, and rotation keeps the tab bar usable. Fix any defect found in T015 to T024.

**Checkpoint**: User Story 1 works on its own. This is the MVP.

---

## Phase 4: User Story 2 - Design system and localized strings (Priority: P2)

**Goal**: A developer finds fonts, colors, and themes in one module. All text comes from one localization file. Missing strings fall back safely.

**Independent Test**: Review the screens. They use only design system components and `t()`. Change a string in `en.json` and see the screen change. Unknown locale falls back to English.

### Tests for User Story 2

- [X] T026 [P] [US2] Write unit tests in `src/localization/index.test.ts`: (a) `t('tabs.home')` returns "Home"; (b) every key in `en.json` resolves to a non-empty string; (c) with the device locale set to an unsupported value (for example `fr`), `t('tabs.home')` returns "Home" (fallback); (d) a key missing everywhere returns the key itself and calls `console.warn` once in dev mode. Run `npm test` and confirm (c) and (d) fail before T027.

### Implementation for User Story 2

- [X] T027 [US2] Extend `src/localization/index.ts`: read the device locale with `expo-localization` (`getLocales()[0]?.languageCode`), set `i18n.locale` from it, keep `defaultLocale = 'en'` and `enableFallback = true`. For a key missing in all locales, return the key (never blank) and call `console.warn` in development only (`__DEV__`). Export a `setLocaleForTests(locale: string)` helper only if the tests in T026 need it. Make T026 pass.
- [X] T028 [P] [US2] Add a short comment header to `src/design-system/tokens.ts` listing what lives in the module (colors, fonts, spacing, typography) so a developer finds them in one place (spec US2 scenario 3). Confirm no color, font, or spacing literal exists outside `src/design-system/` in `app/` or `src/screens/` by running `grep -rnE "#[0-9a-fA-F]{3,8}|fontSize|fontFamily" app src/screens src/navigation` and fixing any hit.
- [X] T029 [US2] Audit all scaffold screens against FR-008 and FR-009. Confirm `app/` and `src/screens/` import only from `@/design-system`, `@/localization`, and `@/navigation`, and no JSX holds a string literal. Run `grep -rnE "from 'react-native'" app src/screens` and expect no hits. Fix any violation by adding a design system component or a string to `en.json`.
- [X] T030 [US2] Prove a string change flows through (spec US2 scenario 2): change `tabs.home` in `src/localization/en.json` to "Home TEST", confirm the Home tab and its label change in the running app, then revert it.

**Checkpoint**: User Stories 1 and 2 both work on their own.

---

## Phase 5: User Story 3 - Run quality checks (Priority: P3)

**Goal**: Lint, type check, unit tests, and screenshot tests each run with one command. They pass on the scaffold and fail on a deliberate violation.

**Independent Test**: Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`. All pass. Add a style error, a failing test, and a visual change. Each check fails.

### Lint (FR-011, FR-012)

- [X] T031 [US3] Create `eslint.config.js` (flat config). Start from `eslint-config-expo/flat`. Add `eslint-config-prettier` last. Ignore `node_modules`, `.expo`, `dist`, `specs`, `.specify`, `.claude`, `.maestro`.
- [X] T032 [US3] In `eslint.config.js` add rule `@typescript-eslint/no-explicit-any: 'error'` and rule `react/jsx-no-literals: ['error', { noStrings: true }]` for `app/**` and `src/**` (exclude `*.test.ts(x)`). Confirm exact rule names against the installed plugin versions (research R4 open check). If `jsx-no-literals` is too strict for `{' '}` or expressions, tune its options and note it in a comment.
- [X] T033 [US3] In `eslint.config.js` add `no-restricted-imports` for `app/**` and `src/screens/**`: block `Text`, `View`, `StyleSheet`, and `Pressable` imports from `react-native` with the message "Use components from @/design-system". Do NOT apply this rule to `src/design-system/**`.
- [X] T034 [US3] Run `npm run lint` and `npm run typecheck`. Fix every error they report in scaffold code. Both must exit 0.

### Unit tests (FR-013)

- [X] T035 [P] [US3] Write `src/navigation/tabs.test.ts`: (a) `tabs.length === 5`; (b) keys in order are `home, my-infobae, media, chat, menu`; (c) keys are unique; (d) every `labelKey` resolves via `t()` to a value that is not equal to the key; (e) every `route` matches a file in `app/(tabs)/` (use `fs.existsSync` for `index.tsx`, `my-infobae.tsx`, `media.tsx`, `chat.tsx`, `menu.tsx`).
- [X] T036 [P] [US3] Write `src/design-system/components/Placeholder.test.tsx` with React Native Testing Library: render `<Placeholder labelKey="tabs.media" />` and assert the text "Media" shows.
- [X] T037 [US3] Run `npm test`. All sample tests (T026, T035, T036) must pass.

### Screenshot tests (FR-014)

- [X] T038 [US3] Install the Maestro CLI (`brew install maestro` or the official installer) and run `maestro --version`. Read the installed version's docs for the visual assertion command (research R6 risk): confirm the command name (for example `assertScreenshot`), how it names and stores baseline images, and its threshold option. Write the findings as comments at the top of `.maestro/config.yaml` (T039).
- [X] T039 [US3] Choose the fixed device configuration and record it: for example iOS simulator "iPhone 16" (iOS latest installed) and Android emulator "Pixel 7" API 34, portrait. Decide the app build used for screenshots: Expo Go shows extra UI, so use a development build (`npx expo run:ios` and `npx expo run:android`) or a local build. Create `.maestro/config.yaml` with `appId: com.infobae.scaffold` and the notes from T038 and this task.
- [X] T040 [US3] Create five Maestro flows in `.maestro/flows/`: `home.yaml`, `my-infobae.yaml`, `media.yaml`, `chat.yaml`, `menu.yaml`. Each flow: `launchApp` (with `clearState: true`), tap the tab by its label text from `en.json` (skip the tap for Home), then run the screenshot assertion from T038 with a name like `home`. Update `test:e2e` in `package.json` to the exact command that runs all flows with the config from T039.
- [X] T041 [US3] Record the baselines: run the flows on the fixed device configuration so Maestro saves the five baseline images. Commit the images under the folder Maestro uses (for example `.maestro/baselines/`). Then run `npm run test:e2e` a second time and confirm all five flows pass against the baselines.
- [X] T042 [US3] Prove the checks catch problems (SC-007, spec US3 scenarios 4 and 5). One at a time, then revert each change: (a) add an unused variable and a literal string in JSX, run `npm run lint`, expect a failure and a non-zero exit; (b) break one assertion in `src/navigation/tabs.test.ts`, run `npm test`, expect a failure; (c) change a color in `src/design-system/tokens.ts`, run `npm run test:e2e`, expect a failure on the affected flows. Confirm all checks pass again after the reverts.

**Checkpoint**: All four commands pass on the clean scaffold.

---

## Phase 6: User Story 4 - Find where code belongs (Priority: P3)

**Goal**: A short guide explains the layout, the template, the commands, and where new code goes.

**Independent Test**: A developer who did not write the scaffold uses the guide to place a sample screen, component, string, and test in the correct folders.

### Implementation for User Story 4

- [X] T043 [US4] Write the guide `docs/PROJECT_GUIDE.md` with these sections: (1) Prerequisites (Node 20+, Xcode or Android Studio, Maestro CLI); (2) Run the app (the steps from `quickstart.md`); (3) Folder layout: one line each for `app/`, `src/screens/`, `src/navigation/`, `src/design-system/`, `src/localization/`, `src/domain/`, tests next to code as `*.test.ts(x)`, `.maestro/`; (4) "Where does new code go?" with a step list for a new screen, a new design system component, a new string, new business logic, and a new test (including a new Maestro flow and baseline); (5) Rules from the constitution in one line each (design system first, localized strings, unit tests, screenshot tests, lint and types).
- [X] T044 [US4] In `docs/PROJECT_GUIDE.md` add a "Quality gates" section that lists each command from `contracts/project-commands.md`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run verify` before a push, and `npm run test:e2e` before a PR merge. Add a note about the fixed screenshot device configuration from T039.
- [X] T045 [US4] In `docs/PROJECT_GUIDE.md` add a "Starter template" section that records the template name and version used in T001 (`expo-template-blank-typescript`, with the actual version) and states that the base files came from it (FR-018).
- [X] T046 [US4] Add a link to `docs/PROJECT_GUIDE.md` and the quick-start commands to a root `README.md` (create it if it does not exist; keep it to about 15 lines). Check that no `.gitkeep` remains in a folder that now holds real files.
- [ ] T047 [US4] Check the guide with the placement test (SC-006): using only the guide, state where a new `SettingsScreen`, a new `Badge` component, a new string `settings.title`, a new `src/domain/` function, and its test would go. Fix any unclear step in the guide.

**Checkpoint**: All four user stories work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against the spec.

- [X] T048 Run `npx prettier --check .` and fix formatting with `npx prettier --write .` where needed (excluding ignored folders).
- [X] T049 Verify SC-008 and FR-018: `package.json`, `app.json`, and `tsconfig.json` came from the template. No `App.tsx`, `index.ts`, or demo assets remain. List any file in the repository root that is not part of the plan's structure and remove it.
- [X] T050 Verify FR-016: grep `app` and `src` for any product feature (edition, feed, article, video, audio, chat service, login). The expected result is no hits other than tab names and placeholder labels.
- [X] T051 Run the full `specs/001-project-scaffold/quickstart.md` from a fresh clone (`git clone` into the scratchpad, then `npm install`). Confirm every step and the SC-001 time target (under 15 minutes). Fix the guide for any gap. Done on Android only: clone, install, lint, typecheck, 11 tests, release build and 5/5 e2e flows all pass in about 2.5 minutes of command time. iOS was not run (no Xcode). No guide gaps found.
- [X] T052 Run `npm run verify` and `npm run test:e2e` one last time and confirm both exit 0 (SC-003).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 to T007 run in order (T006 and T007 can run after T002).
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **US1 (Phase 3)**: Depends on Phase 2. No dependency on other stories.
- **US2 (Phase 4)**: Depends on Phase 2 and on the screens from US1 (T029 and T030 audit them).
- **US3 (Phase 5)**: Depends on US1 (the screens and tabs must exist) and on US2 (lint rules and tests cover the localization behavior).
- **US4 (Phase 6)**: Depends on US3 for final command names and the device configuration (T039). Draft work (T043) can start after US1.
- **Polish (Phase 7)**: Depends on all stories.

### Within Each Story

- T026 (tests) fail before T027.
- Tokens before components. Components before the design system index. The index before screens. Screens before routes.
- Lint config (T031 to T033) before the lint run (T034).
- Maestro install and research (T038, T039) before flows (T040). Flows before baselines (T041).

### Parallel Opportunities

- Phase 2: T009, T010, T012, T013 can run together.
- US1: T015, T016, T017, T019 can run together. Then T021 and T024 can run together.
- US2: T026 and T028 can run together.
- US3: T035 and T036 can run together. T038 (Maestro install) can run while lint tasks run.

## Parallel Example: User Story 1

```text
# After Phase 2, launch together:
Task: "Create tab config in src/navigation/tabs.ts"
Task: "Create Screen component in src/design-system/components/Screen.tsx"
Task: "Create Text component in src/design-system/components/Text.tsx"
Task: "Create TabBarLabel in src/design-system/components/TabBarLabel.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Run the app on both platforms (T025).

### Incremental Delivery

1. Setup + Foundational → template base and tooling ready.
2. Add US1 → app shell runs (MVP).
3. Add US2 → design system and localization are enforced and tested.
4. Add US3 → all four quality gates pass and catch violations.
5. Add US4 → the guide lets new developers place code.
6. Polish → full validation from a fresh clone.

## Notes

- [P] tasks touch different files and have no dependency on unfinished tasks.
- Commit after each task or logical group.
- Research R6 flags that the Maestro screenshot command and baseline rules must be confirmed against the installed version. Task T038 does this before any flow is written.
- The tasks keep to the plan. They do not add features outside the spec.

---

## Phase 8: Convergence

**Purpose**: Remaining work found by `/speckit-converge` after the first implement pass.

- [X] T053 Capture and fix the error seen on the physical Android phone (device `08291JEC200308`, 1080x2340). The error screenshot did not reach the session, and a release APK launched with no crash and no JS error in `adb logcat`. Get the exact error text and the start method (Expo Go, `npx expo run:android`, or the APK). Reproduce it, fix the cause in `app/`, `src/`, or `app.json`, and re-run T025's Android checks on the phone, per US1/AC1 and SC-002 (missing) — closed: cause was `JDK_JAVA_OPTIONS` in the shell breaking the Gradle CMake step; fixed in `.zshrc`, app runs on the phone
- [X] T054 Remove stale-build false confidence in the screenshot gate. A phone screenshot at 01:46 showed "Home TEST" while `src/localization/en.json` already said "Home", so an installed release APK carried old JavaScript. (a) Add an npm script `build:android:release` in `package.json` that forces a fresh JS bundle (`--rerun-tasks` or a clean of the bundle task) and sets `env -u JDK_JAVA_OPTIONS`. (b) Document it in `docs/PROJECT_GUIDE.md` and `.maestro/config.yaml`. (c) Prove a text-only change is caught: change `tabs.home` in `src/localization/en.json`, rebuild with the new script, run `npm run test:e2e`, and expect a failure. If it passes at `thresholdPercentage: 98`, add `assertVisible` of the expected label text to each flow in `.maestro/flows/` or raise the threshold. Revert the string after the proof, per SC-007 and FR-014 (partial) — done: added `npm run build:android:release`; shared `.maestro/shared/assert-tabs.yaml` exact-label check added because the 98% threshold missed "Home" to "Home TEST"
- [ ] T055 Verify the app on iOS and record iOS baselines. Install Xcode, then run `npm run ios`, and confirm five tabs and placeholders. Add the fixed iOS simulator to `.maestro/config.yaml` and `docs/PROJECT_GUIDE.md`. Record iOS baselines with `.maestro/record-baselines.sh` into a per-platform folder (for example `.maestro/baselines/ios/`) and update the flows so each platform uses its own baselines. Remove the "iOS baselines are not recorded yet" note from the guide, per FR-001, US1/AC2, SC-002, and Constitution technology constraints "a feature MUST work on both" (missing)
- [X] T056 Remove generated diff images from `.maestro/baselines/` (`chat_diff.png`, `home_diff.png`, `media_diff.png`, `menu_diff.png`, `my-infobae_diff.png`) and add `.maestro/baselines/*_diff.png` to `.gitignore`. Only the five baseline PNGs belong in the repository, per FR-014 (unrequested)
