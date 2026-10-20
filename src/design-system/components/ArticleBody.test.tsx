import { render, screen } from '@testing-library/react-native';

import { ArticleBody } from './ArticleBody';
import { Text } from './Text';

describe('ArticleBody', () => {
  it('shows its children in order inside a scroll view', async () => {
    await render(
      <ArticleBody>
        <Text>Uno</Text>
        <Text>Dos</Text>
        <Text>Tres</Text>
      </ArticleBody>,
    );
    expect(screen.getByTestId('article-body')).toBeTruthy();
    expect(screen.getAllByText(/./).map((node) => node.props.children)).toEqual([
      'Uno',
      'Dos',
      'Tres',
    ]);
  });
});
