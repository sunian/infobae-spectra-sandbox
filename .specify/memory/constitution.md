<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0 (MINOR: new principle added)
Modified principles: none renamed. Workflow item 3 now says "Principles I to VII".
Added sections: VII. Every Document Opens with a Verifiable TL;DR
Removed sections: none
Follow-up TODOs: none. Templates carry the TL;DR block through .specify/templates/overrides/.
-->

# Infobae Constitution

## Core Principles

### I. Design System First (NON-NEGOTIABLE)
The app MUST have one design system module. It holds fonts, colors, styles/themes, and reusable
views/components. Every screen MUST use components from this module. If a screen needs a view that
the design system does not have, the developer MUST first add a new component to the design system.
Then the developer MUST build the screen with that component. One-off views are allowed only in
truly unique cases. Each one-off view MUST have a written justification in the code review.

Rationale: One design system keeps the look and feel coherent for current and future features.

### II. Localization of All User-Facing Strings
All user-facing strings MUST be in a separate JSON file. Components and screens MUST NOT hard-code
user-facing text. This keeps translation easy.

### III. Unit-Tested Business Logic
All business logic MUST have unit tests. This includes data mapping, edition handling, preference
persistence, and API client logic. All unit tests MUST pass before a feature branch is pushed.

### IV. Screenshot-Tested Screens
Every screen MUST have regression tests that use Maestro Visual Testing (screenshot testing). All
Maestro tests MUST pass before a PR is merged. A new or changed screen MUST update its Maestro
tests in the same PR.

### V. Static Analysis and Code Style
A linter MUST be installed and configured. All committed code MUST pass the linter with no errors.
The code MUST be TypeScript. The code MUST NOT use untyped escape hatches (such as `any`) unless a
comment explains why.

### VI. Edition-Aware, Public-API Content
Infobae has one edition for each country or region (for example World, US, Argentina, Colombia,
Spain). The user MUST select a preferred edition at first launch. The app MUST save this choice in
local user preferences. The user MUST be able to change it from the Menu. All feeds MUST show
content for the selected edition. For now, the app MUST get content only from the public APIs that
the infobae.com website uses. The app MUST NOT depend on private or authenticated back ends until
this principle is amended.

### VII. Every Document Opens with a Verifiable TL;DR
Every Markdown deliverable that an agent writes MUST open with a TL;DR block. The block is the
first content after the title and any front matter. It has five bullets or fewer. Each bullet is
one plain sentence. It states what the document decides or builds, why, the scope or approach, and
the biggest risk or open question. It ends with a "Check this" line that names the one to three
decisions a human reviewer must confirm.

Every statement in the TL;DR MUST come from the body of the same document. It MUST NOT add facts.
When an agent updates a document, it MUST update the TL;DR in the same write. The body stays the
source of truth for the next phase. A document under about 30 lines MAY use a one-sentence TL;DR.
This applies to spec.md, plan.md, tasks.md, research.md, data-model.md, checklists, and every
Spectra document.

Rationale: A reviewer can confirm the key decisions fast, and the body stays the source of truth.

## Technology Stack & Constraints

- **App**: Infobae, a mobile news reader for content from Infobae.
- **Framework**: React Native with TypeScript and Expo.
- **Platforms**: Android and iOS. A feature MUST work on both.
- **Content types**: Text articles, videos, live streams, and audio.
- **Navigation**: Bottom tabs: Home, My Infobae, Media, Chat, Menu.
- **Home**: A vertical scrolling feed of articles from the selected edition.
- **Article detail**: Opens from any news feed. It MUST show the article header, text, and image
  embeds.
- **Testing tools**: A unit test framework for business logic. Maestro for screenshot tests.
- **Linter**: A standard linter for TypeScript and React Native.

## Development Workflow & Quality Gates

1. Before a push of a feature branch: the linter and all unit tests MUST pass.
2. Before a PR merge: all Maestro screenshot tests MUST pass.
3. Each PR MUST show that it follows Principles I to VII. The reviewer MUST check this.
4. A PR that adds UI MUST show that it uses design system components.
5. A PR that adds user-facing text MUST add the strings to the localization JSON file.

## Governance

This constitution supersedes all other practices for this project. A change to this document
requires a written proposal, review and approval by the project owner, and a note on what existing
code or specs need to change.

Versioning follows semantic versioning:
- MAJOR: a principle is removed or redefined in a way that is not backward compatible.
- MINOR: a new principle or section is added, or guidance is expanded in a material way.
- PATCH: wording fixes and clarifications that do not change meaning.

Compliance review: each PR review MUST check compliance with this constitution. Any
deviation MUST be justified in writing in the PR. `vision.md` is the source document for product
intent.

**Version**: 1.1.0 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-19
