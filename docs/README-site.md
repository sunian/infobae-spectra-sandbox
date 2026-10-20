# Documentation site

This folder is the source of the site. GitHub builds it with Jekyll and the `just-the-docs` theme.

## Preview on your machine

```sh
cd docs
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/infobae-spectra-sandbox/`. Diagrams load from a CDN, so you need a network.

## Check the pages

Run this from the repository root:

```sh
npm run verify:docs
```

It runs the tests of the checker, lints it, and checks every page in `docs/dev/`, `docs/product/`, and
`docs/index.md`: front matter, repo links, secret-like text, and mermaid diagrams.

## How the pages stay current

Two SpecKit hooks (extension `docs-portals`) run on their own:

- After `/speckit-specify`: the Product portal gets a page for the feature, marked **Planned**.
- After `/speckit-implement`: the Developer portal gets the decisions, architecture, and dependency
  changes. The Product design system page is updated. The feature becomes **Available** when every
  task is done.

The hooks write only under `docs/`. They never publish. A failure prints a message and changes
nothing. The shared rules are in `.specify/extensions/docs-portals/procedure.md`.

## Publish (one time)

In the repository settings, open Pages. Set the source to "Deploy from a branch", the branch to
`main`, and the folder to `/docs`. No workflow file is needed. After this, every merge to `main`
updates the site.

## Rules

- Do not add a TL;DR block to a page. The validator reports one as an error (constitution principle VII).
- Keep pages short. A reader should finish a page in under five minutes.
- Put no secrets, keys, or private URLs in any page. The site is public.
