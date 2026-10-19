# Test Plan — Edition Selection

| | |
|---|---|
| **Spec** | `specs/002-edition-selection/spec.md` |
| **Build under test** | Working tree on branch `main`. Package `infobae`, version `1.0.0` (from `package.json`). No feature branch exists yet. |
| **Author / Date** | James Sun / 2026-10-19 |

**Project state, stated once:**

- **No test strategy exists.** `docs/TEST_STRATEGY.md` and `docs/test-strategy/TEST_STRATEGY.md` are not present. The default lens set was used. Run `/speckit-spectra-test-strategy` so the next plan inherits the project's own lenses.
- **No coverage floor is declared** in the constitution. This plan proposes none.
- **iOS is not testable today.** No Xcode, no iOS baselines (user decision, tasks T025 and T055 of `001-project-scaffold`). Every iOS item below is marked deferred.

---

## 1. Scope

**In scope**

- Choosing an edition on first launch, and not reaching the tabs before choosing.
- Saving the choice and reading it back on later launches, including recovery from a bad saved value.
- Showing and changing the edition from the Menu tab.
- Showing the selected edition name on Home.
- Screenshot regression of the two new screens (edition selection screen, Menu edition list) on Android.
- Effects on the five existing Maestro flows, which start from a clean install.

**Out of scope**

- Loading or showing news content. The spec leaves it to the Home feed feature. Covered by: that feature's own plan.
- Fetching the edition list from the network. The list is fixed in the app (spec Assumptions). Covered by: nobody, because it does not exist.
- Edition names in other languages. Only the English strings file exists. Covered by: nobody until a second language is added.
- iOS verification. Covered by: nobody until Xcode is available (`001-project-scaffold` T025, T055).
- The My Infobae, Media, and Chat tabs, which stay as placeholders. Covered by: their existing Maestro flows (see section 5).

**Stories referenced in this plan**

- **US1** — Choose an edition on first launch
- **US2** — Keep the choice between launches
- **US3** — Change the edition from the Menu

References like `US2-AC1` mean story 2, its first acceptance scenario. The spec has 14 acceptance scenarios: 5 in US1, 3 in US2, and 6 in US3.

---

## 2. Risks

| Risk | Likelihood | Impact | Testing response | Trigger |
|---|---|---|---|---|
| All five existing Maestro flows start with a clean install and expect the tab bar at once. After this feature, a clean install shows the edition list, so the flows fail. The Home and Menu baselines also change. | High | Medium | Deeper coverage: regression scope names every flow, and a shared "pick an edition" step is a risk-driven addition (section 5) | The change is not additive: it adds a screen before the tabs. Flows use `launchApp` with `clearState: true` (`.maestro/flows/home.yaml`, `.maestro/flows/menu.yaml`). A failed Maestro run blocks a PR merge (constitution, Quality Gates). |
| A missing, corrupt, or unknown saved value crashes the app at launch or leaves it on a blank edition. It would affect every launch. | Medium | High | Deeper coverage: T12, T13, T22 | No preference code or test exists yet (search in section "Sources"). Impact is High because a launch crash blocks all use of the app. |
| Home and Menu show different editions, because they read the value separately. | Medium | Medium | Deeper coverage: T18 renders both from the same state | FR-016 asks for one value everywhere. The code is new, so there is no existing test. A wrong edition is noticed by the reader. |
| The spec does not say what shows while the saved edition is being read. The list could flash before the tabs. | Medium | Medium | Extra scenario: UAT2 judges "the tabs show at once". No automated condition, because the spec gives no rule to test (see "Explicitly not covered") | The read is asynchronous on a device. The spec's US2 independent test says "the tabs show at once" but no requirement states it. |
| iOS is never exercised, so an iOS-only defect ships unseen. | High | Medium | Accept | There is no iOS test run or baseline at all. The user deferred iOS on purpose on 2026-10-19. Revisit when Xcode is available. |

---

## 3. Test Conditions

