---
title: Product Portal
purpose: See what the Infobae app does, how a reader uses it, and what it does when something goes wrong.
portal: product
nav_order: 2
has_children: true
---

# Product Portal

This portal is for designers, QA, product managers, and anyone who wants to understand the app.
Infobae is a mobile news reader. A reader picks an edition (a country or region), reads a feed of
articles for that edition, and opens an article to read it.

## Features

| Feature | Status | What it does |
|---|---|---|
| [App shell]({{ site.baseurl }}{% link product/features/001-project-scaffold.md %}) | Available | Five bottom tabs: Home, My Infobae, Media, Chat, Menu. |
| [Edition selection]({{ site.baseurl }}{% link product/features/002-edition-selection.md %}) | Available | The reader picks an edition on first launch. The app remembers it. The Menu changes it. |
| [Home feed and Article Detail]({{ site.baseurl }}{% link product/features/003-home-feed-article-detail.md %}) | Available | A scrolling feed of the newest articles for the edition, and a screen to read each article. |
| [Documentation portals]({{ site.baseurl }}{% link product/features/004-github-pages-docs.md %}) | Planned | Two documentation sites, for developers and for the whole team, that update after each specify and implement run. Built; goes live when Pages is turned on. |
| [Dark mode]({{ site.baseurl }}{% link product/features/005-dark-mode.md %}) | Planned | A light and a dark look. The app matches the phone by default. The reader can choose System, Light, or Dark in the Menu. |

Status "Planned" means the feature is specified but not built. Status "Available" means it is built.

## Design system

The [design system]({{ site.baseurl }}{% link product/design-system.md %}) lists the colors, fonts, and reusable
building blocks that every screen uses.
