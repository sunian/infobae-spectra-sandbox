import { render, screen } from '@testing-library/react-native';

import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  it('shows the localized label', async () => {
    await render(<Placeholder labelKey="tabs.media" />);
    expect(screen.getByText('Media')).toBeTruthy();
  });
});
