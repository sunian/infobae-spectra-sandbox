import type { ImageRef } from './images';
import { BASE_URL } from './urls';

export type FeedItem = {
  /** Site path. Pass it to `articleUrl` to load the full article. */
  websiteUrl: string;
  url: string;
  headline: string;
  summary: string;
  authors: string[];
  image: ImageRef | null;
  updatedAt: string;
};

// Loose shape of one feed-list-d23 item. Only fields we read are listed.
export type ArcFeedItem = {
  website_url?: string;
  headlines?: { basic?: string };
  description?: { basic?: string };
  credits?: { by?: { name?: string }[] };
  promo_items?: {
    basic?: { url?: string; additional_properties?: { resizeUrl?: string } };
  };
  last_updated_date?: string;
};

export type ArcFeedList = {
  content_elements?: ArcFeedItem[];
};

export type MappedFeedList = {
  items: FeedItem[];
  /** Items in the response before any were dropped. Paging uses this, not `items.length`. */
  rawCount: number;
};

function toImage(basic: NonNullable<ArcFeedItem['promo_items']>['basic']): ImageRef | null {
  if (!basic?.url) return null;
  return { url: basic.url, resizeUrl: basic.additional_properties?.resizeUrl };
}

/** Maps a feed-list-d23 response to feed items. Items with no path or headline are dropped. */
export function mapFeedList(response: ArcFeedList): MappedFeedList {
  const elements = response.content_elements ?? [];
  const items = elements.flatMap((item) => {
    const websiteUrl = item.website_url;
    const headline = item.headlines?.basic;
    if (!websiteUrl || !headline) return [];
    return [
      {
        websiteUrl,
        url: `${BASE_URL}${websiteUrl}`,
        headline,
        summary: item.description?.basic ?? '',
        authors: (item.credits?.by ?? []).flatMap((author) => (author.name ? [author.name] : [])),
        image: toImage(item.promo_items?.basic),
        updatedAt: item.last_updated_date ?? '',
      },
    ];
  });
  return { items, rawCount: elements.length };
}
