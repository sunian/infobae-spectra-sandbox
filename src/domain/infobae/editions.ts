export type EditionId =
  | 'argentina'
  | 'estados-unidos'
  | 'colombia'
  | 'espana'
  | 'mexico'
  | 'peru'
  | 'cuba'
  | 'centroamerica'
  | 'mundo';

export type Edition = {
  id: EditionId;
  /** Spanish display name, as shown on infobae.com. */
  name: string;
  /** Site section paths to include. Empty means "every section not excluded". */
  includePaths: readonly string[];
  /** Site section paths to leave out. */
  excludePaths: readonly string[];
};

const CENTROAMERICA_PATHS = [
  '/el-salvador',
  '/nicaragua',
  '/honduras',
  '/guatemala',
  '/republica-dominicana',
  '/panama',
  '/costa-rica',
] as const;

// Argentina is the site root. It has no section of its own, so it is every section that
// does not belong to another edition. Global sections such as /tecno and /salud stay in.
const ARGENTINA_EXCLUDES = [
  '/estados-unidos',
  '/colombia',
  '/espana',
  '/mexico',
  '/peru',
  '/cuba',
  '/america',
  ...CENTROAMERICA_PATHS,
] as const;

export const EDITIONS: readonly Edition[] = [
  { id: 'argentina', name: 'Argentina', includePaths: [], excludePaths: ARGENTINA_EXCLUDES },
  { id: 'estados-unidos', name: 'Estados Unidos', includePaths: ['/estados-unidos'], excludePaths: [] },
  { id: 'colombia', name: 'Colombia', includePaths: ['/colombia'], excludePaths: [] },
  { id: 'espana', name: 'España', includePaths: ['/espana'], excludePaths: [] },
  { id: 'mexico', name: 'México', includePaths: ['/mexico'], excludePaths: [] },
  { id: 'peru', name: 'Perú', includePaths: ['/peru'], excludePaths: [] },
  { id: 'cuba', name: 'Cuba', includePaths: ['/cuba'], excludePaths: [] },
  { id: 'centroamerica', name: 'Centroamérica', includePaths: CENTROAMERICA_PATHS, excludePaths: [] },
  { id: 'mundo', name: 'Mundo', includePaths: ['/america'], excludePaths: [] },
];

export function getEdition(id: string): Edition | undefined {
  return EDITIONS.find((edition) => edition.id === id);
}