| ID | Condition | Verifies | Level | Priority | Already covered |
|---|---|---|---|---|---|
| T1 | With no saved edition, the app shows the edition list and does not show the tab bar. | FR-001, US1-AC1 | integration | P1 | — |
| T2 | The list offers exactly the nine editions named in the spec: Argentina, Estados Unidos, Colombia, España, México, Perú, Cuba, Centroamérica, Mundo. | FR-002 | unit | P1 | Partly. Ids are unique and lookup works in `src/domain/infobae/infobae.test.ts`. The nine names are not asserted. |
| T3 | The first-launch list and the Menu list show the same editions in the same order. | FR-013 | integration | P2 | — |
| T4 | Tapping an edition on first launch shows the five tabs with Home active. | FR-004, US1-AC2 | integration | P1 | — |
| T5 | Choosing an edition saves that edition's id to local preferences, once. No save happens before the tap. | FR-004 | unit | P1 | — |
| T6 | After a choice, Home shows the name of the chosen edition. | FR-011, US1-AC3 | integration | P1 | — |
| T7 | While the list shows, the tab bar is absent and the tab routes cannot be reached. | FR-003, US1-AC4 | integration | P1 | — |
| T8 | While the list shows, the Android system back action leaves the list on screen and does not show the tabs. | US1-AC5 | end-to-end | P1 | — |
| T9 | With a valid saved edition, launch shows the tabs directly and never shows the list. | FR-005, US2-AC1 | integration | P1 | — |
| T10 | With a valid saved edition and no network, launch still shows the tabs on that edition, and no network call is made at launch. | FR-005, US2-AC2 | integration | P1 | — |
| T11 | After a full close and reopen, Home shows the same edition name. | US2-AC3 | end-to-end | P1 | — |
| T12 | A saved value that is missing, empty, not valid data, the wrong type, or an unknown edition id reads as "no edition". | FR-006, "The saved preference cannot be read" | unit | P1 | Partly. Unknown-id lookup returns nothing in `src/domain/infobae/infobae.test.ts` ("finds an edition by id"). |
| T13 | For each saved value in T12, the app shows the edition list and does not crash. | SC-004, FR-006 | integration | P1 | — |
| T14 | Several quick taps on editions on first launch keep the last tap, show the tabs once, and do not crash. | "taps editions quickly several times" | integration | P1 | — |
| T15 | The Menu tab shows the name of the current edition. | FR-007, US3-AC1 | integration | P2 | — |
| T16 | Tapping the current edition in the Menu opens the list with the current edition marked. | FR-007, FR-008, US3-AC2 | integration | P2 | — |
| T17 | Choosing a different edition from the Menu saves it, and the Menu shows the new name. | FR-009, US3-AC3 | integration | P2 | — |
| T18 | After a Menu change, Home shows the new name with no restart. Home and Menu read the same value. | FR-009, FR-016, US3-AC4, SC-003 | integration | P2 | — |
| T19 | After a Menu change and a full close and reopen, the new edition is still selected. | US3-AC5 | end-to-end | P2 | — |
| T20 | Leaving the Menu list without a choice does not change or save the edition. | FR-010, US3-AC6 | integration | P2 | — |
| T21 | Tapping the edition that is already selected leaves the selection the same, with no error. | "taps the edition that is already selected" | integration | P2 | — |
| T22 | If saving fails, the choice still works for the current session and the app does not crash. | FR-012, "Saving the choice fails" | integration | P1 | — |
| T23 | If the app closes while the first-launch list shows, the next launch shows the list again. | "closes the app while the edition list shows" | end-to-end | P2 | — |
| T24 | From a clean install, the tabs show after one tap. From Home, changing the edition takes three taps or fewer (Menu tab, current edition, new edition). | SC-001, SC-003 | end-to-end | P2 | — |
| T25 | On a rotated device and on the smallest supported screen, every edition row can be reached and none is cut off. | "A small screen or rotated device" | manual | P2 | — |
| T26 | Both new screens are built only from design system components. Any new view was added to the design system first. | FR-014, SC-005 | manual | P2 | — |
| T27 | Every new string, including the nine edition names, exists in `src/localization/en.json` and resolves to a non-empty string. | FR-015, SC-005 | unit | P2 | Yes for resolution of every key. `src/localization/index.test.ts` ("resolves every key in en.json to a non-empty string") runs on all keys, so it covers new ones. |
| T28 | No screen in this feature contains hard-coded user-facing text. | FR-015, SC-005 | manual | P2 | — |
| T29 | A screenshot test passes for the edition selection screen and for the Menu edition list, on Android, against saved baselines. | SC-006 | end-to-end | P1 | — |

