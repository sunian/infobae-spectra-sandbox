import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { FlatList } from 'react-native';

import { FeedList, type FeedListHandle } from './FeedList';
import { Text } from './Text';
import { ThemeProvider } from '../theme';
import { darkColors, lightColors } from '../tokens';

const SCHEMES = [
  ['light', lightColors],
  ['dark', darkColors],
] as const;

type Row = { id: string; label: string };
const rows: Row[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];

function renderList(props: Partial<Parameters<typeof FeedList<Row>>[0]> = {}) {
  return render(
    <FeedList
      data={rows}
      keyExtractor={(row) => row.id}
      renderItem={(row) => <Text>{row.label}</Text>}
      {...props}
    />,
  );
}

describe('FeedList', () => {
  it('renders each item through renderItem, in order', async () => {
    await renderList();
    expect(screen.getAllByText(/Alpha|Beta/).map((node) => node.props.children)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });

  it('calls onEndReached when the end comes near', async () => {
    const onEndReached = jest.fn();
    await renderList({ onEndReached });
    await fireEvent(screen.getByTestId('feed-list'), 'endReached');
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('shows the footer and the header', async () => {
    await renderList({ footer: <Text>Footer</Text>, header: <Text>Header</Text> });
    expect(screen.getByText('Footer')).toBeTruthy();
    expect(screen.getByText('Header')).toBeTruthy();
  });

  it('tunes the list for long feeds', async () => {
    await renderList();
    const props = screen.getByTestId('feed-list').props;
    expect(props.onEndReachedThreshold).toBe(0.5);
    expect(props.windowSize).toBe(7);
    expect(props.removeClippedSubviews).toBe(true);
  });

  it('wires pull to refresh', async () => {
    const onRefresh = jest.fn();
    const view = await renderList({ refreshing: false, onRefresh });
    const control = screen.getByTestId('feed-list').props.refreshControl;
    expect(control.props.refreshing).toBe(false);
    await act(async () => control.props.onRefresh());
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await view.rerender(
      <FeedList
        data={rows}
        keyExtractor={(row) => row.id}
        renderItem={(row) => <Text>{row.label}</Text>}
        refreshing
        onRefresh={onRefresh}
      />,
    );
    expect(screen.getByTestId('feed-list').props.refreshControl.props.refreshing).toBe(true);
  });

  it('has no refresh control when onRefresh is not given', async () => {
    await renderList();
    expect(screen.getByTestId('feed-list').props.refreshControl).toBeUndefined();
  });

  it('scrolls to the top through its handle', async () => {
    const scroll = jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => {});
    const ref = createRef<FeedListHandle>();
    await renderList({ ref });
    ref.current?.scrollToTop();
    expect(scroll).toHaveBeenCalledWith({ offset: 0, animated: false });
    scroll.mockRestore();
  });
});

describe.each(SCHEMES)('FeedList in the %s scheme', (scheme, palette) => {
  it('colors the refresh control with the active tab color', async () => {
    await render(
      <ThemeProvider scheme={scheme}>
        <FeedList
          data={rows}
          keyExtractor={(row) => row.id}
          renderItem={(row) => <Text>{row.label}</Text>}
          onRefresh={() => {}}
        />
      </ThemeProvider>,
    );
    const control = screen.getByTestId('feed-list').props.refreshControl;
    expect(control.props.tintColor).toBe(palette.tabActive);
    expect(control.props.colors).toEqual([palette.tabActive]);
  });
});
