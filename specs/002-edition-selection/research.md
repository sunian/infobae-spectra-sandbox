# Research: Edition Selection

Versions were checked on 2026-10-19 in `node_modules/expo/bundledNativeModules.json` (the versions
that Expo SDK 58 expects) and with `npm view`.

## R1. Where to save the choice (FR-004, FR-005)

- **Decision**: `@react-native-async-storage/async-storage` 2.2.0, installed with
  `npx expo install`. Store one string, the edition id, under one key.
- **Rationale**: It is the standard Expo key-value store for small, non-secret values. SDK 58 pins it
  to 2.2.0 (`npm view` shows 3.1.1 as the newest, but `expo install` picks the version that matches the
  SDK, which avoids native mismatches). It works on Android and iOS, offline. It has an official Jest
  mock. The code reads it through a small interface (`getItem`, `setItem`), so tests use a plain fake.
- **Alternatives**: `expo-secure-store` (made for secrets, slower, wrong fit for a news edition).
  `react-native-mmkv` (faster, but a native module with extra build setup that this project does not
  need for one string). A file in the app folder (hand-written code for a solved problem).

## R2. How to gate the tabs (FR-001, FR-003, US1-AC4, US1-AC5)

- **Decision**: Use Expo Router `Stack.Protected` in the root layout. The `select-edition` route is
  guarded by "no edition yet". The `(tabs)` group and `change-edition` are guarded by "edition chosen".
- **Rationale**: `Stack.Protected` is in the installed `expo-router` 58.0.23
  (`build/views/Protected.d.ts`). A guarded route cannot be reached by navigation, by a deep link, or by
  the system back action. When the guard flips after a choice, the router moves to the tabs on its
  own, so there is no manual navigation call to get wrong. It also removes the list from the back
  stack after the first choice.
- **Alternatives**: A `<Redirect>` in the tabs layout (works, but the tabs can render for one frame
  and the back action can return to the list). A conditional render in the root layout (loses the
  routes, so deep links break).

## R3. Where the selected edition lives (FR-009, FR-016)

- **Decision**: One React context, `EditionProvider`, in `src/state/EditionContext.tsx`. It exposes
  `useEdition()` with `{ status, edition, setEdition }`. `setEdition` updates the state first, then
  saves. A failed save is caught and logged in development.
- **Rationale**: Home, Menu, both list screens, and the route guards all need the same value, and
  later features (the Home feed) will too. Context needs no new dependency. Updating state before
  saving means a failed save still works for the session (FR-012) and Home updates at once (US3-AC4).
- **Alternatives**: A state library such as Zustand (a new dependency for one value). Reading storage in
  each screen (screens could disagree, which FR-016 forbids).

## R4. The moment between launch and "saved edition read" (open spec gap)

- **Decision**: Keep the native splash screen visible until the saved value is read, using
  `expo-splash-screen` (`preventAutoHideAsync` at startup, `hideAsync` when the provider's status
  leaves `loading`). While loading, the root layout renders nothing.
- **Rationale**: The spec (US2) says the tabs show "at once" but gives no rule for the read. Showing the
  list for a moment, then switching to the tabs, looks like a bug. Holding the splash screen costs one
  small SDK package and no custom screen. The read of one small value is quick.
- **Alternatives**: Render a custom loading screen (new screen, new baseline, flashes). Render the list
  first and swap later (the flash we want to avoid).
- **Open item**: This is the plan's choice, not a spec rule. Run `/speckit-clarify` to confirm it, as
  the test plan recommends. If the answer differs, only the root layout and `EditionContext` change.

## R5. Where the edition names come from (FR-002, FR-015)

- **Decision**: Display names live in `en.json` under `editions.<id>`. The existing `name` field in
  `src/domain/infobae/editions.ts` stays. A unit test checks that every edition id has a matching
  `editions.<id>` string that equals `name`.
- **Rationale**: FR-015 puts every user-facing string in the localization file. Removing `name` would
  change a committed model and its test for no user gain. The parity test stops the two from drifting.
- **Alternatives**: Delete `name` from the domain model (churn in code that already passes review).
  Hard-code names in the screen (breaks FR-015 and the lint rule).

## R6. One screen or two (FR-013)

- **Decision**: One `EditionScreen` component with a `mode` prop (`first-launch` or `change`). Two thin
  route files render it.
- **Rationale**: FR-013 says both lists show the same editions in the same order. One component
  guarantees it. The modes differ in three small ways: `change` marks the current edition, `change`
  goes back after a pick, and `first-launch` has no back arrow.
- **Alternatives**: Two separate screens (duplicate list code, risk of different order).

## R7. New design system components (FR-014)

- **Decision**: Add `ListRow` (label, optional secondary value, optional selected mark, `onPress`) and
  `OptionList` (a scrolling list of `ListRow`, one marked selected). Extend `Placeholder` with an
  optional detail line for Home. The Menu edition row reuses `ListRow`.
- **Rationale**: The design system has no tappable row and no list. The constitution says to add
  a component first, then build the screen. A scrolling list covers the "small screen or rotated device"
  edge case. `ListRow` and `OptionList` are generic, so the Menu and later settings can reuse them.
- **Alternatives**: A one-off row inside `EditionScreen` (breaks Principle I).

## R8. Maestro flows (FR-001, SC-006, test-plan T8 to T29)

- **Decision**: Add `shared/pick-edition.yaml` (tap "Colombia"). Every existing flow runs it right after
  `launchApp` with `clearState: true`. Add three new flows: `edition-select` (list, screenshot, pick, tabs),
  `edition-persist` (pick, stop the app, relaunch without clearing state, tabs show), and
  `edition-change` (Menu, list screenshot, pick another, Home shows it, relaunch). The system back
  action is sent with `back` in `edition-select` (T8).
- **Rationale**: The existing flows start from a clean install, so they would otherwise stop on the
  list. One shared step keeps the five flows short and the edition in one place.
- **Alternatives**: Pre-seed the saved value through app launch arguments (new test-only code in the
  app, and it skips the real first-launch path).
