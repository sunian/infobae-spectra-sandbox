# Quickstart: Home Feed and Article Detail

How to check that the feature works. Contracts: [contracts/feed-article-contracts.md](./contracts/feed-article-contracts.md).
Data rules: [data-model.md](./data-model.md).

## Prerequisites

- Branch `003-home-feed-article-detail`. `npm install` done.
- Maestro 2.11.0 and the Android emulator from `.maestro/config.yaml` for the screenshot checks.

## 1. Unit and integration tests (no network)

```sh
npm run verify
```

Expected: lint, typecheck, and all Jest tests pass. Tests use the fixture source or a mocked `fetch`.

## 2. Run on the live APIs (manual)

```sh
npm start
```

1. Open on the Android emulator. Pick "Colombia".
2. Home shows a loading state, then articles. Scroll down. More articles load, none repeat.
3. Pull down. The list refreshes.
4. Tap an article. The detail screen shows header, hero image, body. Tap a link. The browser opens.
5. Go back. Home keeps its position.
6. Open Menu, change to "Perú", open Home. Only Peruvian articles show.
7. Turn on airplane mode, pull down. The articles stay and an error message shows. Reopen the app on a
   fresh start: Home shows the error state with "Try again".

## 3. Screenshot tests (fixture build)

```sh
npm run build:android:release   # sets EXPO_PUBLIC_CONTENT_SOURCE=fixture
npm run test:e2e
```

Expected: all flows pass, including the new Home and Article flows. To record baselines, run
`.maestro/record-baselines.sh` and review the images in `.maestro/baselines/`.

## 4. Fixture scenarios (for flows and manual checks)

| Edition | Behavior |
|---|---|
| Colombia | Pages of content |
| Cuba | Always an error |
| Centroamérica | Empty |
| México | Page 2 fails once, then works |
| Mundo | First page is slow (loading state) |
