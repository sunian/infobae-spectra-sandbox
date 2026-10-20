# Data Model: GitHub Pages Documentation Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The shapes of the portal pages and the hook run record, stored as Markdown front matter.
> - **Why:** Fixed shapes let the hook update pages in place and let the validator check them.
> - **Scope / Approach / Order:** Page, Feature Page, Decision Entry, Diagram, Hook Update.
> - **Biggest risk or open question:** The status flip from Planned to Available depends on all tasks being done.
> - **Check this:** The status rules in Feature Page.

## Portal Page (all pages)

| Field | Type | Rule |
|---|---|---|
| `title` | string | Required. |
| `purpose` | string | Required. One sentence. Shown under the title. |
| `portal` | `'dev' \| 'product'` | Required. |
| `nav_order`, `parent` | number, string | Theme navigation. `parent` is the portal title for child pages. |
| TL;DR block | Markdown | First content after the title (Principle VII). Checked by the validator. |

## Feature Page (Product, `product/features/<NNN-slug>.md`)

| Field | Type | Rule |
|---|---|---|
| `feature` | string | Spec folder name, for example `003-home-feed-article-detail`. Unique. |
| `status` | `'planned' \| 'available'` | `planned` after specify. `available` after implement when every task in `tasks.md` is done. |
| `summary` | string | One or two sentences from the spec. |
| Sections | Markdown | Summary, User journey (mermaid), Error and edge cases. Sections with no source content are left out. |
| `updatedBy` | `'specify' \| 'implement'` | The last hook mode that wrote the page. |

Transitions: `planned` to `available` only. The hooks never delete a page and never go back to `planned`.

## Decision Entry (Developer, `dev/decisions/<NNN-slug>.md`)

| Field | Type | Rule |
|---|---|---|
| `feature` | string | The feature that caused the decisions. |
| Entries | list | Each entry has `decision`, `reason`, `appliesTo` (folders or areas). From plan and research. |

A file is rewritten as a whole on each implement run for its feature.

## Diagram

A fenced `mermaid` block inside a page. Valid if `mermaid.parse()` accepts it. One diagram per
concern: architecture (dev), user journey (product).

## Hook Update (run record, printed to the user, not stored)

| Field | Type | Rule |
|---|---|---|
| `mode` | `'specify' \| 'implement'` | The trigger. |
| `feature` | string | Feature folder. |
| `pagesChanged` | string[] | Paths written. |
| `result` | `'updated' \| 'no-change' \| 'failed'` | `failed` includes a reason. |
