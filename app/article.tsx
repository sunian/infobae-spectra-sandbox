import { useLocalSearchParams } from 'expo-router';

import { ArticleScreen } from '@/screens/ArticleScreen';

export default function ArticleRoute() {
  const { path } = useLocalSearchParams<{ path?: string }>();
  return <ArticleScreen path={path ?? ''} />;
}
