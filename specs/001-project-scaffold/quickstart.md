# Quickstart: Validate the Project Scaffold

## Prerequisites

- Node.js 20+ and npm
- Xcode with an iOS simulator, and/or Android Studio with an emulator
- Maestro CLI (`brew install maestro` or the official installer). It is not installed yet.

## Run

1. `npm install`
2. `npm start`, then open on the iOS simulator (`i`) and the Android emulator (`a`).
3. Expected: the tab bar shows Home, My Infobae, Media, Chat, Menu. Each tab shows its name.

## Check quality gates

1. `npm run lint` → no errors.
2. `npm run typecheck` → no errors.
3. `npm test` → all sample tests pass.
4. `npm run test:e2e` → 5 screenshot flows pass against baselines.

## Prove the checks catch problems (SC-007)

- Add an unused variable or a literal string in JSX → `npm run lint` fails.
- Break a unit test → `npm test` fails.
- Change a placeholder color → `npm run test:e2e` fails on that screen.
Revert each change after the check.

## Check the template rule (SC-008)

- `package.json` and `app.json` came from `blank-typescript`. The guide records the template name
  and version. No sample demo screens remain.
