import { StyleSheet, View } from 'react-native';

import { t } from '../../localization';
import { Screen } from './Screen';
import { Text } from './Text';

type PlaceholderProps = {
  labelKey: string;
  detail?: string;
};

export function Placeholder({ labelKey, detail }: PlaceholderProps) {
  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="title">{t(labelKey)}</Text>
        {detail ? <Text>{detail}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
