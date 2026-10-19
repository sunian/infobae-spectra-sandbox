import { useRouter } from 'expo-router';

import { ListRow, Screen, Text } from '@/design-system';
import { t } from '@/localization';
import { useEdition } from '@/state/EditionContext';

export function MenuScreen() {
  const { edition } = useEdition();
  const router = useRouter();

  return (
    <Screen>
      <Text variant="title">{t('tabs.menu')}</Text>
      <ListRow
        label={t('menu.edition')}
        value={edition ? t(`editions.${edition}`) : undefined}
        onPress={() => router.push('/change-edition')}
      />
    </Screen>
  );
}
