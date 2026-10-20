---

description: "Task list for GitHub Pages Documentation Portals"
---

# Tasks: GitHub Pages Documentation Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** 41 ordered tasks that build the Jekyll doc site in `docs/`, the validator in `tools/portal/`, the update skill, and the two hooks.
> - **Why:** The team gets a Developer portal and a Product portal that stay current with no manual work and no GitHub Action.
> - **Scope / Approach / Order:** Setup, then the validator (tests first), then Product portal, Developer portal, specify hook, implement hook, publish settings, and polish.
> - **Biggest risk or open question:** The first content is written by hand from existing specs, and mermaid renders only in a browser (T038 checks the live site).
> - **Check this:** The public-content review of the two existing docs (T020) before the first deploy. Task T038 turns on Pages in repo settings and needs repo admin rights.

**Input**: Design documents from `/specs/004-github-pages-docs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hook-contract.md, contracts/portal-content-contract.md, quickstart.md

**Tests**: Required for the validator and page helpers (constitution III). Test tasks come before the code they cover. See each test fail first. Content pages and the skill have no unit tests. The validator and the quickstart runs check them.

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root. Spec requirements are named "FR-001" and so on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: Which user story the task belongs to (US1 to US5)

## Key Rules for All Tasks

- **No GitHub Actions workflow.** Do not add any file under `.github/workflows/`. Deploy uses the built-in Pages build (research R5).
- **Constitution VII**: Every Markdown page under `docs/dev/` and `docs/product/` starts with a TL;DR block after the title. The validator enforces this.
- **Constitution V**: Code in `tools/portal/` is TypeScript, strict, no `any`, lint clean.
- **Public content only (FR-021).** Write no secrets, keys, or private URLs.
- **Facts only (FR-017).** Take page content from specs, plans, `docs/`, `vision.md`, `package.json`, and `src/`. Do not invent facts.
- **Do not change app code** (`app/`, `src/`) or app dependencies in `package.json`. Only add the `verify:docs` script.
- Page front matter follows `data-model.md`. Page rules follow `contracts/portal-content-contract.md`.

## Phase 1: Setup

**Purpose**: Tool package and repo wiring. No content yet.

- [ ] T001 Create `tools/portal/package.json` (private, scripts: `test` = `vitest run`, `lint` = `eslint .`, `validate` = `tsx validate.ts`), `tools/portal/tsconfig.json` (strict), and `tools/portal/eslint.config.js` (no `any`). Dev dependencies: `typescript`, `tsx`, `vitest`, `eslint`, `typescript-eslint`, `mermaid`, `jsdom`, `@types/node`, `@types/jsdom`, `gray-matter`. Run `npm install` in `tools/portal/`.
- [ ] T002 [P] Edit `eslint.config.js` to add `'tools/'` and `'docs/'` to the `ignores` list. Edit `tsconfig.json` to add `"exclude": ["node_modules", "tools", "docs"]`. Run `npm run verify` and confirm it still passes.
- [ ] T003 [P] Edit `package.json`: add the script `"verify:docs": "cd tools/portal && npm test && npm run lint && npm run validate"`. Do not change any dependency.
- [ ] T004 [P] Add `tools/portal/node_modules/` and `docs/_site/` and `docs/.jekyll-cache/` to `.gitignore`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The Jekyll scaffold and the validator. Every story needs both.

**Warning**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Create `docs/Gemfile` with `source "https://rubygems.org"` and `gem "github-pages", group: :jekyll_plugins`.
- [ ] T006 [P] Create `docs/_config.yml`: `title: Infobae App Docs`, `remote_theme: just-the-docs/just-the-docs`, `mermaid: { version: "10.9.1" }` (pin an exact version), `search_enabled: true`, `exclude: [Gemfile, Gemfile.lock, node_modules]`, and `plugins: [jekyll-remote-theme]`. Use only plugins that GitHub Pages allows.
- [ ] T007 [P] Create `docs/_includes/head_custom.html` that loads mermaid at the pinned version and initializes it, per the just-the-docs mermaid guide. Create `docs/_includes/mermaid_config.js` if the theme needs it.
- [ ] T008 Write the failing tests `tools/portal/pages.test.ts` for the helpers in `tools/portal/pages.ts`: `featurePagePath(feature)` returns `docs/product/features/<feature>.md`; `decisionPagePath(feature)` returns `docs/dev/decisions/<feature>.md`; `nextStatus(current, allTasksDone)` returns `'available'` only from `'planned'` when all tasks are done, never goes back, and returns the same value otherwise; `allTasksDone(tasksMd)` is true only when every `- [ ]` / `- [x]` line is `[x]`.
- [ ] T009 Implement `tools/portal/pages.ts` until T008 passes.
- [ ] T010 Write the failing tests `tools/portal/validate.test.ts` for a pure function `validatePage(path, content, repoRoot)` that returns `{ errors, warnings }`. Cover every row of the validator table in `contracts/portal-content-contract.md`: missing front matter field, TL;DR missing or first content not a TL;DR, TL;DR with more than 5 bullets, invalid mermaid block, repo link to a missing path, feature `status` not `planned` or `available`, secret-like string, and a section over 400 words (warning only). Add one test for a fully valid page. Also test that a page with a bad mermaid block returns the block's line number.
- [ ] T011 Implement `validatePage` in `tools/portal/validate.ts` until T010 passes. Use `gray-matter` for front matter, `mermaid.parse()` under `jsdom` for diagrams, and `fs.existsSync` for repo links. Export a `main()` that walks `docs/dev/` and `docs/product/` plus `docs/index.md`, prints each error as `path:line message`, and exits with code 1 on any error.
- [ ] T012 Run `npm run verify:docs` from the repo root. Expect the tool tests and lint to pass and the validator to pass on an empty or minimal `docs/`.

**Checkpoint**: Scaffold and validator exist. Content work can start.

---

## Phase 3: User Story 1 - Product reader learns the app from the Product portal (Priority: P1)

**Goal**: A non-technical reader understands the major features, journeys, edge cases, and design system.

**Independent Test**: Open `/product/` locally. Name the features, describe the edition-and-article journey, and say what the app shows when the feed fails, using only the portal (spec US1).

- [ ] T013 [US1] Read `specs/001-project-scaffold/spec.md`, `specs/002-edition-selection/spec.md`, `specs/003-home-feed-article-detail/spec.md`, `docs/PROJECT_GUIDE.md`, and `vision.md`. Write nothing yet. List for each feature: one-sentence summary, main user journey steps, and every error or edge case with the screen the reader sees.
- [ ] T014 [US1] Create `docs/product/index.md` (front matter `title: Product Portal`, `portal: product`, `nav_order: 2`, `has_children: true`; a TL;DR; a table of features with status badge and one-sentence description; one line saying who the portal is for).
- [ ] T015 [P] [US1] Create `docs/product/features/001-project-scaffold.md` with front matter (`feature`, `status: available`, `parent: Product Portal`, `portal`, `purpose`, `nav_order`), a TL;DR, a summary, a mermaid user-journey flowchart for the app shell and tabs, and the error and edge cases.
- [ ] T016 [P] [US1] Create `docs/product/features/002-edition-selection.md` in the same shape: first-launch choice, saved choice, change from Menu, and edge cases from the spec.
- [ ] T017 [P] [US1] Create `docs/product/features/003-home-feed-article-detail.md` in the same shape: the feed, paging, pull-to-refresh, article detail, and the loading, empty, and error states from the spec.
- [ ] T018 [US1] Read `src/design-system/tokens.ts`, `src/design-system/index.ts`, and the component names in `src/design-system/components/`. Create `docs/product/design-system.md`: a TL;DR, the colors and fonts as tables with values, and a list of reusable components with one plain sentence each (FR-008). Write no code.
- [ ] T019 [US1] Run `npm run verify:docs`. Fix every error in the Product pages. Then run `cd docs && bundle exec jekyll serve` and open `/product/` on a narrow window. Confirm no sideways scroll and that every diagram renders (FR-009, SC-005).

**Checkpoint**: Product portal works on its own.

---

## Phase 4: User Story 2 - New developer learns the codebase from the Developer portal (Priority: P1)

**Goal**: A new developer finds the structure, decisions, patterns, and dependencies in under 20 minutes.

**Independent Test**: Open `/dev/` locally. Say how the app is structured, where a new screen, its strings, and a reusable component go, and why the main libraries were chosen (spec US2).

- [ ] T020 [US2] Review `docs/API_SPIKE.md` and `docs/PROJECT_GUIDE.md` against FR-021 (no secrets, keys, private URLs, internal names). Report the result to the user. Stop and ask before you publish if you find a problem.
- [ ] T021 [P] [US2] Add front matter to `docs/API_SPIKE.md` and `docs/PROJECT_GUIDE.md` (`title`, `parent: Developer Portal`, `nav_order`) and a TL;DR if missing. Change no other content. Keep every existing relative link working.
- [ ] T022 [US2] Read `docs/PROJECT_GUIDE.md`, `package.json`, `app/`, and the folder layout of `src/`. Create `docs/dev/index.md` (front matter `title: Developer Portal`, `portal: dev`, `nav_order: 3`, `has_children: true`; TL;DR; a short "start here" list; links to the repo folders on `main`).
- [ ] T023 [P] [US2] Create `docs/dev/architecture.md`: a TL;DR, a mermaid flowchart of the major parts (routes in `app/`, screens, design system, state, domain with the content source, localization), a second diagram for the feed data flow, and repo links for each part (FR-003, FR-007).
- [ ] T024 [P] [US2] Create `docs/dev/patterns.md`: a TL;DR and the patterns from the constitution and project guide (design system first, localized strings, thin route files, fixture and live content source, tests next to code, where new code goes) with repo links.
- [ ] T025 [P] [US2] Create `docs/dev/dependencies.md`: a TL;DR and a table of each major framework and library from `package.json` with its purpose and a note on why it was chosen, using `specs/*/research.md` for reasons. Do not list every transitive package.
- [ ] T026 [P] [US2] Create `docs/dev/decisions/001-project-scaffold.md`, `docs/dev/decisions/002-edition-selection.md`, and `docs/dev/decisions/003-home-feed-article-detail.md`. Each has front matter (`feature`, `parent: Developer Portal`), a TL;DR, and entries of decision, reason, and applies-to, taken from that feature's `research.md` and `plan.md`. Keep only decisions a new developer would ask "why" about.
- [ ] T027 [US2] Run `npm run verify:docs` and fix all Developer page errors. View `/dev/` locally and check diagrams and navigation.

**Checkpoint**: Both portals work. Content is complete for the first release (FR-010).

---

## Phase 5: User Story 3 - Portals update after /speckit-specify (Priority: P2)

**Goal**: Finishing `/speckit-specify` updates the Product portal with a "planned" feature page, with no manual edit.

**Independent Test**: Run `/speckit-specify` for a small feature. A new `docs/product/features/<NNN-slug>.md` with `status: planned`, a journey diagram, and edge cases appears. A second run updates the same file (spec US3).

- [ ] T028 [US3] Read `.specify/extensions/spectra/extension.yml` and one existing hook skill (`.claude/skills/speckit-spectra-test-plan/SKILL.md`) for the format. Create the local extension files for `docs-portals` in `.specify/extensions/docs-portals/extension.yml` (command `speckit.docs-portals.update`) and register it so the command resolves to the skill `speckit-portal-update`. Follow how `spectra` is registered in `.specify/extensions/.registry`.
- [ ] T029 [US3] Create `.claude/skills/speckit-portal-update/SKILL.md` with front matter (`name`, `description`) and the shared rules from `contracts/hook-contract.md`: input mode (`specify` or `implement`), read `.specify/feature.json`, write only under `docs/`, facts only, TL;DR first, idempotent replace, never delete a page, save a copy of each file before changing it and restore on failure, run `npm run verify:docs` before success, one-line result output, and never change spec, plan, tasks, or app files.
- [ ] T030 [US3] Add the `specify` mode section to `.claude/skills/speckit-portal-update/SKILL.md`: read `spec.md`; create or update `docs/product/features/<feature>.md` as `status: planned` with summary, journey diagram, and edge cases (leave out any section with no source content); keep `status: available` if it is already set; rebuild the table in `docs/product/index.md` from page front matter; touch `docs/dev/` only when the spec changes what developers must know; print `no change needed` when nothing changes.
- [ ] T031 [US3] Edit `.specify/extensions.yml`: add under `hooks.after_specify` an entry for extension `docs-portals`, command `speckit.docs-portals.update`, argument `specify`, `optional: false`, `enabled: true`, with a description. Keep the existing `spectra` hook entries. Check the YAML parses.
- [ ] T032 [US3] Test the `specify` mode on this feature: run the skill with mode `specify` for `004-github-pages-docs`. Expect `docs/product/features/004-github-pages-docs.md` with `status: planned`. Run it again and expect no duplicate and `no change needed`. Break a mermaid block on purpose, run it, and expect a `failed` line and a restored file. Keep the resulting 004 page.

**Checkpoint**: Specify hook works.

---

## Phase 6: User Story 4 - Portals update after /speckit-implement (Priority: P2)

**Goal**: Finishing `/speckit-implement` updates decisions, architecture, dependencies, and design system pages, and marks the feature "available".

**Independent Test**: Run `/speckit-implement` for a feature that adds a design system component and a library. Status becomes `available`, and the component, the library, and a decisions file appear (spec US4).

- [ ] T033 [US4] Add the `implement` mode section to `.claude/skills/speckit-portal-update/SKILL.md`: read `spec.md`, `plan.md`, `research.md`, `data-model.md`, `tasks.md`, and the changed source files; set the feature page to `available` only when `allTasksDone` is true (see `tools/portal/pages.ts`), otherwise leave it `planned`; update `docs/product/design-system.md` for changed design system components; rewrite `docs/dev/decisions/<feature>.md`; update `docs/dev/architecture.md` diagrams, `docs/dev/dependencies.md`, and `docs/dev/patterns.md` only for real changes; rebuild the indexes.
- [ ] T034 [US4] Edit `.specify/extensions.yml`: add under `hooks.after_implement` an entry for `docs-portals` / `speckit.docs-portals.update`, argument `implement`, `optional: false`, `enabled: true`. Order it before the existing `speckit.spectra.create-pr` hook (lower priority number) so the docs are in the PR. Check the YAML parses.
- [ ] T035 [US4] Test the `implement` mode on `003-home-feed-article-detail`: run the skill with mode `implement` and confirm it reproduces the existing 003 pages with no meaningful change. Then run it on a feature with an unfinished `tasks.md` (this one, `004`, before it is done) and confirm the status stays `planned`.

**Checkpoint**: Both hooks work.

---

## Phase 7: User Story 5 - Portals are published and reachable at a stable address (Priority: P3)

**Goal**: One public address shows a landing page that links to both portals, and merges update it automatically.

**Independent Test**: Merge to `main`. Open the site address. Both portals load and are linked from the landing page (spec US5).

- [ ] T036 [US5] Create `docs/index.md`: front matter (`title: Home`, `nav_order: 1`), a TL;DR, and one sentence for each portal's audience with links to `/dev/` and `/product/` (FR-002). Use `{{ site.baseurl }}` in links so they work under the project path.
- [ ] T037 [P] [US5] Create `docs/README-site.md` (excluded from the build in `docs/_config.yml`) that explains: how to preview locally (`cd docs && bundle install && bundle exec jekyll serve`), how the hooks update pages, how to run `npm run verify:docs`, and the one-time Pages setting. Add `README-site.md` to the `exclude` list.
- [ ] T038 [US5] Turn on Pages with the repo settings: source "Deploy from a branch", branch `main`, folder `/docs` (for example `gh api -X POST repos/sunian/infobae-spectra-sandbox/pages -f "source[branch]=main" -f "source[path]=/docs"`). This needs repo admin rights, so ask the user to confirm before you run it. If the user prefers the web UI, give the steps and wait. After the merge to `main`, open the live site and check the navigation and all diagrams (research R3 risk).

**Checkpoint**: All five stories work.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T039 [P] Add a short "Documentation site" section to `docs/PROJECT_GUIDE.md` with the site address and a pointer to `docs/README-site.md`. Keep its TL;DR and front matter valid.
- [ ] T040 Run `npm run verify` and `npm run verify:docs` from the repo root. Both must pass. Check that no file exists under `.github/workflows/` and that `git status` shows no change to `app/` or `src/`.
- [ ] T041 Walk through `specs/004-github-pages-docs/quickstart.md` steps 1 to 6 and record the results. Step 7 happens after the merge. Mark each spec success criterion (SC-001 to SC-008) as met, not yet testable, or failed in `specs/004-github-pages-docs/checklists/requirements.md` notes.

---

## Dependencies & Execution Order

- Phase 1 has no dependencies. T002, T003, and T004 can run in parallel after T001.
- Phase 2 needs Phase 1. T005 to T007 are parallel. T008 to T009 and T010 to T011 are test-then-code pairs and can run in parallel with each other. T012 closes the phase.
- US1 and US2 (Phases 3 and 4) both need Phase 2 and are independent of each other. They can run in parallel.
- US3 (Phase 5) needs Phase 2 for the validator. It is best done after US1 so the Product index exists.
- US4 (Phase 6) needs US3, because both edit `.claude/skills/speckit-portal-update/SKILL.md`, and needs US2 for the Developer pages.
- US5 (Phase 7) needs US1 and US2 for the link targets. T038 needs all content merged.
- Polish needs all stories.

## Parallel Opportunities

- Setup: T002, T003, T004.
- Foundational: T005, T006, T007; and the two test/code pairs (T008-T009, T010-T011).
- US1: T015, T016, T017 (after T014).
- US2: T023, T024, T025, T026 (after T022); T021 with T022.
- US1 and US2 as whole phases.

## Implementation Strategy

1. **MVP**: Phases 1, 2, and 3 (Product portal) give a readable site. Add Phase 4 for the Developer portal.
2. **Automation**: Phases 5 and 6 add the two hooks. They are the main value after the content exists.
3. **Go live**: Phase 7 turns on Pages. Merge to `main`, then check the live site.
4. Stop after each checkpoint and run `npm run verify:docs`.
