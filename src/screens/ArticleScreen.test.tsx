import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import type { ContentSource } from '@/domain/content/ContentSource';
import { createFixtureContentSource } from '@/domain/content/fixtureContentSource';
import { formatArticleDate } from '@/domain/article/articleDate';
import { ContentProvider } from '@/state/ContentContext';

import { ArticleScreen } from './ArticleScreen';

// Fixture articles: fixture-1 has a header, bold text and links. fixture-2 has several images.
// fixture-3 has a video and unsupported blocks, which the app leaves out.
const WITH_LINKS = '/colombia/2026/10/19/fixture-1/';
const WITH_IMAGES = '/colombia/2026/10/19/fixture-2/';
const WITH_VIDEO = '/colombia/2026/10/19/fixture-3/';

function renderArticle(path: string, source: ContentSource = createFixtureContentSource()) {
  return render(
    <ContentProvider source={source}>
      <ArticleScreen path={path} />
    </ContentProvider>,
  );
}

type StyleValue = Record<string, unknown> | false | null | undefined | StyleValue[];
function flatten(style: StyleValue): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style || {};
}

afterEach(() => {
  // React Native's Jest setup already mocks Linking, so clear the call history too.
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('ArticleScreen', () => {
  it('shows the loading state, then the article', async () => {
    const fixture = createFixtureContentSource();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    await renderArticle(WITH_LINKS, {
      ...fixture,
      fetchArticle: async (path, signal) => {
        await gate;
        return fixture.fetchArticle(path, signal);
      },
    });
    expect(screen.getByTestId('state-view-loading')).toBeTruthy();
    expect(screen.getByText('Loading article')).toBeTruthy();
    release();
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    expect(screen.queryByTestId('state-view-loading')).toBeNull();
  });

  it('shows the header: section, headline, subheadline, authors and date', async () => {
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    expect(screen.getByText('Colombia')).toBeTruthy();
    expect(screen.getByText(/^Una bajada que resume/)).toBeTruthy();
    expect(screen.getByText('By Ana Pérez, Luis Gómez')).toBeTruthy();
    expect(screen.getByText(formatArticleDate('2026-10-19T13:47:56.352Z'))).toBeTruthy();
  });

  it('shows the hero image with its caption', async () => {
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    expect(screen.getByText('Imagen principal de la nota (Foto: Infobae)')).toBeTruthy();
    expect(screen.getAllByTestId('thumbnail-image').length).toBeGreaterThanOrEqual(2);
  });

  it('shows the body blocks in the original order', async () => {
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    const texts = screen.getAllByText(/./).map((node) => {
      const children = node.props.children as unknown;
      return typeof children === 'string' ? children : '';
    });
    const at = (needle: string) => texts.findIndex((text) => text.includes(needle));
    const order = [
      at('Nota con titulares'),
      at('Segundo párrafo'),
      at('Un subtítulo de nivel dos'),
      at('Una imagen dentro del cuerpo'),
      at('Otro subtítulo'),
      at('Último párrafo'),
    ];
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('shows headers as headers and bold text in bold', async () => {
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    expect(screen.getByRole('header', { name: 'Un subtítulo de nivel dos' })).toBeTruthy();
    expect(flatten(screen.getByText('texto en negrita').props.style).fontWeight).toBe('700');
  });

  it('shows each body image with its caption', async () => {
    await renderArticle(WITH_IMAGES);
    await waitFor(() => expect(screen.getByText(/Nota con varias imágenes/)).toBeTruthy());
    expect(screen.getByText('Imagen horizontal (Foto: Infobae)')).toBeTruthy();
    expect(screen.getByText(/^Imagen vertical con un epígrafe/)).toBeTruthy();
    expect(screen.getAllByTestId('thumbnail-image').length).toBeGreaterThanOrEqual(4);
  });

  it('leaves out a video and unsupported blocks and shows the rest', async () => {
    await renderArticle(WITH_VIDEO);
    await waitFor(() => expect(screen.getByText(/Nota con video/)).toBeTruthy());
    expect(screen.getByText(/^Texto después de un video/)).toBeTruthy();
    expect(screen.getByText(/^Texto final/)).toBeTruthy();
    expect(screen.queryByText(/ignorar/)).toBeNull();
    expect(screen.queryByText('Un video')).toBeNull();
  });

  it('opens a body link in the browser', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    await fireEvent.press(screen.getByRole('link', { name: 'enlace' }));
    expect(open).toHaveBeenCalledWith('https://www.infobae.com/tag/colombia/');
  });

  it('does nothing for a link with an unsafe address', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    // The unsafe link keeps its text, but it joins the plain text around it and is not a link.
    expect(screen.queryByRole('link', { name: /inseguro/ })).toBeNull();
    await fireEvent.press(screen.getByText(/enlace inseguro/));
    expect(open).not.toHaveBeenCalled();
  });

  it('does not throw when the browser cannot open the link', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));
    await renderArticle(WITH_LINKS);
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    await fireEvent.press(screen.getByRole('link', { name: 'enlace' }));
    expect(screen.getByText(/Nota con titulares/)).toBeTruthy();
  });

  it('shows an error and a retry action when the article fails, and retry loads it', async () => {
    const fixture = createFixtureContentSource();
    let calls = 0;
    await renderArticle(WITH_LINKS, {
      ...fixture,
      fetchArticle: async (path, signal) => {
        calls += 1;
        if (calls === 1) throw new Error('offline');
        return fixture.fetchArticle(path, signal);
      },
    });
    await waitFor(() => expect(screen.getByText('We could not load this article.')).toBeTruthy());
    expect(screen.queryByText(/Nota con titulares/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText(/Nota con titulares/)).toBeTruthy());
    expect(screen.queryByText('We could not load this article.')).toBeNull();
  });

  it('shows the error state for the fixture article that has no content', async () => {
    await renderArticle('/colombia/2026/10/19/fixture-sin-contenido/');
    await waitFor(() => expect(screen.getByText('We could not load this article.')).toBeTruthy());
  });

  it('shows the error state when the path is missing', async () => {
    await renderArticle('');
    expect(screen.getByText('We could not load this article.')).toBeTruthy();
  });
});
