# Data Model: Edition Selection

## Edition (exists)

Defined in `src/domain/infobae/editions.ts`. The list is fixed in the app.

| Field | Type | Notes |
|---|---|---|
| `id` | `EditionId` | Stable id: `argentina`, `estados-unidos`, `colombia`, `espana`, `mexico`, `peru`, `cuba`, `centroamerica`, `mundo`. This is the value that is saved. |
| `name` | string | Spanish display name. The screens do not read it. They read `editions.<id>` from `en.json`. A unit test keeps the two equal. |
| `includePaths`, `excludePaths` | string lists | Section filters for the feed. Not used by this feature. The Home feed uses them. |

Rules:

- Ids are unique (already tested).
- `getEdition(id)` returns nothing for an unknown id. This is the check that makes an old saved edition
  count as "no choice" (FR-006).

## Selected Edition Preference

The reader's one saved choice. Device-local only.

| Part | Value |
|---|---|
| Storage key | `preferences.edition` |
| Stored value | The edition id as a plain string, for example `colombia` |
| Empty state | The key is absent |

Validation, applied on every read (`parseStoredEdition`):

| Stored value | Result |
|---|---|
| A string equal to a known edition id | that edition id |
| Absent (`null`) | no edition |
| Empty string, a string with spaces or other text that is not an id, an unknown id | no edition |
| Any value that is not a string | no edition |
| The storage read throws | no edition |

The saved value is never repaired in place. A bad value is ignored, and it is overwritten when the reader chooses.

## Edition State (in memory)

Held by `EditionProvider` and read through `useEdition()`.

| Field | Type | Meaning |
|---|---|---|
| `status` | `'loading' \| 'ready'` | `loading` until the first read ends, whatever the result |
| `edition` | `EditionId \| null` | The selected edition. `null` means the reader has not chosen. Only meaningful when `status` is `ready`. |
| `setEdition(id)` | function | Sets the edition in memory first, then saves it. |

State transitions:

```text
start ──read──> loading ──read ends──> ready(edition = saved id or null)
ready(null) ──setEdition(id)──> ready(id)         first launch
ready(a)    ──setEdition(b)──> ready(b)           change from Menu
ready(a)    ──setEdition(a)──> ready(a)           same choice, no visible change
```

Rules:

- A failed save does not change the state. The in-memory edition stays as chosen (FR-012).
- The state leaves `loading` exactly once per launch.
- The save writes only after a `setEdition` call. Opening the list and leaving writes nothing (FR-010, T5).
