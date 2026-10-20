# Contract: Portal Content and Site Structure

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The required pages, routes, and checks for the two portals.
> - **Why:** It makes the content testable against FR-001 to FR-010.
> - **Scope / Approach / Order:** Routes, required pages, page rules, validator checks.
> - **Biggest risk or open question:** "High level" is a judgment, so only length and structure are checked.
> - **Check this:** The 400-word guide limit per page section.

## Routes

| Route | Content |
|---|---|
| `/` | Landing page. Links to both portals with one sentence each (FR-002). |
| `/dev/` | Developer portal. Architecture overview with a diagram. |
| `/dev/architecture`, `/dev/decisions/*`, `/dev/patterns`, `/dev/dependencies` | Required Developer pages (FR-003). |
| `/product/` | Product portal. Feature list with status badges. |
| `/product/features/*`, `/product/design-system` | Required Product pages (FR-004). |

## Page rules

- A TL;DR block comes first (Principle VII).
- Each Developer page links to repo folders or files (FR-007). Links use the repo URL on `main`.
- Product pages use plain words and no code (FR-006, FR-008).
- A page section stays near 400 words or fewer. The validator warns above that. It is a guide, not a gate.
- Pages use only features that the built-in Pages build supports (no custom plugins).
- Diagrams are fenced `mermaid` blocks only. No image files for diagrams (FR-005).
- Pages hold no secrets, keys, or private URLs (FR-021). The validator rejects strings that look like keys.

## Validator checks (`npm run verify:docs`)

| Check | Result on failure |
|---|---|
| Front matter has `title`, `purpose`, `portal`, `nav_order`; feature pages also `feature`, `status`, `parent` | Error |
| TL;DR block is first content and has 5 bullets or fewer | Error |
| Every mermaid block parses | Error |
| Repo links point to paths that exist | Error |
| Feature page `status` is `planned` or `available` | Error |
| Secret-like strings | Error |
| Section length over 400 words | Warning |
