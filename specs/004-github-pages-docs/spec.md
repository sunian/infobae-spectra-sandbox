# Feature Specification: GitHub Pages Documentation Portals

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** The repo gets two public doc sites (a Developer portal and a Product portal) on GitHub Pages, kept current by SpecKit hooks.
> - **Why:** New developers and non-technical team members need a quick, human-readable way to understand the app.
> - **Scope / Approach / Order:** Build the two portals first, then the hook that updates them after `/speckit-specify`, then the hook that updates them after `/speckit-implement`.
> - **Biggest risk or open question:** The docs can drift from the app if a hook fails or if planned features are shown as shipped.
> - **Check this:** Features that are specified but not yet built are labelled "Planned" in the Product portal (FR-011). Docs update on the feature branch and go live when it merges (FR-013).

**Feature Branch**: `004-github-pages-docs`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "https://github.com/sunian/infobae-spectra-sandbox/issues/4 — Add Github Pages. There should be a Developer facing portal and a Product facing portal. Dev: app architecture including mermaid diagrams, important implementation decisions made and why, patterns and best practices, frameworks/libraries/dependencies. Product: user journeys (mermaid diagrams), error handling and edge cases, design system. These docs are hosted in the mobile app repo as GitHub Pages. A SpecKit hook auto-updates the pages after every /speckit-specify (new specifications, user flows, edge cases) and after every /speckit-implement (important implementation decisions, architecture changes, design system updates). Pages are high level and human readable. The Dev portal helps new developers navigate the codebase quickly and does not document every detail. The Product portal helps all team members, even non-technical, understand how to navigate the app and use the major features."

## User Scenarios & Testing *(mandatory)*

The Infobae app repo has specs, plans, code, and a design system. Today a new team member must read
many files to learn how the app works. This feature adds two documentation sites. The sites are
short, visual, and easy to read. Two SpecKit hooks keep the sites current without manual work.

There are two audiences. A **developer** writes and reviews code. A **product reader** is any team
member, including designers, QA, and managers, who does not need to read code.

### User Story 1 - Product reader learns the app from the Product portal (Priority: P1)

A product reader opens the Product portal in a web browser. They see the major features of the app.
For each feature they see a user journey diagram, the error and edge cases the app handles, and the
design system (colors, fonts, and reusable components). They understand how to use the app and what
it does when something goes wrong. They do not need to read any code or spec file.

**Why this priority**: The whole team, not only developers, needs a shared picture of the product.
This is the widest audience and the quickest win.

**Independent Test**: Give the Product portal URL to a team member who is not a developer. Ask them
to name the major features, describe the path a reader takes to pick an edition and read an article,
and say what the app shows when the feed cannot load. They answer correctly using only the portal.

**Acceptance Scenarios**:

1. **Given** the Product portal is published, **When** a reader opens its home page, **Then** they
   see a list of the major app features with a one-sentence description of each.
2. **Given** a feature has a documented user flow, **When** the reader opens that feature page,
   **Then** they see a user journey diagram and the diagram renders without errors.
3. **Given** a feature has error or edge cases, **When** the reader opens that feature page,
   **Then** they see each case and what the app shows or does in that case.
4. **Given** the reader opens the design system page, **Then** they see the colors, fonts, and
   reusable components that the app uses.
5. **Given** the reader opens the portal on a phone, **When** they view any page, **Then** the page
   is readable without sideways scrolling.

---

### User Story 2 - New developer learns the codebase from the Developer portal (Priority: P1)

A new developer opens the Developer portal. They see the app architecture as diagrams. They read the
important implementation decisions and the reason for each one. They see the patterns and best
practices the team follows. They see the frameworks, libraries, and dependencies and why each is
used. They know where to find things in the codebase and where to put new code. They can start work
the same day. The portal is a guide, not a full reference. It does not describe every file or
function.

**Why this priority**: Fast onboarding is the main goal of the Developer portal. It has the same
priority as the Product portal because the two audiences are independent.

