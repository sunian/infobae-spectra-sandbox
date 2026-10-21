import { useRouter } from 'expo-router';

import { OptionList, Screen } from '@/design-system';
import { THEME_PREFERENCES, parseThemePreference } from '@/domain/theme/preference';
import { t } from '@/localization';
import { useThemePreference } from '@/state/ThemeContext';

// The native header already sits below the status bar, so the top edge gets no padding.
const EDGES = ['left', 'right', 'bottom'] as const;

const OPTIONS = THEME_PREFERENCES.map((preference) => ({
  key: preference,
  label: t(`theme.${preference}`),
}));

export function ThemeScreen() {
  const { preference, setPreference } = useThemePreference();
  const router = useRouter();

  const onSelect = (key: string) => {
    setPreference(parseThemePreference(key));
    router.back();
  };

  return (
    <Screen edges={EDGES}>
      {/* The stack header shows the title and the back arrow. */}
      <OptionList options={OPTIONS} selectedKey={preference} onSelect={onSelect} />
    </Screen>
  );
}
