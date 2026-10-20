import { render, screen } from '@testing-library/react-native';

import { ListHeader } from './ListHeader';

describe('ListHeader', () => {
  it('shows the title as a header', async () => {
    await render(<ListHeader title="Colombia" />);
    expect(screen.getByRole('header', { name: 'Colombia' })).toBeTruthy();
  });
});