**Independent Test**: Give the Developer portal URL to a developer who has not seen the repo. Ask
them to say how the app is structured, where a new screen and its strings belong, and why the main
libraries were chosen. They answer correctly using only the portal.

**Acceptance Scenarios**:

1. **Given** the Developer portal is published, **When** a developer opens its home page, **Then**
   they see the architecture overview with at least one diagram of the major parts of the app and
   how they connect.
2. **Given** the developer opens the decisions page, **Then** each decision lists what was decided,
   why, and where it applies.
3. **Given** the developer opens the patterns page, **Then** they see the team's patterns and best
   practices, including where new screens, strings, and design system components go.
4. **Given** the developer opens the dependencies page, **Then** they see each major framework and
   library with its purpose.
5. **Given** any Developer portal page, **Then** it links to the relevant folders or files in the
   repo so the developer can go from the guide to the code.

---

### User Story 3 - Portals update after /speckit-specify (Priority: P2)

A team member runs `/speckit-specify` and the command finishes. A hook then updates the portals
without the team member doing anything extra. The Product portal gets the new feature: its
specification summary, user journey diagrams, and error and edge cases. The feature is labelled
"Planned" because it is not built yet. The Developer portal changes only when the new spec affects
what developers must know.

**Why this priority**: Without the hook, the portals become stale after the first new feature. This
story depends on the portals from stories 1 and 2.

**Independent Test**: Run `/speckit-specify` for a small new feature. When the command finishes,
the Product portal source has a new "Planned" feature page with a user journey diagram and the edge
cases from the new spec. No manual doc edit is needed.

**Acceptance Scenarios**:

1. **Given** the portals exist, **When** `/speckit-specify` completes for a new feature, **Then**
   the Product portal gains a page or section for that feature with its summary, user journey
   diagram, and edge cases.
2. **Given** the new feature is not implemented, **When** the reader views it, **Then** it is
   clearly labelled "Planned".
3. **Given** `/speckit-specify` runs again for an existing feature, **When** it completes,
   **Then** the existing page is updated and no duplicate page is created.
4. **Given** the hook cannot update the portals, **When** `/speckit-specify` completes, **Then**
   the specify result is not lost and the user sees a clear message that the portal update failed
   and why.

---

### User Story 4 - Portals update after /speckit-implement (Priority: P2)

A team member runs `/speckit-implement` and the command finishes. A hook then updates the portals.
The Product portal changes the feature label from "Planned" to "Available" and adds any design
system changes. The Developer portal records important implementation decisions made during the
work, changes to the architecture diagrams, and new patterns, libraries, or dependencies.

**Why this priority**: This keeps the Developer portal and the design system pages true to the
built app. It depends on stories 1, 2, and 3.

**Independent Test**: Run `/speckit-implement` for a feature that adds a new design system
component and a new library. When the command finishes, the Product design system page lists the
component, the Developer dependencies page lists the library with its purpose, and the feature is
labelled "Available".

**Acceptance Scenarios**:

1. **Given** a feature was specified, **When** `/speckit-implement` completes for it, **Then** its
   Product portal label changes from "Planned" to "Available".
2. **Given** the implementation added or changed a design system component, **When** the hook
   runs, **Then** the Product design system page reflects the change.
3. **Given** the implementation made an important decision, **When** the hook runs, **Then** the
   Developer decisions page gains an entry with the decision and the reason.
4. **Given** the implementation changed the architecture or added a dependency, **When** the hook
   runs, **Then** the architecture diagrams and the dependencies page match the new state.
5. **Given** the implementation made no change that matters to a portal, **When** the hook runs,
   **Then** no page is changed and the user sees that no update was needed.

---

### User Story 5 - Portals are published and reachable at a stable address (Priority: P3)

After the first portal content merges to the main branch, a team member opens one stable web address
and finds a landing page that links to both portals. Later merges update the live site
automatically. A team member can also view the sites on their own machine before merging.

**Why this priority**: Hosting is needed for the portals to be useful, but the content and hooks are
the larger part of the value.

