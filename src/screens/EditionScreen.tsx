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
  const { setEdition } = useEdition();
  const title = mode === 'change' ? t('editionSelect.changeTitle') : t('editionSelect.title');

  // US3 (T028): in `change` mode, mark the current edition and go back after a pick.
  return (
    <Screen>
      <Text variant="title">{title}</Text>
      <OptionList
        options={OPTIONS}
        onSelect={(key) => {
          const edition = getEdition(key);
          if (edition) setEdition(edition.id);
        }}
      />
    </Screen>
  );
}
