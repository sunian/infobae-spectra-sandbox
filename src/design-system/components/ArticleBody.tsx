import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '../tokens';

type ArticleBodyProps = {
  children: ReactNode;
};

/** The scrolling column of an article: header, pictures and paragraphs with even spacing. */
export function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <ScrollView testID="article-body" contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});
