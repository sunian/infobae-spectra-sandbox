# Quickstart: Validate the Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Steps to prove the site, the validator, and both hooks work end to end.
> - **Why:** It checks the spec's success criteria with real runs.
> - **Scope / Approach / Order:** View locally, validate, run each hook, check deploy.
> - **Biggest risk or open question:** Steps 4, 5, and 7 need a real feature run and a merge to `main`.
> - **Check this:** The "no manual doc edit" results in steps 4 and 5.

## Prerequisites

- Node.js 20+ and npm.
- Ruby and Bundler (only for the optional local preview in step 1).
- Repo admin rights (for step 0).

## 0. One-time: turn on Pages

Repo Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/docs`. No workflow is needed.

## 1. View locally (US5, scenario 3)

```sh
cd docs && bundle exec jekyll serve
```

The `docs/` folder has a `Gemfile` for this (`github-pages` gem). Expect the landing page with links to `/dev/` and `/product/`. Open both on a narrow window. No sideways scroll (FR-009).

## 2. Validate (FR-018, SC-005)

```sh
npm run verify:docs
```

Expect no errors. Every mermaid block parses. No broken link.

## 3. Check the first-release content (FR-010, US1, US2)

Open `/product/`. Expect features for scaffold, edition selection, and Home feed with Article Detail, each with a journey diagram and edge cases. Open `/dev/`. Expect architecture diagram, decisions, patterns, and dependencies.

## 4. Hook after specify (US3, SC-003)

Run `/speckit-specify` with a small new feature. When it ends, expect a new `docs/product/features/<NNN-slug>.md` with `status: planned`, a journey diagram, and edge cases. Run `/speckit-specify` again for the same feature. Expect the same file updated and no duplicate.

## 5. Hook after implement (US4, SC-004)

Run `/speckit-implement` for a feature that adds a design system component and a library. Expect: feature `status: available`, the component on `design-system.md`, the library on `dependencies.md`, and a new `docs/dev/decisions/<NNN-slug>.md`.

## 6. Failure case (FR-016)

Break a mermaid block on purpose, then run a hook. Expect a `failed` line with the reason, no half-written page, and the spec or implementation result unchanged.

## 7. Deploy (US5, SC-007)

Merge to `main`. Expect the GitHub Pages build (Settings, Pages, or the Deployments list) to succeed and the live site to show the new content within 10 minutes.
