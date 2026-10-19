import { BASE_URL } from './urls';

export type ArticleBlock =
  { type: 'text'; html: string } | { type: 'header'; text: string; level: number } | ImageBlock;

export type ImageBlock = {
  type: 'image';
  url: string;
  /** Signed path of the site's image resizer. See `resizedImageUrl`. */
  resizeUrl?: string;
  caption: string;
  altText: string;
  width: number;
  height: number;
};

export type Article = {
  id: string;
  url: string;
  headline: string;
  subheadline: string;
  authors: string[];
  publishedAt: string;
  sectionName: string;
  heroImage: ImageBlock | null;
  blocks: ArticleBlock[];
};

// Loose shape of the Arc content-api response. Only fields we read are listed.
type ArcImage = {
  url?: string;
  caption?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  additional_properties?: { resizeUrl?: string };
};

type ArcElement = {
  type?: string;
  content?: string;
  level?: number;
} & ArcImage;

export type ArcStory = {
  _id: string;
  canonical_url: string;
  display_date: string;
  headlines?: { basic?: string };
  subheadlines?: { basic?: string };
  credits?: { by?: { name?: string }[] };
  promo_items?: { basic?: ArcImage };
  taxonomy?: { primary_section?: { name?: string } };
  content_elements?: ArcElement[];
};

function toImage(element: ArcImage): ImageBlock | null {
  if (!element.url) return null;
  return {
    type: 'image',
    url: element.url,
    resizeUrl: element.additional_properties?.resizeUrl,
    caption: element.caption ?? '',
    altText: element.alt_text ?? '',
    width: element.width ?? 0,
    height: element.height ?? 0,
  };
}

function toBlock(element: ArcElement): ArticleBlock | null {
  switch (element.type) {
    case 'text':
      return element.content ? { type: 'text', html: element.content } : null;
    case 'header':
      return element.content
        ? { type: 'header', text: element.content, level: element.level ?? 2 }
        : null;
    case 'image':
      return toImage(element);
    default:
      // Video and other embeds (tweets, polls, ads) are skipped until the app can render them.
      return null;
  }
}

export function mapArticle(story: ArcStory): Article {
  return {
    id: story._id,
    url: `${BASE_URL}${story.canonical_url}`,
    headline: story.headlines?.basic ?? '',
    subheadline: story.subheadlines?.basic ?? '',
    authors: (story.credits?.by ?? []).flatMap((author) => (author.name ? [author.name] : [])),
    publishedAt: story.display_date,
    sectionName: story.taxonomy?.primary_section?.name ?? '',
    heroImage: story.promo_items?.basic ? toImage(story.promo_items.basic) : null,
    blocks: (story.content_elements ?? []).flatMap((element) => {
      const block = toBlock(element);
      return block ? [block] : [];
    }),
  };
}