**Notes on level choices and priorities**

- **Level for T28:** a source-reading check is possible but the project has none. A person reviews it in the PR, as the constitution's Quality Gates already require.
- **Priority for T7, T12, T13, T14, T22:** these state a prohibition or a no-crash property. They are P1 whatever the story's own priority.
- **T10:** the check is that launch makes no network call. It does not prove behaviour on a device with the radio off. The Android airplane-mode check is part of UAT2.
- **T13 and SC-004:** the spec says "10 out of 10 test runs". The recovery code is deterministic, so one pass per kind of bad value in T12 is taken as meeting it.
- **T8:** the Android system back action has no iOS equivalent.

**Lens set in use**: `unit`, `integration`, `end-to-end`, `manual` as condition levels, plus the UAT and Regression sections. These are the defaults, because no strategy document exists and the constitution names no lenses.

- **integration** means Jest with `@testing-library/react-native` under `jest-expo`, rendering real screens with preference storage and the network replaced by test doubles. Both are already in `package.json`.
- **end-to-end** means Maestro flows on the fixed Android emulator in `.maestro/config.yaml`. It is the project's real device surface.
- **api-contract** is not used. This feature makes no network call, so it has no API surface.
- **Surface:** a React Native app for Android and iOS. There is no browser surface. `react-dom` and a `web` script are present, but the constitution's platforms are Android and iOS, and no browser test tool is installed. No browser tool is named in this plan.

**Where the constitution speaks:** Principle III requires unit tests for edition handling and preference persistence (T2, T5, T12). Principle IV requires Maestro screenshot tests for every screen (T29). The two agree with this plan. No divergence found.

**Explicitly not covered**

| Verifies | Reason | Remedy |
|---|---|---|
| SC-006, iOS half (screenshot tests on iOS) | Deferred | Tasks T025 and T055 of `001-project-scaffold`. Needs Xcode and iOS baselines. |
| Every end-to-end condition (T8, T11, T19, T23, T24, T29) on iOS | Deferred | Same remedy. T8 has no iOS equivalent at all. |
| FR-002, the order of the list on screen | Untestable as written | The spec names nine editions but never states their display order. FR-013 only says the two lists match, which T3 checks. A decision on the order is needed first. |
| What shows while the saved edition is being read at launch (FR-005, US2) | Untestable as written | The spec has no rule about a loading moment. A decision is needed, for example "show nothing until the read ends". Run `/speckit-clarify`. UAT2 observes it for now. |
| SC-002, "100% of later launches" | Untestable as written (as a percentage) | A test cannot prove 100%. T9, T10, and T11 cover the defined cases: online, offline, and after a full close. |

---

## 4. Suggested UAT Scenarios

The executor is `human` for all three. The app is a mobile app. The surfaces an agent can drive here are a browser, a command line, or HTTP, and this project has none of them. The Maestro flows in section 3 are the automated version of the same journeys.

| ID | Journey | Expected outcome | Verifies | Priority | Executor | Evidence |
|---|---|---|---|---|---|---|
| UAT1 | A new reader installs the app, opens it, and picks "Colombia". | An edition list shows first. After one tap on "Colombia", the five tabs show and Home says "Colombia". The reader could not reach the tabs before choosing. | US1-AC1, US1-AC2, US1-AC3, US1-AC4 | P1 | human | Screenshots of the list and of Home |
| UAT2 | The same reader closes the app fully, turns on airplane mode, and opens it again. | The tabs show at once on "Colombia". No edition list appears, not even briefly. | US2-AC1, US2-AC2, US2-AC3 | P1 | human | Screen recording of the launch |
| UAT3 | The reader opens Menu, sees "Colombia", taps it, picks "México", and goes to Home. Then the reader closes and reopens the app. | Menu shows "Colombia" first, and the list marks it. After the pick, Menu and Home both show "México". After the reopen, the edition is still "México". | US3-AC1, US3-AC2, US3-AC3, US3-AC4, US3-AC5 | P2 | human | Screenshots of Menu, the list, Home, and Home after the reopen |

