import { fireEvent, render, screen } from '@testing-library/react-native';

import { FeedItemCard } from './FeedItemCard';

const base = {
  headline: 'El Gobierno anunció nuevas medidas',
  summary: 'Se conocieron los detalles del plan.',
  meta: 'Ana Pérez · 5 min',
  imageUrl: 'https://x/y.jpg',
  accessibilityLabel: 'El Gobierno anunció nuevas medidas. Ana Pérez, 5 min',
  onPress: () => {},
};

describe('FeedItemCard', () => {
  it('shows the headline, the summary, the meta line and the thumbnail', async () => {
    await render(<FeedItemCard {...base} />);
    expect(screen.getByText(base.headline)).toBeTruthy();
    expect(screen.getByText(base.summary)).toBeTruthy();
    expect(screen.getByText(base.meta)).toBeTruthy();
    expect(screen.getByTestId('thumbnail-image').props.source).toEqual({ uri: base.imageUrl });
  });

  it('shows no summary element when there is no summary', async () => {
    await render(<FeedItemCard {...base} summary={undefined} />);
    expect(screen.queryByText(base.summary)).toBeNull();
    expect(screen.getAllByText(/./)).toHaveLength(2);
  });

  it('treats an empty summary as no summary', async () => {
    await render(<FeedItemCard {...base} summary="" />);
    expect(screen.getAllByText(/./)).toHaveLength(2);
  });

  it('shows no meta element when the meta line is empty', async () => {
    await render(<FeedItemCard {...base} meta="" />);
    expect(screen.queryByText(base.meta)).toBeNull();
    expect(screen.getAllByText(/./)).toHaveLength(2);
  });

  it('shows the placeholder when there is no image', async () => {
    await render(<FeedItemCard {...base} imageUrl={undefined} />);
    expect(screen.getByTestId('thumbnail-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('thumbnail-image')).toBeNull();
  });

  it('limits the headline and the summary to 3 lines', async () => {
    await render(<FeedItemCard {...base} />);
    expect(screen.getByText(base.headline).props.numberOfLines).toBe(3);
    expect(screen.getByText(base.summary).props.numberOfLines).toBe(3);
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<FeedItemCard {...base} onPress={onPress} />);
    await fireEvent.press(screen.getByText(base.headline));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is a button with the accessibility label', async () => {
    await render(<FeedItemCard {...base} />);
    expect(screen.getByRole('button', { name: base.accessibilityLabel })).toBeTruthy();
  });
});
