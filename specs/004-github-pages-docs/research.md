# Research: GitHub Pages Documentation Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Six decisions that fix the site tool, page layout, hook design, validation, and deploy (revised: no custom GitHub Action).
> - **Why:** The spec leaves these open and the plan needs them settled.
> - **Scope / Approach / Order:** Jekyll in `docs/` on built-in Pages, per-feature files, one skill for two hooks, a Node validator, no workflow.
> - **Biggest risk or open question:** Mermaid parsing in Node (R3) and no build check besides the Pages build (R5).
> - **Check this:** R1 (tool), R4 (automatic hooks), R5 (built-in deploy from `main` `/docs`).

## R1. Site tool

- **Decision**: Jekyll, built by GitHub Pages itself, with the `just-the-docs` theme loaded through `remote_theme`. Mermaid is loaded by a theme include with a pinned version.
- **Rationale**: The user wants automatic deploy with no custom action. Only a Jekyll site builds with no workflow. `just-the-docs` gives left navigation, search, and mobile layout, and documents mermaid support. Two portals are two top-level nav sections (`/dev/`, `/product/`).
- **Alternatives**: Docusaurus, MkDocs, VitePress (all need a build, so they need a workflow or committed build output; rejected by the "no custom actions" requirement). Plain Markdown with no theme (no navigation, mermaid does not render on the Pages site).

## R2. Where content lives and how hooks stay idempotent

- **Decision**: One Markdown file per feature in each portal (`product/features/<NNN-slug>.md`, `dev/decisions/<NNN-slug>.md`). Front matter carries `feature` and `status`, plus `parent`/`nav_order` for the theme. A hook rewrites the file for its feature. Shared pages (`architecture.md`, `dependencies.md`, `design-system.md`, `patterns.md`) are edited in place. Index pages are rebuilt from front matter.
- **Rationale**: A per-feature file makes a second run replace, not duplicate (FR-014). It avoids merge fights between features.
- **Alternatives**: One big decisions log (grows, duplicates easily); generated-only pages (too rigid for human-readable prose).

## R3. Validation (FR-018)

- **Decision**: `tools/portal/validate.ts` checks front matter, the TL;DR block, repo links, internal links, and mermaid syntax with `mermaid.parse()` under `jsdom`. It runs locally through `npm run verify:docs` and is called by the skill before it reports success.
- **Rationale**: Jekyll does not check links or diagrams. A Node check catches syntax errors without a browser and without CI.
- **Alternatives**: `@mermaid-js/mermaid-cli` (real render, needs headless Chrome; slow). A CI check (needs a workflow; rejected).
- **Risk**: `mermaid.parse()` may miss render-time errors. The mitigation is to keep diagrams simple (flowchart, sequence, state) and view the published site once after the first deploy.

## R4. Hook design

- **Decision**: One local extension, `docs-portals`, with two commands: `update-specify` and `update-implement`. Each maps to a thin skill. Both skills follow one shared procedure file with a section for each mode. Register two hooks in `.specify/extensions.yml`, both `optional: false` (automatic). A failure is a warning. The procedure never edits spec, plan, tasks, or app code.
- **Rationale**: The issue says "auto-update". The hook registry has no argument field, so the command name must carry the mode. Two commands plus one shared file avoid two copies of the rules. Non-blocking failure satisfies FR-016.
- **Alternatives**: One command with a mode argument (the registry cannot pass it); the mode inside the hook `prompt` text (fragile for an automatic hook); optional hooks (a reviewer can skip them, so docs drift); a shell script (cannot write good prose).

## R5. Deploy

- **Decision**: In repo settings, Pages source is "Deploy from a branch": `main`, folder `/docs`. GitHub builds and publishes on every push to `main`. No workflow file. The repo is now public, so the free Pages plan applies.
- **Rationale**: Meets "deployed automatically, no custom actions". The hooks write to the branch (FR-013) and the site updates on merge (SC-007).
- **Risk**: A Jekyll build error is seen only after the merge (GitHub shows it in the Pages build status). The validator and a plain-Markdown rule (no unsupported plugins) reduce this. Existing `docs/API_SPIKE.md` and `docs/PROJECT_GUIDE.md` become public. A task must review both files against FR-021 before the first deploy.
- **One-time step**: Turning on Pages is a repo setting, not a file. It is a manual task listed in `quickstart.md`.

## R6. First-release content

- **Decision**: Hand-seed from existing material: `docs/PROJECT_GUIDE.md`, `docs/API_SPIKE.md`, `vision.md`, specs 001 to 003, `src/design-system/tokens.ts`, and `package.json`. Run the skill in `implement` mode for specs 001 to 003 to check it reproduces the seed.
- **Rationale**: Meets FR-010. It tests the skill on real inputs.
- **Alternatives**: Start empty and wait for the next feature (fails FR-010).
