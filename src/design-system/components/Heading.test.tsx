import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Heading } from './Heading';

async function sizeOf(level: number) {
  await render(<Heading level={level}>{`Level ${level}`}</Heading>);
  return StyleSheet.flatten(screen.getByText(`Level ${level}`).props.style).fontSize as number;
}

describe('Heading', () => {
  it('is a header for screen readers', async () => {
    await render(<Heading level={2}>Subtítulo</Heading>);
    expect(screen.getByRole('header', { name: 'Subtítulo' })).toBeTruthy();
  });

  it('gets smaller from level 1 to level 4', async () => {
    const sizes = [await sizeOf(1), await sizeOf(2), await sizeOf(3), await sizeOf(4)];
    expect(sizes[0]).toBeGreaterThan(sizes[1]);
    expect(sizes[1]).toBeGreaterThan(sizes[2]);
    expect(sizes[2]).toBeGreaterThan(sizes[3]);
  });

  it('uses the smallest size for levels 5 and 6', async () => {
    const smallest = await sizeOf(4);
    expect(await sizeOf(5)).toBe(smallest);
    expect(await sizeOf(6)).toBe(smallest);
  });

  it('uses the nearest valid level for a level outside 1 to 6', async () => {
    const biggest = await sizeOf(1);
    const smallest = await sizeOf(4);
    expect(await sizeOf(0)).toBe(biggest);
    expect(await sizeOf(-3)).toBe(biggest);
    expect(await sizeOf(9)).toBe(smallest);
  });
});
