import { render, screen } from '@testing-library/react-native';

import { ArticleHeader } from './ArticleHeader';

const full = {
  section: 'Colombia',
  headline: 'Un titular muy largo que no debe acortarse en la pantalla de detalle de la nota',
  subheadline: 'La bajada de la nota',
  byline: 'By Ana Pérez, Luis Gómez',
  date: '19 oct 2026, 13:47',
};

describe('ArticleHeader', () => {
  it('shows every part it is given', async () => {
    await render(<ArticleHeader {...full} />);
    for (const text of Object.values(full)) {
      expect(screen.getByText(text)).toBeTruthy();
    }
  });

  it('marks the headline as a header', async () => {
    await render(<ArticleHeader {...full} />);
    expect(screen.getByRole('header', { name: full.headline })).toBeTruthy();
  });

  it('does not shorten the headline or the subheadline', async () => {
    await render(<ArticleHeader {...full} />);
    expect(screen.getByText(full.headline).props.numberOfLines).toBeUndefined();
    expect(screen.getByText(full.subheadline).props.numberOfLines).toBeUndefined();
  });

  it('leaves out each optional part that is absent', async () => {
    await render(<ArticleHeader headline="Solo titular" />);
    expect(screen.getAllByText(/./)).toHaveLength(1);
  });

  it('treats empty strings as absent', async () => {
    await render(<ArticleHeader headline="H" section="" subheadline="" byline="" date="" />);
    expect(screen.getAllByText(/./)).toHaveLength(1);
  });
});
