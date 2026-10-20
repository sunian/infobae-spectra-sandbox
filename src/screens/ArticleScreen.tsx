import { Linking } from 'react-native';

import {
  ArticleBody,
  ArticleHeader,
  ArticleImage,
  Heading,
  RichText,
  Screen,
  StateView,
} from '@/design-system';
import { formatArticleDate } from '@/domain/article/articleDate';
import { parseInlineHtml } from '@/domain/article/inlineHtml';
import { isSafeLink } from '@/domain/article/links';
import type { Article, ArticleBlock, ImageBlock } from '@/domain/infobae/article';
import { resizedImageUrl } from '@/domain/infobae/images';
import { t } from '@/localization';
import { useArticle } from '@/state/useArticle';

const IMAGE_WIDTH = 1080;

type ArticleScreenProps = {
  /** The article's site path, as the feed gives it. */
  path: string;
};

const ARTICLE_EDGES = ['left', 'right', 'bottom'] as const;

function openLink(href: string) {
  if (!isSafeLink(href)) return;
  try {
    Linking.openURL(href).catch(() => {});
  } catch {
    // No browser can open it. The article stays as it is.
  }
}

function imageProps(image: ImageBlock) {
  const aspectRatio = image.width > 0 && image.height > 0 ? image.width / image.height : undefined;
  const height = Math.round(IMAGE_WIDTH / (aspectRatio ?? 16 / 9));
  return {
    uri: resizedImageUrl(image, IMAGE_WIDTH, height) ?? image.url,
    aspectRatio,
    caption: image.caption,
    altText: image.altText || t('article.imageAlt'),
  };
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'text':
      return <RichText segments={parseInlineHtml(block.html)} onLinkPress={openLink} />;
    case 'header':
      return <Heading level={block.level}>{block.text}</Heading>;
    case 'image':
      return <ArticleImage {...imageProps(block)} />;
  }
}

function ArticleContent({ article }: { article: Article }) {
  return (
    <ArticleBody>
      <ArticleHeader
        section={article.sectionName}
        headline={article.headline}
        subheadline={article.subheadline}
        byline={
          article.authors.length ? t('article.by', { authors: article.authors.join(', ') }) : ''
        }
        date={formatArticleDate(article.publishedAt)}
      />
      {article.heroImage ? <ArticleImage {...imageProps(article.heroImage)} /> : null}
      {article.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </ArticleBody>
  );
}

export function ArticleScreen({ path }: ArticleScreenProps) {
  const { state, retry } = useArticle(path);

  return (
    // The native header already sits below the status bar, so the top edge gets no padding.
    <Screen padded={false} edges={ARTICLE_EDGES}>
      {state.status === 'content' ? <ArticleContent article={state.article} /> : null}
      {state.status === 'loading' ? (
        <StateView kind="loading" message={t('article.loading')} />
      ) : null}
      {state.status === 'error' ? (
        <StateView
          kind="error"
          message={t('article.error')}
          actionLabel={t('article.retry')}
          onAction={retry}
        />
      ) : null}
    </Screen>
  );
}
