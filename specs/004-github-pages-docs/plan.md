# Implementation Plan: GitHub Pages Documentation Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Publish a Developer portal and a Product portal from the `docs/` folder with GitHub's built-in Pages build, plus one SpecKit skill that two hooks run after `/speckit-specify` and `/speckit-implement`.
> - **Why:** New developers and non-technical teammates can learn the app fast, and the docs stay current with no manual work and no custom GitHub Action.
> - **Scope / Approach / Order:** Jekyll site in `docs/` with first content, then a validator tool, then the update skill and hooks, then turn on Pages in repo settings.
> - **Biggest risk or open question:** Without a build step, the only checks are the local validator and the Pages build itself, and mermaid renders only in the browser.
> - **Check this:** Jekyll with the `just-the-docs` theme, deployed from `main` `/docs` with no workflow file (R1, R5). Existing `docs/*.md` files become public pages. The repo is now public.

**Branch**: `004-github-pages-docs` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-github-pages-docs/spec.md`

## Summary

The repo publishes a documentation site from the `docs/` folder using GitHub's built-in Pages
build ("Deploy from a branch", `main`, `/docs`). There is no workflow file and no custom action. The
site has a landing page and two portals: Developer (`/dev/`) and Product (`/product/`). Pages are
Markdown with mermaid diagrams. The theme is `just-the-docs`, loaded as a remote theme.

A new project skill, `speckit-portal-update`, reads the current feature's spec, plan, tasks, and
code and edits the Markdown pages in `docs/`. Two entries in `.specify/extensions.yml` run it after
`/speckit-specify` (mode `specify`) and after `/speckit-implement` (mode `implement`). A validator
(`tools/portal/validate.ts`) checks front matter, TL;DR blocks, links, and mermaid syntax. The skill
must run it before it reports success. Pages go live when the branch merges to `main`.

## Technical Context

**Language/Version**: Markdown, Jekyll config (YAML), and mermaid. The validator is TypeScript 6 on Node.js 20+ (same as the app).

**Primary Dependencies**: Site: GitHub Pages built-in Jekyll build, `just-the-docs` remote theme, mermaid loaded from a pinned CDN version. Validator: `mermaid`, `jsdom`, `tsx`, `vitest` (dev only, in `tools/portal/`).

**Storage**: Files in git. Feature pages carry front matter (`feature`, `status`).

**Testing**: Vitest for the validator and page helpers. The validator is the content gate. The GitHub Pages build is the final site build.

**Target Platform**: GitHub Pages (static site), viewed in phone and desktop browsers.

**Project Type**: Documentation site + agent skill/hooks, inside a mobile-app repo.

**Performance Goals**: Static pages. Live within 10 minutes of a merge (SC-007).

**Constraints**: Public content only (FR-021; repo is public). No GitHub Actions workflow file. Only plugins and themes that GitHub Pages supports. Hooks must not change the result of the triggering command (FR-016). No edits to app code or app dependencies.

**Scale/Scope**: About 4 features now, 20 or fewer later. About 15 first-release pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Note |
|---|---|---|
| I. Design System First | N/A to the site | The site is not the app. The Product portal documents the app design system (FR-008). |
| II. Localization | N/A to the site | The site is English only (spec assumption). No app strings change. |
| III. Unit-Tested Business Logic | PASS | The validator and merge helpers are logic and get Vitest tests. The agent skill itself is instructions, not code. |
| IV. Screenshot-Tested Screens | N/A | No app screen is added or changed. |
| V. Static Analysis and Code Style | PASS | Tool code is TypeScript with strict mode and no `any`. `tools/portal/` has its own ESLint config. Root `eslint` and `tsc` ignore `tools/` so `npm run verify` stays unchanged. A new `npm run verify:docs` runs the tool tests and the validator. |
| VI. Edition-Aware, Public-API Content | N/A | No app content source changes. |
| VII. TL;DR | PASS | Every page the hook writes needs a TL;DR. The validator enforces it (FR-020). |

No violations. Complexity Tracking is empty. Re-check after Phase 1: still PASS. The design adds no
app code and the validator enforces Principle VII.

## Project Structure

### Documentation (this feature)

```text
specs/004-github-pages-docs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── portal-content-contract.md
│   └── hook-contract.md
├── checklists/requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
docs/                                  # Pages source (Deploy from branch: main, /docs)
├── Gemfile                            # NEW. github-pages gem, for the optional local preview
├── _config.yml                        # NEW. remote_theme just-the-docs, mermaid, excludes
├── _includes/head_custom.html         # NEW. Loads pinned mermaid for the theme
├── index.md                           # NEW. Landing page (FR-002)
├── dev/                               # Developer portal
│   ├── index.md                       # Architecture overview + diagrams
│   ├── architecture.md
│   ├── decisions/<NNN-slug>.md        # One file per feature (idempotent replace)
│   ├── patterns.md
│   └── dependencies.md
├── product/                           # Product portal
│   ├── index.md                       # Feature list with status
│   ├── features/<NNN-slug>.md         # One file per feature: summary, journey, edge cases, status
│   └── design-system.md
├── API_SPIKE.md                       # EXISTING. Gets front matter so it shows under Developer
└── PROJECT_GUIDE.md                   # EXISTING. Gets front matter so it shows under Developer

tools/portal/                          # NEW. Own package.json and tsconfig. Not part of the app build.
├── validate.ts                        # Front matter, TL;DR, links, mermaid parse
├── pages.ts                           # Helpers: feature page path, status flip, index order
└── *.test.ts

.claude/skills/speckit-portal-update/SKILL.md   # NEW. The update skill both hooks call
.specify/extensions.yml                         # EDIT. Add after_specify and after_implement hooks
eslint.config.js, tsconfig.json                 # EDIT. Ignore/exclude tools/
package.json                                    # EDIT. Add verify:docs script
```

**Structure Decision**: GitHub Pages can publish only the repo root or `/docs`. The `/docs` folder
already exists, so the site lives there. The build tooling is outside `docs/` in `tools/portal/`,
so it is never published. No `.github/workflows` file is added.

## Complexity Tracking

No constitution violations. Table not needed.