US3-AC6 (leaving the list without a choice) is covered by T20 only. UAT3 does not repeat it.

---

## 5. Regression Scope

| Test | Touches | Kind |
|---|---|---|
| `.maestro/flows/home.yaml` | Clean-install launch and the Home screen. It will see the edition list first, and the Home screen now shows an edition name. | existing |
| `.maestro/flows/menu.yaml` | Clean-install launch and the Menu screen. The Menu now shows the current edition. | existing |
| `.maestro/flows/my-infobae.yaml` | Clean-install launch. It needs the new first-launch step to reach the tabs. | existing |
| `.maestro/flows/media.yaml` | Clean-install launch. Same reason. | existing |
| `.maestro/flows/chat.yaml` | Clean-install launch. Same reason. | existing |
| `.maestro/shared/assert-tabs.yaml` | The five tab labels, which must be unchanged. | existing |
| `src/navigation/tabs.test.ts` | Tab order and route files under `app/(tabs)`, which the feature's root layout change can affect. | existing |
| `src/localization/index.test.ts` | `src/localization/en.json`, which gains new keys. | existing |
| `src/design-system/components/Placeholder.test.tsx` | `Placeholder`, which Home and Menu may stop using. | existing |
| `src/domain/infobae/infobae.test.ts` | `src/domain/infobae/editions.ts`, the edition list this feature reads. | existing |
| A shared Maestro step that picks an edition, used by the five flows above | The clean-install launch path in every flow | risk-driven addition: the first risk in section 2 |

The five flows and the Home and Menu baselines must be updated in the same PR (constitution, Principle IV). They are listed here as obligations: they must be green after the update.

---

## 6. Environment & Data

- **Environment**
  - Unit and integration tests: `npm test` (Jest, `jest-expo`) on a developer machine.
  - Preference storage and the network are replaced by test doubles. No real device storage is used.
  - End-to-end tests: `npm run test:e2e` (Maestro) against the Android emulator `Pixel_3a_API_34_extension_level_7_arm64-v8a`, portrait, 1080x2220, density 440. The app is a standalone release build from `npm run build:android:release`, not Expo Go.
  - Lint and types: `npm run verify` runs lint, typecheck, and unit tests.
- **Test data**
  - Edition ids and names come from `src/domain/infobae/editions.ts` and the strings file.
  - Bad saved values for T12 and T13: a missing value, an empty string, text that is not valid data, a value of the wrong type, and an id that is not in the list.
  - Every Maestro flow starts with `launchApp` and `clearState: true`, which resets saved preferences. Flows that test persistence (T11, T19, T23) relaunch without clearing state.
  - Baselines in `.maestro/baselines/` are re-recorded with `.maestro/record-baselines.sh` after a screen changes.
- **Prerequisites**
  - A local-preference storage mechanism does not exist in `package.json` yet. The plan phase chooses it. T5, T9, T10, T12, T13, T22 need it to be replaceable in tests.
  - Maestro 2.11.0 and the emulator installed.
  - UAT needs a physical or emulated Android device with the release build installed.
  - No flags, migrations, accounts, or third-party sandboxes.

---

## 7. Exit Criteria

