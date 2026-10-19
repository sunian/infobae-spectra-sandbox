import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ArticleImage } from './ArticleImage';

describe('ArticleImage', () => {
  it('shows the image with the aspect ratio from the props', async () => {
    await render(<ArticleImage uri="https://x/y.jpg" aspectRatio={2} />);
    expect(screen.getByTestId('thumbnail-image').props.source).toEqual({ uri: 'https://x/y.jpg' });
    expect(StyleSheet.flatten(screen.getByTestId('thumbnail').props.style).aspectRatio).toBe(2);
  });

  it('uses 16 to 9 when no aspect ratio is given', async () => {
    await render(<ArticleImage uri="https://x/y.jpg" />);
    expect(StyleSheet.flatten(screen.getByTestId('thumbnail').props.style).aspectRatio).toBe(
      16 / 9,
    );
  });

  it('shows the caption when there is one, and not otherwise', async () => {
    const view = await render(<ArticleImage uri="https://x/y.jpg" caption="Una foto (Infobae)" />);
    expect(screen.getByText('Una foto (Infobae)')).toBeTruthy();
    await view.rerender(<ArticleImage uri="https://x/y.jpg" caption="" />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it('labels the image for screen readers from the alt text', async () => {
    await render(<ArticleImage uri="https://x/y.jpg" altText="Una avioneta" />);
    expect(screen.getByLabelText('Una avioneta')).toBeTruthy();
  });

  it('shows the placeholder when the image fails to load', async () => {
    await render(<ArticleImage uri="https://x/y.jpg" />);
    await fireEvent(screen.getByTestId('thumbnail-image'), 'error');
    expect(screen.getByTestId('thumbnail-placeholder')).toBeTruthy();
  });
});
