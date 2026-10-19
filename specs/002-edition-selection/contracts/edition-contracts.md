# Contracts: Edition Selection

This feature exposes no network API. Its interfaces are routes, one storage key, one React hook, and
a set of localization keys. Later features (Home feed, Menu items) depend on them.

## 1. Routes

| Route | File | Reachable when | Shows |
|---|---|---|---|
| `/select-edition` | `app/select-edition.tsx` | No edition is chosen | `EditionScreen` in `first-launch` mode. No back arrow. |
| `/(tabs)` and every tab | `app/(tabs)/` | An edition is chosen | The five tabs, Home active first |
| `/change-edition` | `app/change-edition.tsx` | An edition is chosen | `EditionScreen` in `change` mode. Back arrow. Current edition marked. |

Guard rules (root `app/_layout.tsx`, `Stack.Protected`):

- `select-edition`: `guard = status is ready AND edition is null`
- `(tabs)`, `change-edition`: `guard = status is ready AND edition is not null`
- While `status` is `loading`, the layout renders nothing and the native splash screen stays visible.

Behavior:

- After a choice on `/select-edition`, the guard flips and the router shows the tabs. No manual
  navigation call is made.
- After a choice on `/change-edition`, the screen calls `router.back()`.
- Leaving `/change-edition` with the back action changes nothing and saves nothing.

## 2. Storage

| Item | Value |
|---|---|
| Key | `preferences.edition` |
| Value | An edition id string from `src/domain/infobae/editions.ts` |
| Written by | `saveEdition(storage, id)` in `src/domain/edition/preference.ts`, only after the reader picks |
| Read by | `loadEdition(storage)`, once at startup |

Module interface (`src/domain/edition/preference.ts`):

```ts
export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export const EDITION_STORAGE_KEY = 'preferences.edition';

export function parseStoredEdition(raw: unknown): EditionId | null;
export function loadEdition(storage: KeyValueStorage): Promise<EditionId | null>; // never rejects
export function saveEdition(storage: KeyValueStorage, id: EditionId): Promise<boolean>; // never rejects, false on failure
```

## 3. Hook

```ts
// src/state/EditionContext.tsx
export type EditionState =
  | { status: 'loading'; edition: null; setEdition: (id: EditionId) => void }
  | { status: 'ready'; edition: EditionId | null; setEdition: (id: EditionId) => void };

export function EditionProvider(props: { children: ReactNode; storage?: KeyValueStorage }): JSX.Element;
export function useEdition(): EditionState; // throws if used outside EditionProvider
```

- `storage` defaults to AsyncStorage. Tests pass a fake.
- `setEdition` is synchronous for the caller. It updates state at once and saves in the background.
- Later features read `useEdition().edition` and use `getEdition(edition)` for section filters.

## 4. Design system components (new)

```ts
// src/design-system/components/ListRow.tsx
type ListRowProps = { label: string; value?: string; selected?: boolean; onPress: () => void };

// src/design-system/components/OptionList.tsx
type Option = { key: string; label: string };
type OptionListProps = { options: readonly Option[]; selectedKey?: string; onSelect: (key: string) => void };
```

- The components take final display strings. The caller calls `t()`. This keeps the design system
  free of feature knowledge.
- `ListRow` sets an accessibility role of `button`, and a selected state when `selected` is true.
- `OptionList` scrolls, so every row is reachable on a small or rotated screen.
- `Placeholder` gets an optional `detail?: string` prop, shown under the label.

## 5. Localization keys (added to `src/localization/en.json`)

| Key | English text |
|---|---|
| `editionSelect.title` | Choose your edition |
| `editionSelect.changeTitle` | Change edition |
| `editions.argentina` | Argentina |
| `editions.estados-unidos` | Estados Unidos |
| `editions.colombia` | Colombia |
| `editions.espana` | España |
| `editions.mexico` | México |
| `editions.peru` | Perú |
| `editions.cuba` | Cuba |
| `editions.centroamerica` | Centroamérica |
| `editions.mundo` | Mundo |
| `menu.edition` | Edition |

Rule: there is one `editions.<id>` key for each edition id, with text equal to the edition's `name`.
A unit test enforces this.

## 6. Maestro contract

- `.maestro/shared/pick-edition.yaml` taps the edition `Colombia` and waits for the tabs. Every flow that
  starts from `launchApp` with `clearState: true` runs it next.
- Selectors use the exact displayed text. Edition names are unique as substrings, so a plain text match is safe.
