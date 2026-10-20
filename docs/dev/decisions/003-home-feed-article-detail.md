---
title: Home feed decisions
purpose: Records why the Home feed and Article Detail were built the way they were.
portal: dev
feature: 003-home-feed-article-detail
parent: Developer Portal
nav_order: 6
---

# Home feed decisions

> **TL;DR** (max 5 bullets, written for a human reviewer)
> - **What:** Ten decisions on fetching, paging, article text, links, images, tests, and errors.
> - **Why:** They explain how the feed stays correct when the network, the API, or the edition changes.
> - **Scope / Approach / Order:** Data and state, content handling, tests, navigation, errors.
> - **Biggest risk or open question:** The feed shows `last_updated_date` because the list has no publish date.
> - **Check this:** A request id makes late results from an old edition harmless.

Source: [`specs/003-home-feed-article-detail/research.md`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/specs/003-home-feed-article-detail/research.md).

| Decision | Reason | Applies to |
|---|---|---|
| Plain `fetch` with a 15 s timeout and a pure reducer | One query shape and simple paging. A reducer is easy to unit test. | [`src/domain/feed/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/feed) |
| Page size 20. The next offset adds the raw item count, not the kept count | Items without a path or headline are dropped. Counting only kept items would show repeats. | Feed paging |
| Write a small tolerant HTML parser for article text | The API uses few tags. A full renderer is heavy. The parser never throws on broken HTML. | [`src/domain/article/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/article) |
| Open only `http` and `https` links | It blocks `javascript:` and similar links. | [`links.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/article/links.ts) |
| Ask for resized images and fall back to the original | Original images are large. Known width and height keep the layout from jumping. | [`src/domain/infobae/images.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/infobae/images.ts) |
| Use a `ContentSource` interface with a live and a fixture source | Tests and screenshots must not depend on live news. | [`src/domain/content/`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/content) |
| Write our own relative time function | `Intl.RelativeTimeFormat` is not reliable on all Hermes builds. | [`relativeTime.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/domain/feed/relativeTime.ts) |
| Put `article` in the root stack above the tabs, with a 600 ms navigation lock | Home stays mounted, so the scroll position is kept. The lock stops a double tap. | [`app/article.tsx`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/app/article.tsx) |
| `useFeed` holds a request id and resets when the edition changes | Home stays mounted while the reader uses Menu. Old results are ignored. | [`src/state/useFeed.ts`](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src/state/useFeed.ts) |
| `ContentSource` throws a `ContentError` with a kind. The UI shows one message per place | The spec asks for short messages and a retry. The kind is for logs and tests. | Error handling |
