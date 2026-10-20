# Documentation Portals Update Procedure

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The shared rules and the two mode sections that the `docs-portals` hooks follow to update the pages in `docs/`.
> - **Why:** The Developer and Product portals stay current after every `/speckit-specify` and `/speckit-implement`, with no manual doc edit.
> - **Scope / Approach / Order:** Shared rules, then Specify mode, then Implement mode, then the failure rules.
> - **Biggest risk or open question:** The agent writes the prose, so only the validator guards quality.
> - **Check this:** Hooks write only under `docs/`, never publish, and never change the result of the command that started them.

Contract: `specs/004-github-pages-docs/contracts/hook-contract.md` and
`specs/004-github-pages-docs/contracts/portal-content-contract.md`. Page shapes:
`specs/004-github-pages-docs/data-model.md`.

## Shared rules

1. **Find the feature.** Read `.specify/feature.json`. `feature_directory` is the feature folder, for
   example `specs/005-saved-articles`. The folder name is the `FEATURE` key.
2. **Write only under `docs/`.** Never edit spec.md, plan.md, tasks.md, app code, or `package.json`.
   Never run `git commit`, `git push`, or any publish step. The live site updates when the branch
   merges to `main`.
3. **Facts only.** Use only the spec, plan, research, data model, tasks, contracts, and the code of the
   feature. Do not invent behavior. If a source part does not exist (for example, no user flow), leave
   that section out.
4. **Idempotent.** One file per feature in each portal. Find the file by its `feature:` front matter
   or its path. If it exists, update it in place. Never create a second page for the same feature.
   Never delete a page. Replace outdated statements. Do not stack contradictory ones.
5. **No TL;DR.** Do not put a TL;DR block on any page in `docs/`. Start each page with the
   `# Title` line and go straight to the content. The TL;DR is only for the Markdown files that
   SpecKit writes in the dev lifecycle (constitution principle VII).
6. **Plain words on the Product portal.** No code, file names, or jargon. Write what the reader sees
   and does. Keep each section near 400 words or fewer.
7. **Developer pages link to code.** Use `https://github.com/sunian/infobae-spectra-sandbox/tree/main/<path>`
   for folders and files that exist. Link inside the site with
   `{{ site.baseurl }}{% link path/to/page.md %}`.
8. **Diagrams** are fenced `mermaid` blocks. Use simple types: flowchart, sequence, state.
9. **No secrets or private URLs** in any page.
10. **Snapshot first.** Before the first write, remember the current content of every file you will
    change, and the list of files you will create. This is how you restore on failure.

## Page shapes (summary)

Front matter on every portal page: `title`, `purpose` (one sentence), `portal` (`dev` or `product`),
`nav_order`. Product feature pages also: `feature`, `status` (`planned` or `available`),
`parent: Product Portal`. Developer decision pages also: `feature`, `parent: Developer Portal`.
Set `nav_order` of a feature page to the feature number (for example `5`). Look at
`docs/product/features/003-home-feed-article-detail.md` and
`docs/dev/decisions/003-home-feed-article-detail.md` as models.

## Specify mode

Run after `/speckit-specify`. Read `spec.md` (and `checklists/` if useful).

1. Create or update `docs/product/features/<FEATURE>.md`:
   - `status: planned`. If the page already has `status: available`, keep `available`.
   - Sections: **Summary** (what the feature does and who it is for), **User journey** (a mermaid
     diagram of the main flow from the user stories), **Error and edge cases** (a table
     `Situation | What the reader sees`, from the spec edge cases and error acceptance scenarios).
     Leave out a section with no source content.
   - Say near the top that the feature is **Planned** and not built yet.
2. Update the feature table in `docs/product/index.md`: one row per feature page, sorted by feature
   number, with the title link, the status ("Planned" or "Available"), and a one-sentence description.
3. Update `docs/dev/` only if the spec changes what developers must know (for example, a new
   architecture rule or a new constraint). Otherwise leave it alone.
4. Go to "Validate and report".

## Implement mode

Run after `/speckit-implement`. Read `spec.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/`, `tasks.md`, and the source files the feature changed (use `git diff main...HEAD
--stat` and the paths in `tasks.md`).

1. **Status.** Update `docs/product/features/<FEATURE>.md` (create it first if it does not exist,
   using the Specify mode steps). Set `status: available` only when `tasks.md` has at least one task
   and every task line is checked (`[x]`). Otherwise keep `planned`. Never move `available` back to
   `planned`. Refresh the summary, journey, and edge cases if the built behavior differs from the spec.
2. **Decisions.** Rewrite `docs/dev/decisions/<FEATURE>.md` as a whole: a table
   `Decision | Reason | Applies to`, from `research.md` and `plan.md`. Keep only decisions a future
   developer would ask "why" about. Link "Applies to" to real paths.
3. **Architecture.** If the feature changed the parts of the app or the data flow, update the
   diagrams in `docs/dev/architecture.md`. Leave them alone otherwise.
4. **Dependencies.** If `package.json` gained or lost a package that matters, update the tables in
   `docs/dev/dependencies.md` with the purpose of each. Skip transitive packages.
5. **Patterns.** If the feature set a new pattern or rule (for example, a new folder for a new kind
   of code), update `docs/dev/patterns.md`.
6. **Design system.** If the feature added or changed design system tokens or components in
   `src/design-system/`, update `docs/product/design-system.md` (colors, text styles, and the list of
   building blocks, in plain words).
7. Refresh the table in `docs/product/index.md`.
8. Go to "Validate and report".

## Validate and report

1. If you changed no file, print `Portal update (<mode>) for <FEATURE>: no change needed` and stop.
2. Run `npm run verify:docs` from the repo root. If it reports errors, fix the pages once, and run it
   again.
3. If `bundle` is installed, run `cd docs && bundle exec jekyll build`. If it fails because of the
   pages you wrote, fix once. If it fails because of the network or tools, say so and go on.
4. Print one line: `Portal update (<mode>) for <FEATURE>: updated`, then the list of changed paths.

## Failure rules

- If any step fails and you cannot fix it, restore every changed file from your snapshot, delete the
  files you created, and print
  `Portal update (<mode>) for <FEATURE>: failed - <reason>`. Include the validator output.
- A failure here never changes the spec, plan, tasks, or the app. The result of the command that
  started you stands. Do not ask the user to re-run it.
- Do not block on questions. If a fact is missing, leave it out.
