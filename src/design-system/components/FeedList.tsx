import { useImperativeHandle, useRef } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { FlatList, RefreshControl } from 'react-native';

import { useColors } from '../theme';

export type FeedListHandle = {
  scrollToTop: () => void;
};

type FeedListProps<T> = {
  data: readonly T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  onEndReached?: () => void;
  /** Adds pull to refresh when given. */
  onRefresh?: () => void;
  refreshing?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  ref?: Ref<FeedListHandle>;
};

/** A long vertical list tuned for 100 or more items. */
export function FeedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  header,
  footer,
  ref,
}: FeedListProps<T>) {
  const colors = useColors();
  const list = useRef<FlatList<T>>(null);
  useImperativeHandle(ref, () => ({
    scrollToTop: () => list.current?.scrollToOffset({ offset: 0, animated: false }),
  }));

  return (
    <FlatList
      ref={list}
      testID="feed-list"
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      windowSize={7}
      removeClippedSubviews
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tabActive]}
            tintColor={colors.tabActive}
          />
        ) : undefined
      }
      ListHeaderComponent={header ? <>{header}</> : undefined}
      ListFooterComponent={footer ? <>{footer}</> : undefined}
    />
  );
}
