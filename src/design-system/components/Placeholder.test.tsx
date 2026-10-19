import { render, screen } from '@testing-library/react-native';

import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  it('shows the localized label', async () => {
    await render(<Placeholder labelKey="tabs.media" />);
    expect(screen.getByText('Media')).toBeTruthy();
  });

  it('shows an optional detail line under the label', async () => {
    await render(<Placeholder labelKey="tabs.home" detail="Colombia" />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  it('shows no extra text when no detail is given', async () => {
    await render(<Placeholder labelKey="tabs.home" />);
    expect(screen.queryByText('Colombia')).toBeNull();
    expect(screen.getAllByText(/./)).toHaveLength(1);
  });
});
