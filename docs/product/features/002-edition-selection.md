---
title: Edition selection
purpose: Explains how a reader picks an edition, and how the app remembers and changes it.
portal: product
feature: 002-edition-selection
status: available
parent: Product Portal
nav_order: 2
---

# Edition selection

## Summary

The first time the reader opens the app, a list of editions shows. The reader taps one. The app
saves the choice and shows the tabs. On later launches the tabs show at once. The reader can change
the edition any time from the **Menu** tab.

The editions are: Argentina, Estados Unidos, Colombia, España, México, Perú, Cuba, Centroamérica,
and Mundo.

## User journey

```mermaid
flowchart TD
  A[Reader opens the app] --> B{Edition saved?}
  B -- No --> C[Edition list shows]
  C --> D[Reader taps an edition]
  D --> E[Choice is saved]
  B -- Yes --> F[Tabs show at once]
  E --> F
  F --> G[Reader opens Menu]
  G --> H[Reader taps Edition]
  H --> I[Reader picks another edition]
  I --> J[Choice is saved and Home follows it]
```

## Error and edge cases

| Situation | What the reader sees |
|---|---|
| The saved edition is no longer in the list | The app asks again, as on first launch. |
| The saved choice cannot be read | The app asks again. It does not crash. |
| Reader taps editions fast on first launch | The last tap wins. The tabs show once. |
| Reader taps the edition that is already selected | Nothing changes. No error shows. |
| Reader closes the app on the edition list | The next launch shows the list again. |
| Small screen or rotated device | The list scrolls. Every edition can be reached. |
| Saving the choice fails (for example, storage is full) | The app uses the choice for this session and does not crash. |
