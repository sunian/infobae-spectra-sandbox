import type { Edition } from './editions';

export const BASE_URL = 'https://www.infobae.com';
export const SECTIONS_URL = 'https://infobae-static.infobae.com/assets/jsons/infobae-sections.json';

// Arc "deployment" value that the website sends as `d`. It changes on each site deploy.
// The API still answers when it is stale, so treat it as a cache key only.
const ARC_DEPLOYMENT = '4541';

function arcFetchUrl(source: string, query: object): string {
  const params = new URLSearchParams({
    query: JSON.stringify(query),
    d: ARC_DEPLOYMENT,
    _website: 'infobae',
  });
  return `${BASE_URL}/pf/api/v3/content/fetch/${source}?${params.toString()}`;
}

function pathList(paths: readonly string[]): string {
  return `(${paths.map((path) => `"${path}"`).join(' ')})`;
}

function editionFilter(edition: Edition): string {
  const include = edition.includePaths.length
    ? ` AND taxonomy.sites.path:${pathList(edition.includePaths)}`
    : '';
  const exclude = edition.excludePaths.length
    ? ` AND NOT taxonomy.sites.path:${pathList(edition.excludePaths)}`
    : '';
  return `${include}${exclude}`;
}

/** One page of article summaries for an edition, newest first. No article body. */
export function feedListUrl(edition: Edition, offset: number, limit: number): string {
  return arcFetchUrl('feed-list-d23', {
    feedLimit: limit,
    feedOffset: offset,
    feedOrder: 'first_publish_date:desc',
    feedQuery: editionFilter(edition),
  });
}

/** The full article JSON for a site path such as `/colombia/2026/10/19/slug/`. */
export function articleUrl(websiteUrl: string): string {
  return arcFetchUrl('content-api', { website_url: websiteUrl, website: 'infobae' });
}
