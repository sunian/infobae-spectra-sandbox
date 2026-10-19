import { mapArticle, type ArcStory } from './article';
import { EDITIONS, getEdition } from './editions';
import { mapFeedList, type ArcFeedList } from './feed';
import { resizedImageUrl } from './images';
import { articleUrl, feedListUrl } from './urls';
import feedList from './__fixtures__/feed-list.json';
import story from './__fixtures__/story.json';

describe('editions', () => {
  it('has unique ids', () => {
    const ids = EDITIONS.map((edition) => edition.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds an edition by id', () => {
    expect(getEdition('colombia')?.name).toBe('Colombia');
    expect(getEdition('nowhere')).toBeUndefined();
  });
});

describe('urls', () => {
  const feedQuery = (url: string) =>
    JSON.parse(new URL(url).searchParams.get('query')!) as Record<string, unknown>;

  it('builds a feed list url with paging and newest-first order', () => {
    const url = feedListUrl(getEdition('peru')!, 20, 10);
    expect(new URL(url).pathname).toBe('/pf/api/v3/content/fetch/feed-list-d23');
    expect(feedQuery(url)).toEqual({
      feedLimit: 10,
      feedOffset: 20,
      feedOrder: 'first_publish_date:desc',
      feedQuery: ' AND taxonomy.sites.path:("/peru")',
    });
  });

  it('joins several include paths for Centroamerica', () => {
    const query = feedQuery(feedListUrl(getEdition('centroamerica')!, 0, 5)).feedQuery;
    expect(query).toContain('("/el-salvador" "/nicaragua"');
    expect(query).toContain('"/costa-rica")');
  });

  it('excludes the other editions for Argentina', () => {
    const query = feedQuery(feedListUrl(getEdition('argentina')!, 0, 5)).feedQuery as string;
    expect(query).toMatch(/^ AND NOT taxonomy\.sites\.path:\(/);
    expect(query).toContain('"/colombia"');
    expect(query).not.toContain('AND taxonomy.sites.path:(');
  });

  it('builds an article url from a site path', () => {
    const url = new URL(articleUrl('/colombia/2026/10/19/a/'));
    expect(url.pathname).toBe('/pf/api/v3/content/fetch/content-api');
    expect(JSON.parse(url.searchParams.get('query')!)).toEqual({
      website_url: '/colombia/2026/10/19/a/',
      website: 'infobae',
    });
  });
});

describe('mapFeedList', () => {
  const { items, rawCount } = mapFeedList(feedList as ArcFeedList);

  it('maps the summary fields', () => {
    expect(items).toHaveLength(3);
    expect(items[0].headline).toMatch(/^Partido Liberal/);
    expect(items[0].url).toMatch(/^https:\/\/www\.infobae\.com\/colombia\//);
    expect(items[0].authors).toEqual(['Jhoan Pardo']);
    expect(items[0].image?.url).toMatch(/^https:\/\//);
    expect(items[0].image?.resizeUrl).toMatch(/^\/resizer\/v2\//);
  });

  it('drops items with no headline', () => {
    expect(items.some((item) => item.websiteUrl === '/x/')).toBe(false);
  });

  it('counts every response item, also the ones it drops', () => {
    expect(rawCount).toBe(4);
  });

  it('returns an empty list for an empty response', () => {
    expect(mapFeedList({})).toEqual({ items: [], rawCount: 0 });
  });

  it('has no image when the item has none, and no resizeUrl when the API gives none', () => {
    const mapped = mapFeedList({
      content_elements: [
        { website_url: '/a/', headlines: { basic: 'A' } },
        {
          website_url: '/b/',
          headlines: { basic: 'B' },
          promo_items: { basic: { url: 'https://x/y.jpg' } },
        },
      ],
    }).items;
    expect(mapped[0].image).toBeNull();
    expect(mapped[1].image).toEqual({ url: 'https://x/y.jpg', resizeUrl: undefined });
  });

  it('does not carry an article body', () => {
    expect(Object.keys(items[0])).not.toContain('blocks');
  });
});

describe('mapArticle', () => {
  const article = mapArticle(story as unknown as ArcStory);

  it('maps the header fields', () => {
    expect(article.id).toBe('BJJ67JZBNZD5PHEGP453WCVTII');
    expect(article.url).toMatch(/^https:\/\/www\.infobae\.com\/estados-unidos\/2026\/10\/19\//);
    expect(article.headline).toMatch(/^Accidente aéreo en San José/);
    expect(article.authors).toEqual(['Joaquín Bahamonde']);
    expect(article.sectionName).toBe('Estados Unidos');
  });

  it('maps the hero image', () => {
    expect(article.heroImage?.url).toMatch(/^https:\/\/.*\.png$/);
    expect(article.heroImage?.width).toBeGreaterThan(0);
  });

  it('keeps block order and maps each supported type', () => {
    expect(article.blocks.map((block) => block.type)).toEqual([
      'text',
      'text',
      'image',
      'header',
      'image',
      'header',
      'image',
      'header',
    ]);
  });

  it('leaves out video embeds', () => {
    expect(article.blocks.some((block) => (block.type as string) === 'video')).toBe(false);
  });

  it('keeps width, height and resizeUrl on image blocks', () => {
    const mapped = mapArticle({
      _id: 'x',
      canonical_url: '/x/',
      display_date: '2026-01-01T00:00:00.000Z',
      content_elements: [
        {
          type: 'image',
          url: 'https://x/y.jpg',
          width: 800,
          height: 600,
          additional_properties: { resizeUrl: '/resizer/v2/y.jpg?auth=t' },
        },
      ],
    });
    expect(mapped.blocks[0]).toMatchObject({
      type: 'image',
      width: 800,
      height: 600,
      resizeUrl: '/resizer/v2/y.jpg?auth=t',
    });
  });

  it('drops unknown and empty elements', () => {
    const mapped = mapArticle({
      _id: 'x',
      canonical_url: '/x/',
      display_date: '2026-01-01T00:00:00.000Z',
      content_elements: [{ type: 'text', content: '' }, { type: 'raw_html' }, { type: 'image' }],
    });
    expect(mapped.blocks).toEqual([]);
    expect(mapped.heroImage).toBeNull();
    expect(mapped.headline).toBe('');
  });
});

describe('resizedImageUrl', () => {
  it('adds the size to the signed resize path', () => {
    expect(
      resizedImageUrl(
        { url: 'https://orig/a.jpg', resizeUrl: '/resizer/v2/a.jpg?auth=t' },
        240,
        160,
      ),
    ).toBe('https://www.infobae.com/resizer/v2/a.jpg?auth=t&width=240&height=160');
  });

  it('falls back to the original url', () => {
    expect(resizedImageUrl({ url: 'https://orig/a.jpg' }, 240, 160)).toBe('https://orig/a.jpg');
  });

  it('returns null for no image', () => {
    expect(resizedImageUrl(null, 240, 160)).toBeNull();
  });
});
