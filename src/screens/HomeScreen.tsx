import { useRouter } from 'expo-router';
import { useRef } from 'react';

import {
  Banner,
  FeedItemCard,
  FeedList,
  ListFooter,
  ListHeader,
  Screen,
  StateView,
  type FeedListHandle,
} from '@/design-system';
import { formatRelativeTime } from '@/domain/feed/relativeTime';
import type { EditionId } from '@/domain/infobae/editions';
import type { FeedItem } from '@/domain/infobae/feed';
import { resizedImageUrl } from '@/domain/infobae/images';
import { t } from '@/localization';
import { useEdition } from '@/state/EditionContext';
import { useFeed } from '@/state/useFeed';
import { useNavigationLock } from '@/state/useNavigationLock';

const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_HEIGHT = 160;

function metaLine(item: FeedItem): string {
  return [item.authors.join(', '), formatRelativeTime(item.updatedAt)].filter(Boolean).join(' · ');
}

function HomeFeed({ edition }: { edition: EditionId }) {
  const router = useRouter();
  const lock = useNavigationLock();
  const { state, loadNextPage, retry, retryNextPage, refresh } = useFeed(edition);
  const list = useRef<FeedListHandle>(null);

  const refreshAndScrollUp = () => {
    refresh().then((ok) => {
      if (ok) list.current?.scrollToTop();
    });
  };

  const openArticle = (item: FeedItem) =>
    lock(() => router.push({ pathname: '/article', params: { path: item.websiteUrl } }));

  return (
    <Screen padded={false}>
      {state.status === 'loading' ? (
        <StateView kind="loading" message={t('feed.loading')} />
      ) : state.status === 'empty' ? (
        <StateView kind="empty" message={t('feed.empty')} />
      ) : state.status === 'error' ? (
        <StateView
          kind="error"
          message={t('feed.error')}
          actionLabel={t('feed.retry')}
          onAction={retry}
        />
      ) : (
        <>
          {state.refreshError ? <Banner message={t('feed.refreshError')} /> : null}
          <FeedList
            ref={list}
            refreshing={state.refreshing}
            onRefresh={refreshAndScrollUp}
            data={state.items}
            keyExtractor={(item) => item.websiteUrl}
            onEndReached={loadNextPage}
            header={<ListHeader title={t(`editions.${edition}`)} />}
            footer={
              <ListFooter
                state={state.nextPage}
                errorLabel={t('feed.pageError')}
                retryLabel={t('feed.retry')}
                onRetry={retryNextPage}
              />
            }
            renderItem={(item) => {
              const meta = metaLine(item);
              return (
                <FeedItemCard
                  headline={item.headline}
                  summary={item.summary}
                  meta={meta}
                  imageUrl={
                    resizedImageUrl(item.image, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT) ?? undefined
                  }
                  accessibilityLabel={[item.headline, meta].filter(Boolean).join('. ')}
                  onPress={() => openArticle(item)}
                />
              );
            }}
          />
        </>
      )}
    </Screen>
  );
}

export function HomeScreen() {
  const { edition } = useEdition();
  return edition ? <HomeFeed edition={edition} /> : null;
}
