import { parseInlineHtml } from './inlineHtml';

const plain = (text: string) => ({ text, bold: false, italic: false });

describe('parseInlineHtml', () => {
  it('returns one segment for plain text', () => {
    expect(parseInlineHtml('Hola mundo')).toEqual([plain('Hola mundo')]);
  });

  it('returns nothing for empty input', () => {
    expect(parseInlineHtml('')).toEqual([]);
  });

  it('marks bold with b and strong', () => {
    expect(parseInlineHtml('a <b>x</b> <strong>y</strong>')).toEqual([
      plain('a '),
      { text: 'x', bold: true, italic: false },
      plain(' '),
      { text: 'y', bold: true, italic: false },
    ]);
  });

  it('marks italic with i and em', () => {
    expect(parseInlineHtml('<i>x</i><em>y</em>')).toEqual([
      { text: 'xy', bold: false, italic: true },
    ]);
  });

  it('keeps the href of a link', () => {
    expect(parseInlineHtml('ver <a href="https://a.b/c">aquí</a>')).toEqual([
      plain('ver '),
      { text: 'aquí', bold: false, italic: false, href: 'https://a.b/c' },
    ]);
  });

  it('keeps bold and the link when they are nested', () => {
    expect(parseInlineHtml('<a href="https://a.b"><b>motor</b></a>')).toEqual([
      { text: 'motor', bold: true, italic: false, href: 'https://a.b' },
    ]);
  });

  it('turns br into a new line', () => {
    expect(
      parseInlineHtml('a<br>b<br/>c')
        .map((s) => s.text)
        .join(''),
    ).toBe('a\nb\nc');
  });

  it('removes unknown tags and keeps their text', () => {
    expect(parseInlineHtml('<span class="x">uno</span> <div>dos</div>')).toEqual([
      plain('uno dos'),
    ]);
  });

  it('closes an open tag at the end of the input', () => {
    expect(parseInlineHtml('a <b>negrita')).toEqual([
      plain('a '),
      { text: 'negrita', bold: true, italic: false },
    ]);
  });

  it('does not throw on broken input', () => {
    for (const html of ['<b', '</a>', '<<>>', '<a href="x', '</b></b>', '<>', 'a < b > c', '<a>']) {
      expect(() => parseInlineHtml(html)).not.toThrow();
    }
    expect(parseInlineHtml('</a>texto')).toEqual([plain('texto')]);
    expect(
      parseInlineHtml('a < b')
        .map((s) => s.text)
        .join(''),
    ).toBe('a < b');
  });

  it('decodes common and numeric entities', () => {
    expect(
      parseInlineHtml('&amp; &lt; &gt; &quot; &#39; &nbsp; &#233; &#xE9;')
        .map((s) => s.text)
        .join(''),
    ).toBe('& < > " \'   é é');
  });

  it('leaves an unknown entity as it is', () => {
    expect(parseInlineHtml('a &zzz; b')[0].text).toBe('a &zzz; b');
  });

  it('keeps the text of a link with an unsafe href but drops the href', () => {
    const segments = parseInlineHtml('<a href="javascript:alert(1)">enlace</a>');
    expect(segments).toEqual([plain('enlace')]);
    expect(segments[0]).not.toHaveProperty('href');
  });

  it('turns a relative link into an infobae.com address', () => {
    expect(parseInlineHtml('<a href="/colombia/x">x</a>')[0].href).toBe(
      'https://www.infobae.com/colombia/x',
    );
  });

  it('reads single-quoted and unquoted href values', () => {
    expect(parseInlineHtml("<a href='https://a.b'>x</a>")[0].href).toBe('https://a.b');
    expect(parseInlineHtml('<a href=https://a.b>x</a>')[0].href).toBe('https://a.b');
  });

  it('ignores a closing tag with no open tag', () => {
    expect(parseInlineHtml('a</b>b')).toEqual([plain('ab')]);
  });
});
