import { fireEvent, render, screen } from '@testing-library/react-native';

import { Banner } from './Banner';

describe('Banner', () => {
  it('shows the message', async () => {
    await render(<Banner message="We could not refresh." />);
    expect(screen.getByText('We could not refresh.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onDismiss when it is tapped, if given', async () => {
    const onDismiss = jest.fn();
    await render(<Banner message="We could not refresh." onDismiss={onDismiss} />);
    await fireEvent.press(screen.getByRole('button', { name: 'We could not refresh.' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('announces itself to screen readers', async () => {
    await render(<Banner message="We could not refresh." />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
