import { StyleSheet, View } from 'react-native';

import { spacing } from '../tokens';
import { Text } from './Text';

type ArticleHeaderProps = {
  section?: string;
  headline: string;
  subheadline?: string;
  byline?: string;
  date?: string;
};

export function ArticleHeader({
  section,
  headline,
  subheadline,
  byline,
  date,
}: ArticleHeaderProps) {
  return (
    <View style={styles.header}>
      {section ? (
        <Text variant="label" tone="link">
          {section}
        </Text>
      ) : null}
      <Text variant="heading1" accessibilityRole="header">
        {headline}
      </Text>
      {subheadline ? (
        <Text variant="subheadline" tone="secondary">
          {subheadline}
        </Text>
      ) : null}
      {byline ? (
        <Text variant="meta" tone="secondary">
          {byline}
        </Text>
      ) : null}
      {date ? (
        <Text variant="meta" tone="secondary">
          {date}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
});
