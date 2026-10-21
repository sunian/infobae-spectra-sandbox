import { useRouter } from 'expo-router';

import { ListRow, Screen, Text } from '@/design-system';
import { t } from '@/localization';
import { useEdition } from '@/state/EditionContext';
import { useThemePreference } from '@/state/ThemeContext';

export function MenuScreen() {
  const { edition } = useEdition();
  const { preference } = useThemePreference();
  const router = useRouter();

  return (
    <Screen>
      <Text variant="title">{t('tabs.menu')}</Text>
      <ListRow
        label={t('menu.edition')}
        value={edition ? t(`editions.${edition}`) : undefined}
        onPress={() => router.push('/change-edition')}
      />
      <ListRow
        label={t('menu.theme')}
        value={t(`theme.${preference}`)}
        onPress={() => router.push('/change-theme')}
      />
    </Screen>
  );
}
