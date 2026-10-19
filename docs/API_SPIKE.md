# Infobae API Spike

Date: 2026-10-19. Method: `curl` against www.infobae.com. No login, no API key.

These APIs are not documented or supported by Infobae. They can change without notice.
Check the terms of use before any public release.

## Design rule

A feed screen loads **summaries only**. It does not download article bodies.
The app loads the full body when the user opens the Article Detail screen.

```
Home feed screen  ──>  Feed List API   (summaries, about 1.4 KB per article)
        │
        └─ user taps an article
                 │
                 v
Article Detail    ──>  Article API     (full body, about 15 KB, one article)
```

## The endpoints

infobae.com runs on **Arc XP** (Arc Publishing). Every section below uses these exact names.

| Name | What it returns | Used by |
| --- | --- | --- |
| **Feed List API** | A page of article summaries. No body. | Home feed, and any other feed |
| **Article API** | One full article as JSON | Article Detail screen |
| **Sections JSON** | The list of editions and their menus | Not used yet |
| **RSS Feed** | 100 articles with full bodies | Not used (too heavy for a feed) |

## 1. Feed List API (use for every feed)

```
GET https://www.infobae.com/pf/api/v3/content/fetch/feed-list-d23
    ?query={"feedLimit":20,"feedOffset":0,"feedOrder":"first_publish_date:desc",
            "feedQuery":" AND taxonomy.sites.path:(\"/colombia\")"}
    &d=4541
    &_website=infobae
```

The Infobae home page itself uses this source for its section blocks.

Each item in `content_elements[]` has:

| Field | Meaning |
| --- | --- |
| `website_url` | Article path. Pass it to the Article API. |
| `headlines.basic` | Headline |
| `description.basic` | One-sentence summary |
| `promo_items.basic.url` | Hero image URL |
| `credits.by[].name` | Author names |
| `last_updated_date` | ISO 8601, UTC |

- **Size:** about 1.4 KB per article. A page of 20 is about 28 KB.
- **Paging:** `feedLimit` is the page size. `feedOffset` is the start. Page 2 of size 20 uses `feedOffset: 20`.
- **Order:** `first_publish_date:desc` gives newest first.
- **Edition filter:** `feedQuery` selects site sections. See "Editions" below.
- **No first-publish date field.** The article path has the date (`/colombia/2026/10/19/...`). `last_updated_date` is also available.
- **No section name field.** The first path segment is the section.
- Code: `feedListUrl(edition, offset, limit)` in `src/domain/infobae/urls.ts`. `mapFeedList()` in `src/domain/infobae/feed.ts` turns the JSON into `FeedItem[]`.

## 2. Article API (use for Article Detail)

```
GET https://www.infobae.com/pf/api/v3/content/fetch/content-api
    ?query={"website_url":"/colombia/2026/10/19/slug/","website":"infobae"}
    &_website=infobae
```

The `website_url` value is the `website_url` from a Feed List API item.

- Format: JSON. Size: about 15 KB.
- Fields we use:
  - `_id`, `canonical_url`, `display_date` (ISO 8601, UTC)
  - `headlines.basic`, `subheadlines.basic`
  - `credits.by[].name`
  - `promo_items.basic`: the hero image (`url`, `width`, `height`, `caption`)
  - `taxonomy.primary_section.name`
  - `content_elements[]`: the body, as a list of blocks
- Block types seen:
  - `text`: an HTML string with `<b>` and `<a>` tags
  - `header`: `content` and `level`
  - `image`: `url`, `caption`, `alt_text`, `width`, `height`
  - `custom_embed`: a JW Player video in `embed.config` (`contentUrl` as .mp4, `name`, `duration` as ISO 8601)
- Images: `url` is the original on CloudFront. `additional_properties.resizeUrl` plus `&width=&height=` gives a resized copy from `www.infobae.com/resizer/v2/...`. The `auth` token in that URL is signed for each image.
- Code: `articleUrl(websiteUrl)` in `src/domain/infobae/urls.ts`. `mapArticle()` in `src/domain/infobae/article.ts` turns the JSON into an `Article`.

## 3. Sections JSON (not used yet)

```
GET https://infobae-static.infobae.com/assets/jsons/infobae-sections.json
```

- Size: 67 KB.
- Top-level keys: argentina, peru, colombia, espana, mexico, cuba, mundo, estados-unidos, centro-america.
- Each key has a `navbar` list with names, site paths, and flag icon URLs.
- Use it later for section menus inside an edition. `src/domain/infobae/editions.ts` holds a fixed edition list for now.

## 4. RSS Feed (rejected)

```
GET https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/
```

- XML. 100 items, about 760 KB, because every item has the full body (`content:encoded`).
- No way to leave out the body. Paging params are ignored.
- We do not use it. The Feed List API gives the same list data at a fraction of the size.

## Editions

The Feed List API filters with `feedQuery`, using Lucene syntax on `taxonomy.sites.path`.
A path matches its sub-sections too (`/colombia` also matches `/colombia/deportes`).
All editions were tested and returned current articles.

| Edition | `feedQuery` |
| --- | --- |
| Argentina | ` AND NOT taxonomy.sites.path:(<all other edition paths>)` |
| Estados Unidos | ` AND taxonomy.sites.path:("/estados-unidos")` |
| Colombia | ` AND taxonomy.sites.path:("/colombia")` |
| España | ` AND taxonomy.sites.path:("/espana")` |
| México | ` AND taxonomy.sites.path:("/mexico")` |
| Perú | ` AND taxonomy.sites.path:("/peru")` |
| Cuba | ` AND taxonomy.sites.path:("/cuba")` |
| Centroamérica | ` AND taxonomy.sites.path:("/el-salvador" "/nicaragua" "/honduras" "/guatemala" "/republica-dominicana" "/panama" "/costa-rica")` |
| Mundo | ` AND taxonomy.sites.path:("/america")` |

## Open issues

- **Argentina is approximate.** Argentina has no section of its own. The query takes everything not in another edition. That includes global sections such as `/tecno` and `/salud`, which is also what the Argentina home page shows. It is not an exact copy of the curated Argentina home page.
- **Home page order.** The real home page is curated by editors. The Feed List API gives newest-first, not editor order. This is a product choice for the Home feed feature.
- **Image sizes.** Feed List API images are originals. We need to decide on resized URLs for list thumbnails. The `resizeUrl` field is in each item's `promo_items.basic.additional_properties`.
- **Media tab:** video, live stream, and audio sources were not investigated. We only saw the JW Player embed inside articles.
- **Rate limits, caching headers, and terms of use** were not checked in depth. The site sits behind Akamai.
- **Deploy number `d=4541`** is the site's current deploy. We did not test a stale value.

## Code from this spike

- `src/domain/infobae/editions.ts`: the edition list and section paths.
- `src/domain/infobae/urls.ts`: URL builders for the **Feed List API** and **Article API**.
- `src/domain/infobae/feed.ts`: types, and a mapper from **Feed List API** JSON to `FeedItem[]`.
- `src/domain/infobae/article.ts`: types, and a mapper from **Article API** JSON to an `Article`.
- `src/domain/infobae/infobae.test.ts`: unit tests. They use trimmed real responses in `__fixtures__/`.
