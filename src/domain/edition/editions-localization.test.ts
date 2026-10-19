import { t } from '@/localization';

import { EDITIONS } from '../infobae/editions';

const EXPECTED = [
  ['argentina', 'Argentina'],
  ['estados-unidos', 'Estados Unidos'],
  ['colombia', 'Colombia'],
  ['espana', 'España'],
  ['mexico', 'México'],
  ['peru', 'Perú'],
  ['cuba', 'Cuba'],
  ['centroamerica', 'Centroamérica'],
  ['mundo', 'Mundo'],
] as const;

describe('editions and localization', () => {
  it('offers exactly nine editions, in the order of FR-002', () => {
    expect(EDITIONS.map((edition) => [edition.id, edition.name])).toEqual(EXPECTED);
  });

  it.each(EXPECTED)('has a localized name for %s that equals the edition name', (id, name) => {
    expect(t(`editions.${id}`)).toBe(name);
  });
});
