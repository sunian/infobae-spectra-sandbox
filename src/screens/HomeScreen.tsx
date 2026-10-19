import { Placeholder } from '@/design-system';
import { t } from '@/localization';
import { useEdition } from '@/state/EditionContext';

export function HomeScreen() {
  const { edition } = useEdition();
  return (
    <Placeholder labelKey="tabs.home" detail={edition ? t(`editions.${edition}`) : undefined} />
  );
}