**Independent Test**: Merge the feature to main. Open the site address. Both portals load and are
linked from the landing page.

**Acceptance Scenarios**:

1. **Given** the portal content is merged to main, **When** a person opens the site address,
   **Then** a landing page shows and links to the Developer portal and the Product portal.
2. **Given** a later merge changes portal content, **When** the merge completes, **Then** the live
   site shows the new content without a manual publish step.
3. **Given** a team member has the repo on their machine, **When** they follow the documented
   steps, **Then** they can view both portals locally.

---

### Edge Cases

- A spec has no user flow or no edge cases yet. The hook adds the feature page with only the parts
  that exist and does not invent content.
- A feature is specified, never implemented, and then dropped. The page stays "Planned" until a
  person removes it by hand. The hooks never delete a feature page on their own.
- A mermaid diagram has a syntax error. The page must still load. The hook must check diagrams
  before it finishes and must report any diagram it cannot render.
- The hook runs twice for the same feature. The pages are updated in place. No duplicate page or
  duplicate entry appears.
- A hook fails midway. The portal source is not left half-updated. The user sees the failure.
- A feature changes the same area as an earlier feature. The new content replaces outdated content
  and does not stack contradictory statements.
- The docs refer to a file that was moved or renamed. The repo links must stay valid or the hook
  must report the broken link.
- A reader opens a page that is long. A table of contents or clear headings help them find a
  section.
- `/speckit-specify` or `/speckit-implement` runs on a branch that is not main. The portals update
  on that branch and go live only after the merge.

## Requirements *(mandatory)*

### Functional Requirements

**Portals**

- **FR-001**: The repository MUST contain a Developer portal and a Product portal. Both MUST be
  served from one site hosted with GitHub Pages in the mobile app repository.
- **FR-002**: The site MUST have a landing page that links to both portals and states in one
  sentence who each portal is for.
- **FR-003**: The Developer portal MUST include: (a) app architecture with diagrams, (b) important
  implementation decisions with the reason for each, (c) patterns and best practices, and (d)
  frameworks, libraries, and dependencies with the purpose of each.
- **FR-004**: The Product portal MUST include: (a) user journey diagrams for the major features, (b)
  error handling and edge cases for each feature, and (c) the design system.
- **FR-005**: All diagrams MUST be written as diagram text that the site renders into a picture.
  The diagrams MUST be reviewable as text in the repository.
- **FR-006**: Portal pages MUST be high level and human readable. The Developer portal MUST help a
  new developer find their way in the codebase and MUST NOT try to document every file, function,
  or detail. The Product portal MUST be understandable by a non-technical reader.
- **FR-007**: The Developer portal MUST link to the matching folders or files in the repository.
- **FR-008**: The Product portal MUST describe the design system using what a reader can see:
  colors, fonts, and reusable components. It MUST NOT need the reader to read code.
- **FR-009**: Pages MUST be readable on a phone screen and on a desktop screen.
- **FR-010**: The first release of the portals MUST cover the features that exist at that time: the
  project scaffold, edition selection, and the Home feed with Article Detail.

**Hooks**

- **FR-011**: A hook MUST run after `/speckit-specify` completes. It MUST update the Product portal
  with the new or changed feature: a summary, user journey diagrams, and error and edge cases from
  the spec. A feature that is not yet built MUST be labelled "Planned". The hook MUST update the
  Developer portal only when the spec changes what developers must know.
- **FR-012**: A hook MUST run after `/speckit-implement` completes. It MUST update the Developer
  portal with important implementation decisions and the reason for each, architecture changes, and
  changes to patterns, libraries, or dependencies. It MUST update the Product portal with design
  system changes and MUST change the feature label from "Planned" to "Available".
- **FR-013**: Hooks MUST write to the portal source on the current branch. They MUST NOT publish
  the live site directly. The live site MUST update when the branch merges to main.
- **FR-014**: Hooks MUST be idempotent. Running a hook again for the same feature MUST update the
  existing content and MUST NOT create duplicates.
