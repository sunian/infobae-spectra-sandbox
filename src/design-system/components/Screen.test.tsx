import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Screen } from './Screen';

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
