import { useRouter } from 'expo-router';

import { OptionList, Screen, Text } from '@/design-system';
import { EDITIONS, getEdition } from '@/domain/infobae/editions';
import { t } from '@/localization';
import { useEdition } from '@/state/EditionContext';

type EditionScreenProps = {
  mode: 'first-launch' | 'change';
};

const OPTIONS = EDITIONS.map((edition) => ({
  key: edition.id,
  label: t(`editions.${edition.id}`),
}));

export function EditionScreen({ mode }: EditionScreenProps) {
  const { edition, setEdition } = useEdition();
  const router = useRouter();

  const onSelect = (key: string) => {
    const chosen = getEdition(key);
    if (!chosen) return;
    setEdition(chosen.id);
    // First launch: the route guards show the tabs once an edition is chosen.
    if (mode === 'change') router.back();
  };

  return (
    <Screen>
      {/* In `change` mode the stack header shows the title and the back arrow. */}
      {mode === 'first-launch' ? <Text variant="title">{t('editionSelect.title')}</Text> : null}
      <OptionList
        options={OPTIONS}
        selectedKey={mode === 'change' ? (edition ?? undefined) : undefined}
        onSelect={onSelect}
      />
    </Screen>
  );
}
