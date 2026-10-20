---
title: Patterns and best practices
purpose: Lists the rules the team follows and says where new code goes.
portal: dev
parent: Developer Portal
nav_order: 2
---

# Patterns and best practices

## Rules

| Rule | In short | Checked by |
|---|---|---|
| Design system first | Screens use only design system components. | Lint |
| Localized strings | No text in JSX. Use `t('key')`. | Lint |
| Tested logic | Every module in `src/domain/` has unit tests. | Review and `npm test` |
| Screenshot tests | Every screen has a Maestro flow and baseline. | `npm run test:e2e` |
| Strict TypeScript | No `any` without a comment that says why. | Lint and `tsc` |
| Public APIs only | Use only the public Infobae APIs. Send no credentials. | Review |

## Where does new code go?

| You add | Put it here |
|---|---|
| A screen | [`src/screens/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/screens), plus a thin route file in [`app/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app). |
| A tab | A route in `app/(tabs)/`, an entry in [`tabs.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/navigation/tabs.ts), and a label in `en.json`. |
| A reusable component | [`src/design-system/components/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/design-system/components). Export it from `index.ts`. Add a test next to it. |
| A string | [`src/localization/en.json`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/localization/en.json), nested by area. |
| Business logic | A module in [`src/domain/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain) with a test next to it. |
| A screenshot test | [`.maestro/flows/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.maestro) with its baseline. |

## Tests without the network

Jest and Maestro use the fixture content source, so no test calls the live APIs. The fixture source
picks its behavior from the edition (for example, Cuba always fails, Centroamérica is empty). This
lets a screenshot flow reach each state without a hidden control.

## Quality gates

| When | Command |
|---|---|
| Before a push | `npm run verify` (lint, type check, unit tests) |
| Before a PR merge | `npm run test:e2e` (Maestro screenshots) |
| After you change these docs | `npm run verify:docs` |

More detail is in the [project guide]({{ site.baseurl }}{% link PROJECT_GUIDE.md %}).
