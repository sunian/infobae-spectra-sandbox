# Data Model: Dark Mode

> **TL;DR:** Three small types: a `ThemePreference` (saved), a `ColorScheme` (what is drawn), and a `ColorPalette` (nine colors per scheme). The saved value only ever holds the choice, never the result. **Check this:** The nine palette keys in the table.

## ThemePreference (saved)

`'system' | 'light' | 'dark'`

| Rule | Detail |
|---|---|
| Storage key | `preferences.theme` |
| Default | `system` (no saved value) |
| Invalid value | A missing, non-string, or unknown value reads as `system`. |
| Failed read | Reads as `system`. No error shows. |
| Failed write | The choice stays in memory for the session. No error shows. |

## ColorScheme (derived, not saved)

`'light' | 'dark'`

`resolveScheme(preference, system)`:

| `preference` | `system` | Result |
|---|---|---|
| `light` | any | `light` |
| `dark` | any | `dark` |
| `system` | `light` | `light` |
| `system` | `dark` | `dark` |
| `system` | none (`null` or `undefined`) | `light` |

## ColorPalette (design system)

One object per scheme (`lightColors`, `darkColors`) with exactly these keys:

| Key | Used for |
|---|---|
| `background` | Screen, header, and tab bar background |
| `surface` | Cards, banners, pressed rows, state views |
| `textPrimary` | Main text |
| `textSecondary` | Secondary text, labels |
| `tabActive` | Active tab, spinners, refresh control |
| `tabInactive` | Inactive tab |
| `border` | Dividers and outlines |
| `placeholder` | Image placeholder while loading |
| `link` | Links in body text |

## ThemeState (state layer)

| Field | Type | Meaning |
|---|---|---|
| `status` | `'loading' \| 'ready'` | `loading` until the saved choice is read. |
| `preference` | `ThemePreference` | The current choice. `system` while loading. |
| `scheme` | `ColorScheme` | What the app draws now. |
| `setPreference` | `(p: ThemePreference) => void` | Applies at once, then saves. |

## Transitions

- Launch: `loading` to `ready` when the saved choice is read (or fails to read).
- `setPreference(p)`: `preference` becomes `p` and `scheme` is recomputed in the same render. The
  save runs after. A failed save does not undo the change.
- Phone scheme changes: only `scheme` is recomputed, and only when `preference` is `system`.

## Relationships

- `ThemeState.scheme` feeds the design system `ThemeProvider`, which picks the `ColorPalette`.
- The theme choice and the edition choice (feature 002) are separate keys and separate providers
  (FR-015).
