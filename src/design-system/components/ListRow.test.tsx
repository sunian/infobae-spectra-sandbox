import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('shows the label', async () => {
    await render(<ListRow label="Colombia" onPress={() => {}} />);
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  it('shows the optional value', async () => {
    await render(<ListRow label="Edition" value="Perú" onPress={() => {}} />);
    expect(screen.getByText('Perú')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<ListRow label="Colombia" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Colombia'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has the button role', async () => {
    await render(<ListRow label="Colombia" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: /Colombia/ })).toBeTruthy();
  });

  it('reports a selected state only when selected', async () => {
    await render(
      <>
        <ListRow label="On" selected onPress={() => {}} />
        <ListRow label="Off" onPress={() => {}} />
      </>,
    );
    expect(screen.getByRole('button', { name: /On/, selected: true })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Off/, selected: true })).toBeNull();
  });
});
