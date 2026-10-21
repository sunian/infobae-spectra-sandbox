---
title: Architecture
purpose: Shows the main parts of the app and how data flows from the Infobae APIs to the screen.
portal: dev
parent: Developer Portal
nav_order: 1
---

# Architecture

## Layers

```mermaid
flowchart TD
  Routes["app/ routes (Expo Router)"] --> Screens["src/screens"]
  Screens --> DS["src/design-system"]
  Screens --> State["src/state (context and hooks)"]
  State --> Theme["ThemeContext (theme choice)"]
  Theme --> DS
  Screens --> Loc["src/localization (t function)"]
  State --> Domain["src/domain (logic)"]
  Domain --> Source["ContentSource"]
  Source --> Live["live: public Infobae APIs"]
  Source --> Fixture["fixture: bundled data"]
```

- Routes in [`app/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app) stay thin. Each one renders a screen from [`src/screens/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/screens).
- Screens use only components from the [design system](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system).
- State and hooks in [`src/state/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state) run the logic in [`src/domain/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain).
- All text comes from [`en.json`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/localization/en.json) through `t()`.

## Theme data flow

```mermaid
sequenceDiagram
  participant P as Phone setting
  participant T as ThemeContext
  participant S as Storage
  participant D as ThemeProvider (design system)
  participant C as Component
  T->>S: read saved choice at launch
  P-->>T: light or dark
  T->>T: resolveScheme(choice, phone)
  T->>D: scheme
  D-->>C: palette (useColors / useThemedStyles)
  Note over T,S: setPreference updates state first, then saves
```

[`ThemeContext.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state/ThemeContext.tsx) holds the choice (`system`, `light`, `dark`). The pure
function `resolveScheme` in [`preference.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/theme/preference.ts) turns the choice and the phone setting
into `light` or `dark`. The design system [`ThemeProvider`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system/theme.tsx) gives that scheme's palette to
every component. The root layout keeps the splash screen up until the edition and the theme are both read.

## Feed data flow

```mermaid
sequenceDiagram
  participant H as HomeScreen
  participant F as useFeed
  participant R as feedReducer
  participant C as ContentSource
  H->>F: edition
  F->>C: fetch page (limit 20, offset)
  C-->>F: items or ContentError
  F->>R: dispatch result with request id
  R-->>H: status and items
  Note over F,R: A result with an old request id is ignored
```

The reducer in [`feedReducer.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/feed/feedReducer.ts) is a pure function with unit
tests. The hook [`useFeed.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state/useFeed.ts) connects it to the source.

## Navigation

```mermaid
flowchart TD
  Root["Root Stack"] --> Select["select-edition (no edition yet)"]
  Root --> Tabs["(tabs): Home, My Infobae, Media, Chat, Menu"]
  Root --> Change["change-edition"]
  Root --> ChangeTheme["change-theme"]
  Root --> Article["article (param: path)"]
```

The root layout uses `Stack.Protected`. Before an edition is chosen, only `select-edition` can be
reached. After that, the tabs, `change-edition`, `change-theme`, and `article` can be reached. The tab list is in
[`src/navigation/tabs.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/navigation/tabs.ts).
