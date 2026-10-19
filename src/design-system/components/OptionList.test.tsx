import { fireEvent, render, screen } from '@testing-library/react-native';

import { OptionList } from './OptionList';

const OPTIONS = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Bravo' },
  { key: 'c', label: 'Charlie' },
];

describe('OptionList', () => {
  it('renders one row per option in the given order', async () => {
    await render(<OptionList options={OPTIONS} onSelect={() => {}} />);
    const rows = screen.getAllByRole('button');
    expect(rows).toHaveLength(3);
    expect(screen.getAllByText(/Alpha|Bravo|Charlie/).map((node) => node.props.children)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  it('calls onSelect with the key of the tapped option', async () => {
    const onSelect = jest.fn();
    await render(<OptionList options={OPTIONS} onSelect={onSelect} />);
    await fireEvent.press(screen.getByText('Bravo'));
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('marks only the row whose key equals selectedKey', async () => {
    await render(<OptionList options={OPTIONS} selectedKey="c" onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { selected: true })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Charlie/, selected: true })).toBeTruthy();
  });

  it('renders all nine options of a nine-item list', async () => {
    const nine = Array.from({ length: 9 }, (_, i) => ({ key: `k${i}`, label: `Item ${i}` }));
    await render(<OptionList options={nine} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
    expect(screen.getByText('Item 8')).toBeTruthy();
  });
});