- **FR-015**: Hooks MUST be registered through the SpecKit extension hook mechanism that the
  project already uses, so they run in the same way as other after-command hooks.
- **FR-016**: Hooks MUST NOT change the result of the command that triggered them. A hook failure
  MUST NOT undo the spec or the implementation. The user MUST see a clear message with the reason.
- **FR-017**: Hooks MUST write only content that comes from the spec, plan, tasks, or code of the
  feature. They MUST NOT invent facts.
- **FR-018**: Before it finishes, a hook MUST check that the portals build and that all diagrams
  render. It MUST report any page or diagram that fails.
- **FR-019**: When a hook makes no change, it MUST tell the user that no update was needed.

**Project rules**

- **FR-020**: The portals MUST follow the constitution. In particular, every Markdown deliverable
  the hooks write or update MUST open with a TL;DR that the document body supports (Principle VII).
- **FR-021**: The published portals MUST contain only public information. They MUST NOT contain
  secrets, keys, or private URLs.

### Key Entities *(include if feature involves data)*

- **Portal**: One documentation site section for one audience (Developer or Product). It has an
  ordered set of pages.
- **Portal Page**: One page of a portal. It has a title, a one-sentence purpose, content, and the
  feature or topic it describes.
- **Feature Page (Product)**: A page for one app feature. It has a summary, a status ("Planned" or
  "Available"), user journey diagrams, and error and edge cases.
- **Decision Entry (Developer)**: One implementation decision. It has the decision, the reason, the
  area it applies to, and the feature that caused it.
- **Diagram**: A picture defined by diagram text. It belongs to a page and is stored with the page.
- **Hook Update**: One run of a portal hook. It has a trigger (specify or implement), the feature
  it covers, the pages it changed, and a result (updated, no change, or failed with a reason).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-technical team member, using only the Product portal, can name every major
  feature and describe the main journey of each in under 15 minutes.
- **SC-002**: A developer new to the repo, using only the Developer portal, can say where a new
  screen, its strings, and a new reusable component belong in under 20 minutes.
- **SC-003**: After a `/speckit-specify` run completes, the Product portal shows the new feature as
  "Planned" with no manual doc edit in 100% of runs where the spec has a user flow.
- **SC-004**: After a `/speckit-implement` run completes, the portal content matches the built
  feature (label, design system, decisions, architecture, dependencies) with no manual doc edit in
  100% of runs.
- **SC-005**: 100% of diagrams on the published site render. A reader sees no raw diagram text.
- **SC-006**: Each portal page can be read in under 5 minutes. No page needs a reader to open
  another source to understand it, except the linked code folders.
- **SC-007**: After a merge to main, the live site shows the new content within 10 minutes.
- **SC-008**: In a review of five reviewers, at least four rate both portals "easy to navigate".

## Assumptions

- The portal source lives in the app repository in a docs folder. Existing files `docs/API_SPIKE.md`
  and `docs/PROJECT_GUIDE.md` are inputs for the first content. They are not removed.
- GitHub Pages is available for the repository. The site is public, and the content is safe for
  public view (FR-021).
- A diagram language that GitHub and the site can both render is acceptable. The issue names
  mermaid, so mermaid is the diagram language.
- "Hook" means the project's existing SpecKit extension hook mechanism (`.specify/extensions.yml`).
  The new hooks run after `/speckit-specify` and `/speckit-implement` like the existing hooks.
- The hooks are optional-style helpers in the sense that a failure does not block the main command
  (FR-016). Whether each hook asks before it runs or runs on its own is a planning decision.
- "Important" implementation decisions means decisions that a future developer would ask "why" about.
  Small code choices are not listed.
- "Available" means the feature's tasks are complete after `/speckit-implement`. A partly built
  feature stays "Planned" until the implement run finishes.
- Light and dark appearance of the site, search, and translation of the site text are out of scope.
  The portals are in English.
- The portals describe only the app in this repository. They are not a general company wiki.
- Screenshots of the app in the Product portal are welcome when they exist. They are not required
  for the first release.