| Criterion | Threshold | Confirmed by |
|---|---|---|
| All P1 conditions pass | 15 of 15 P1 conditions (T1, T2, T4 to T14, T22, T29) | Feature developer |
| All P2 conditions pass, or each failure is listed with a decision | 14 of 14 P2 conditions pass, or a written waiver for each failure | Feature developer, reviewed by the PR reviewer |
| Every acceptance scenario is reached | 14 of 14 acceptance scenarios appear in a condition or a UAT scenario | PR reviewer |
| Lint, typecheck, and all unit tests pass before the feature branch is pushed | Zero errors, zero failures (`npm run verify`) | Feature developer |
| All Maestro tests pass before merge, including the five updated existing flows and the new ones | Zero failures on the fixed Android emulator | PR reviewer |
| Screenshot baselines for the two new screens exist and the Home and Menu baselines are re-recorded | One baseline per screen, all committed | PR reviewer |
| All P1 UAT scenarios have evidence | UAT1 and UAT2 have evidence linked from their tasks | Project owner |
| Open spec gaps are resolved or accepted in writing | The list order and the launch-moment rule are clarified, or the owner accepts the gap | Project owner |
| iOS gap is recorded | The deferral of T025 and T055 stays on record, and this PR adds no new iOS claim | Project owner |

No coverage floor is stated, because none is declared by the constitution or a strategy document.

---

## Sources consulted and coverage

- **Read**
  - `specs/002-edition-selection/spec.md`, in full.
  - `.specify/memory/constitution.md`, in full.
  - `.specify/extensions/spectra/templates/test-plan-template.md` (the template used; no override or preset layer exists).
  - `package.json`, the only dependency manifest.
  - `.maestro/config.yaml`, `.maestro/flows/home.yaml`, `.maestro/flows/menu.yaml`, `.maestro/shared/assert-tabs.yaml`.
  - `src/navigation/tabs.test.ts`, `src/design-system/components/Placeholder.test.tsx`, `src/localization/index.test.ts`, `src/domain/infobae/infobae.test.ts` (opening section; the test names were checked).
  - `src/screens/HomeScreen.tsx`, `src/screens/MenuScreen.tsx`, `app/_layout.tsx`, `src/localization/en.json`, `src/domain/infobae/editions.ts`.
  - Listings of `app/`, `src/`, `.maestro/`, and `.maestro/baselines/`.
- **Searches run**
  - The word "edition" (any case) under `src`, `app`, and `.maestro`, in `.ts`, `.tsx`, `.yaml`, and `.json` files. Hits: `src/domain/infobae/editions.ts`, `urls.ts`, and `infobae.test.ts` only. No test referencing editions was found in the screens, the navigation, or the Maestro flows.
  - The words `asyncstorage`, `securestore`, `mmkv`, `preference`, and `localStorage` under `src`, `app`, `.maestro`, and `package.json`. No hits. No preference-storage code or test was found in what was searched.
- **Coverage**: 7 of the 10 existing test files that touch this feature were read: 2 of the 5 Maestro flows (`home.yaml`, `menu.yaml`), the shared `assert-tabs.yaml`, and all 4 Jest test files. The other three flows (`my-infobae.yaml`, `media.yaml`, `chat.yaml`) were listed but not opened, because they share the structure of `home.yaml` and `menu.yaml`. The selection method was a search for the feature's words plus a read of the files that render Home, Menu, and the root layout. There is no repository-wide semantic search, so a test that covers edition behaviour without using the word "edition" could have been missed.
- **Could not read**
  - `docs/TEST_STRATEGY.md` and `docs/test-strategy/TEST_STRATEGY.md`: not present.
  - CI workflow definitions: no `.github` folder exists, and no other CI configuration was found.
- **Optional sections added**: none. No performance or security budget, data migration, separate QA team, or audited regime is stated.
- **Nothing was executed**: existing coverage was established by reading test source, not by running the suite. A test that exists and currently fails reads here as coverage.

**Known limitations**

- The conditions rest on the specification as written on 2026-10-19. They go stale when it changes. Re-run this command rather than hand-patch.
- No tool was checked against a package registry. No network request was made.
- This document states what will be verified. The task and implement commands produce the tests.
- The guard that keeps UAT tasks open is the project's constitution. It does not yet carry the clause that says the implement command never executes UAT tasks. `/speckit-spectra-test-strategy` drafts that amendment.
