# Data Model: Project Scaffold

The scaffold has no stored data. These are the in-code structures from the spec.

## Tab (`src/navigation/tabs.ts`)

| Field | Type | Rule |
|-------|------|------|
| `key` | string | One of `home`, `my-infobae`, `media`, `chat`, `menu`. Unique. |
| `route` | string | Matches a file in `app/(tabs)/`. |
| `labelKey` | string | A key that exists in `en.json`. |

Rules: Exactly 5 tabs, in this order: home, my-infobae, media, chat, menu. A unit test checks the
count, the order, and that every `labelKey` resolves.

## Localized string (`src/localization/en.json`)

Flat or nested key to string map. Rule: every key used in code exists in `en.json`. A missing key in
another locale falls back to `en`. A key missing everywhere returns the key and logs a dev warning.

## Design system component (`src/design-system/components/`)

Initial set: `Screen`, `Text` (themed), `TabBarLabel`/icon helper, `Placeholder` (tab name block).
Each takes props typed in TypeScript and reads only theme tokens.

## Theme tokens (`src/design-system/`)

`colors`, `fonts`, `spacing`, `typography` styles. One light theme now.

## Screenshot baseline (`.maestro/`)

One image per placeholder screen, per fixed device configuration.
