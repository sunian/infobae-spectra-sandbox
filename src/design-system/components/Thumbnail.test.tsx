import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Thumbnail } from './Thumbnail';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

const aspectOf = () => StyleSheet.flatten(screen.getByTestId('thumbnail').props.style).aspectRatio;

describe('Thumbnail', () => {
  it('shows the image for a uri', async () => {
    await render(<Thumbnail uri="https://x/y.jpg" />);
    expect(screen.getByTestId('thumbnail-image').props.source).toEqual({ uri: 'https://x/y.jpg' });
    expect(screen.queryByTestId('thumbnail-placeholder')).toBeNull();
  });

  it('shows the placeholder when there is no uri', async () => {
    await render(<Thumbnail />);
    expect(screen.getByTestId('thumbnail-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('thumbnail-image')).toBeNull();
  });

  it('shows the placeholder after the image fails to load', async () => {
    await render(<Thumbnail uri="https://x/y.jpg" />);
    await fireEvent(screen.getByTestId('thumbnail-image'), 'error');
    expect(screen.getByTestId('thumbnail-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('thumbnail-image')).toBeNull();
  });

  it('keeps the same aspect ratio in all three cases', async () => {
    await render(<Thumbnail uri="https://x/y.jpg" aspectRatio={2} />);
    expect(aspectOf()).toBe(2);
    await fireEvent(screen.getByTestId('thumbnail-image'), 'error');
    expect(aspectOf()).toBe(2);
    await render(<Thumbnail aspectRatio={2} />);
    expect(aspectOf()).toBe(2);
  });

  it('uses 3 to 2 by default', async () => {
    await render(<Thumbnail />);
    expect(aspectOf()).toBe(3 / 2);
  });

  it('forgets a failed image when the uri changes', async () => {
    const view = await render(<Thumbnail uri="https://x/a.jpg" />);
    await fireEvent(screen.getByTestId('thumbnail-image'), 'error');
    await view.rerender(<Thumbnail uri="https://x/b.jpg" />);
    expect(screen.getByTestId('thumbnail-image').props.source).toEqual({ uri: 'https://x/b.jpg' });
  });
});

describe.each(SCHEMES)('Thumbnail in the %s scheme', (scheme, palette) => {
  it('uses the placeholder color for its box', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <Thumbnail />
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByTestId('thumbnail').props.style).backgroundColor).toBe(
      palette.placeholder,
    );
  });
});
