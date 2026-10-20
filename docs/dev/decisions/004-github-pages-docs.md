---
title: Documentation portals decisions
purpose: Records why the documentation site and its update hooks were built the way they were.
portal: dev
feature: 004-github-pages-docs
parent: Developer Portal
nav_order: 7
---

# Documentation portals decisions

Source: [`specs/004-github-pages-docs/research.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs/004-github-pages-docs/research.md).

| Decision | Reason | Applies to |
|---|---|---|
| Use Jekyll with the `just-the-docs` theme, built by GitHub Pages | The team wanted automatic deploy with no custom action. Only a Jekyll site builds with no workflow. The theme gives navigation, search, and a phone layout. | [`docs/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/docs) |
| One Markdown file per feature in each portal | A second run replaces the page instead of adding a copy. It avoids merge fights between features. | [`docs/product/features/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/docs/product/features), [`docs/dev/decisions/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/docs/dev/decisions) |
| Check pages with a Node tool: front matter, TL;DR, links, secrets, mermaid syntax | Jekyll checks none of these. The tool runs without a browser and without CI. | [`tools/portal/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/tools/portal) |
| Two commands (specify and implement) share one procedure file, and both hooks run on their own | The hook registry has no argument field, so the command name sets the mode. One file keeps the rules in one place. A failure never blocks the main command. | [`.specify/extensions/docs-portals/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/.specify/extensions/docs-portals) |
| Publish from the `main` branch and `/docs` folder | The hooks write to the feature branch. The site updates on merge. The repo is public, so the free plan is enough. | Repository settings |
| Write the first content by hand from the existing specs, guides, and code | The portals must cover the features that already exist. | [`docs/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/docs) |
