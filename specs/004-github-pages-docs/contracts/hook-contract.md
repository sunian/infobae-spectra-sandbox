# Contract: Portal Update Hooks

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The rules for the two hooks and the skill they run.
> - **Why:** The hooks must update the right pages, stay idempotent, and never break the main command.
> - **Scope / Approach / Order:** Registration, inputs, writes, outputs, failure rules.
> - **Biggest risk or open question:** The skill writes prose, so only the validator guards quality.
> - **Check this:** Hooks are mandatory (automatic) and non-blocking.

## Registration (`.specify/extensions.yml`)

| Hook key | Extension | Command | Optional |
|---|---|---|---|
| `after_specify` | `docs-portals` | `speckit.docs-portals.update-specify` | `false` |
| `after_implement` | `docs-portals` | `speckit.docs-portals.update-implement` | `false` |

Each command maps to a thin skill (`speckit-docs-portals-update-specify`, `speckit-docs-portals-update-implement`). Both skills follow one shared file, `.specify/extensions/docs-portals/procedure.md`. The hook registry has no argument field, so the mode is set by the command, not by an argument.

## Inputs

- Mode: `specify` or `implement`.
- Feature folder from `.specify/feature.json`.
- Read: `spec.md` (both modes); `plan.md`, `research.md`, `data-model.md`, `tasks.md`, and changed source files (implement mode only).

## Writes (only under `docs/`)

| Mode | Product portal | Developer portal |
|---|---|---|
| `specify` | Create or update `features/<feature>.md` as `planned`: summary, journey diagram, edge cases. Rebuild the feature index. | Only if the spec changes what developers must know. |
| `implement` | Set the feature page to `available` if all tasks are done. Update `design-system.md` for changed design system components. | Rewrite `decisions/<feature>.md`. Update `architecture.md` diagrams and `dependencies.md` if they changed. Update `patterns.md` if a new pattern appeared. |

Rules: write only facts from the feature's artifacts or code (FR-017). Put a TL;DR first in every
page written (FR-020). Never touch files outside `docs/`. Never delete a page.

## Required steps before success

1. Run `npm run verify:docs` from the repo root (it runs the validator over `docs/`).
2. If it fails, fix the page once and run it again. If it still fails, report `failed` with the validator output.

## Output (printed to the user)

One line: `Portal update (<mode>) for <feature>: updated | no change needed | failed - <reason>`, then the list of changed paths.

## Failure rules (FR-016)

- On any error the skill reports `failed` and stops. It does not touch spec, plan, tasks, or app files.
- On `failed`, the skill restores any `docs/` file it changed back to the state before the run (by restoring the saved copy of each file), so no half-update remains.
- The triggering command's own result stands.
