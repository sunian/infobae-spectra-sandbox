---
title: Design system
purpose: Shows the colors, fonts, and reusable building blocks that every screen of the app uses.
portal: product
parent: Product Portal
nav_order: 9
---

# Design system

Every screen is built from the pieces on this page. A screen does not draw its own one-off pieces.

## Colors and themes

The app has two themes, light and dark. Each theme has the same nine colors. A screen never picks a
color itself. It asks the design system for the color of the active theme. By default the theme
matches the phone. The reader can choose System, Light, or Dark in the Menu. Text and the tab colors
keep at least the contrast that accessibility rules ask for (4.5 to 1 for text, 3 to 1 for the
inactive tab) in both themes.

| Name | Light | Dark | Used for |
|---|---|---|---|
| Background | `#FFFFFF` | `#121212` | Screen background |
| Surface | `#F5F5F5` | `#1E1E1E` | Raised areas |
| Text primary | `#111111` | `#F2F2F2` | Main text |
| Text secondary | `#666666` | `#A8A8A8` | Less important text |
| Tab active | `#0A5CFF` | `#6EA2FF` | The selected tab |
| Tab inactive | `#8A8A8A` | `#8A8A8A` | Other tabs |
| Border | `#E0E0E0` | `#2E2E2E` | Lines between items |
| Placeholder | `#E6E6E6` | `#2A2A2A` | Grey box while an image is missing |
| Link | `#0A5CFF` | `#6EA2FF` | Links in article text |

## Fonts and text styles

The app uses the device's system font, in regular and bold.

| Style | Size | Weight | Used for |
|---|---|---|---|
| Title | 28 | Bold | Screen titles |
| Heading 1 | 28 | Bold | Top heading inside an article |
| Heading 2 | 22 | Bold | Section heading |
| Heading 3 | 19 | Bold | Sub-section heading |
| Heading 4 | 17 | Bold | Small heading |
| Headline | 17 | Bold | Headline in the feed |
| Subheadline | 18 | Regular | Article subheadline |
| Body | 16 | Regular | Article text |
| Label | 12 | Semi-bold | Tab labels |
| Caption | 12 | Regular | Image captions |
| Meta | 12 | Regular | Authors and time |

## Spacing and shape

| Name | Value |
|---|---|
| Spacing (extra small to extra large) | 4, 8, 16, 24, 32 |
| Corner radius (small, medium) | 4, 8 |
| Feed thumbnail width | 112 |

## Building blocks

| Component | What it is for |
|---|---|
| Screen | The base of every screen. It keeps content clear of the notch and edges. |
| Text, Heading | All text, in the styles above. |
| RichText | Text with bold, italic, and links inside it. |
| TabBarLabel | The label and icon of a tab. |
| Placeholder | The simple screen of a tab that has no feature yet. |
| ListRow, OptionList | A tappable row and a list of rows. Used for the edition list and the theme list. |
| ThemeProvider | Gives every building block the colors of the active theme. The app wraps all screens in it. |
| FeedList | The scrolling list with paging and pull to refresh. |
| FeedItemCard | One article in the feed: headline, summary, image, authors, time. |
| Thumbnail | A small image with a grey box if the image is missing. |
| ListHeader, ListFooter | A title at the top of a list, and the loading or "Try again" area at the end. |
| StateView | The full-screen loading, empty, or error message with an action. |
| Banner | A short message bar that the reader can dismiss. |
| ArticleHeader | Section, headline, subheadline, authors, and date of an article. |
| ArticleBody | The container for the article text. |
| ArticleImage | An article image with its caption. |
