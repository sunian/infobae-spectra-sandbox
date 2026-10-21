import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Screen } from './Screen';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

const mockSafeAreaView = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    SafeAreaView: (props: { children: unknown }) => {
      mockSafeAreaView(props);
      return <View>{props.children as never}</View>;
    },
  };
});

describe('Screen', () => {
  beforeEach(() => mockSafeAreaView.mockClear());

  it('pads every edge by default', async () => {
    await render(
      <Screen>
        <Text>x</Text>
      </Screen>,
    );
    expect(mockSafeAreaView.mock.calls[0][0].edges).toBeUndefined();
  });

  it('passes the edges it is given, so a native header is not padded twice', async () => {
    await render(
      <Screen edges={['left', 'right', 'bottom']}>
        <Text>x</Text>
      </Screen>,
    );
    expect(mockSafeAreaView.mock.calls[0][0].edges).toEqual(['left', 'right', 'bottom']);
  });
});

describe.each(SCHEMES)('Screen in the %s scheme', (scheme, palette) => {
  it('uses the background color', async () => {
    mockSafeAreaView.mockClear();
    await render(
      <ThemeProvider scheme={scheme}>
        <Screen>
          <Text>x</Text>
        </Screen>
      </ThemeProvider>,
    );
    const style = StyleSheet.flatten(mockSafeAreaView.mock.calls[0][0].style);
    expect(style.backgroundColor).toBe(palette.background);
  });
});
