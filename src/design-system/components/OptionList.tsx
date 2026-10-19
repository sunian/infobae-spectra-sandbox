import { FlatList } from 'react-native';

import { ListRow } from './ListRow';

type Option = { key: string; label: string };

type OptionListProps = {
  options: readonly Option[];
  selectedKey?: string;
  onSelect: (key: string) => void;
};

export function OptionList({ options, selectedKey, onSelect }: OptionListProps) {
  return (
    <FlatList
      data={options}
      keyExtractor={(option) => option.key}
      renderItem={({ item }) => (
        <ListRow
          label={item.label}
          selected={item.key === selectedKey}
          onPress={() => onSelect(item.key)}
        />
      )}
    />
  );
}
