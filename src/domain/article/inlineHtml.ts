import { resolveLink } from './links';

export type InlineSegment = {
  text: string;
  bold: boolean;
  italic: boolean;
  /** A safe absolute address. Absent when the text is not a link or the address is unsafe. */
  href?: string;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body.startsWith('#')) {
      const code =
        body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : Number(body.slice(1));
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

function readHref(attributes: string): string | undefined {
  const match = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
  const raw = match?.[1] ?? match?.[2] ?? match?.[3];
  return raw === undefined ? undefined : (resolveLink(decodeEntities(raw)) ?? undefined);
}

// A tag starts with `<`, then an optional `/`, then a letter. Anything else is plain text.
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

/**
 * Turns the HTML of an article text block into styled segments. It reads b, strong, i, em, a and
 * br. It removes every other tag and keeps its text. It never throws on broken HTML.
 */
export function parseInlineHtml(html: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let bold = 0;
  let italic = 0;
  const links: (string | undefined)[] = [];

  const push = (raw: string, decode = true) => {
    const text = decode ? decodeEntities(raw) : raw;
    if (text === '') return;
    const href = links.length ? links[links.length - 1] : undefined;
    const segment: InlineSegment = { text, bold: bold > 0, italic: italic > 0 };
    if (href) segment.href = href;
    const last = segments[segments.length - 1];
    if (
      last &&
      last.bold === segment.bold &&
      last.italic === segment.italic &&
      last.href === segment.href
    ) {
      last.text += text;
    } else {
      segments.push(segment);
    }
  };

  let index = 0;
  for (const match of html.matchAll(TAG)) {
    push(html.slice(index, match.index));
    index = match.index + match[0].length;
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    switch (name) {
      case 'b':
      case 'strong':
        bold = Math.max(0, bold + (closing ? -1 : 1));
        break;
      case 'i':
      case 'em':
        italic = Math.max(0, italic + (closing ? -1 : 1));
        break;
      case 'a':
        if (closing) links.pop();
        else links.push(readHref(match[3]));
        break;
      case 'br':
        if (!closing) push('\n', false);
        break;
      default:
        break;
    }
  }
  push(html.slice(index));
  return segments;
}
