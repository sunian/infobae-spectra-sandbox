import { BASE_URL } from './urls';

export type FeedItem = {
  /** Site path. Pass it to `articleUrl` to load the full article. */
  websiteUrl: string;
  url: string;
  headline: string;
  summary: string;
  authors: string[];
  imageUrl: string | null;
  updatedAt: string;
};

// Loose shape of one feed-list-d23 item. Only fields we read are listed.
export type ArcFeedItem = {
  website_url?: string;
  headlines?: { basic?: string };
  description?: { basic?: string };
  credits?: { by?: { name?: string }[] };
  promo_items?: { basic?: { url?: string } };
  last_updated_date?: string;
};

export type ArcFeedList = {
  content_elements?: ArcFeedItem[];
};

/** Maps a feed-list-d23 response to feed items. Items with no path or headline are dropped. */
export function mapFeedList(response: ArcFeedList): FeedItem[] {
  return (response.content_elements ?? []).flatMap((item) => {
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
        imageUrl: item.promo_items?.basic?.url ?? null,
        updatedAt: item.last_updated_date ?? '',
      },
    ];
  });
}
