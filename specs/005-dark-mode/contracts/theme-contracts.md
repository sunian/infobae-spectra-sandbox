# Contracts: Dark Mode

> **TL;DR:** Internal interfaces only: a preference module, a state hook, a design system theme API, and the Menu and Theme screen behavior. No server or API change. **Check this:** The Theme screen behavior in section 5.

This feature has no server. These are the interfaces between modules. Types are in
[data-model.md](../data-model.md).

## 1. Preference module (`src/domain/theme/preference.ts`)

```ts
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'preferences.theme';
export const THEME_PREFERENCES: readonly ThemePreference[]; // order: system, light, dark

parseThemePreference(raw: unknown): ThemePreference;          // unknown -> 'system'
loadThemePreference(storage: KeyValueStorage): Promise<ThemePreference>; // never rejects
saveThemePreference(storage: KeyValueStorage, p: ThemePreference): Promise<boolean>; // never rejects
resolveScheme(p: ThemePreference, system: ColorScheme | null | undefined): ColorScheme;
```

All functions are pure apart from the storage calls.

## 2. Theme state (`src/state/ThemeContext.tsx`)

```ts
<ThemeProvider storage?: KeyValueStorage>{children}</ThemeProvider>
useThemePreference(): ThemeState; // throws outside a provider, like useEdition
```

- Reads the phone scheme with `useColorScheme()`.
- Renders the design system `ThemeProvider` with the resolved scheme.
- `setPreference` updates state first, then saves. Several calls in a row end on the last one.
- Sits beside `EditionProvider` in the root layout. Neither depends on the other.

## 3. Design system theme API (`src/design-system/theme.tsx`, `tokens.ts`)

```ts
export const lightColors: ColorPalette;
export const darkColors: ColorPalette;
export type ColorPalette = Record<PaletteKey, string>;

<ThemeProvider scheme={ColorScheme}>{children}</ThemeProvider>
useColors(): ColorPalette;            // light palette when no provider
useColorSchemeName(): ColorScheme;    // 'light' when no provider
useThemedStyles<T>(factory: (c: ColorPalette) => T): T; // memoized by palette
```

- The static `colors` export no longer exists.
- Screens and routes never import a palette. They use components, or `useColors()` for native
  options such as header colors.

## 4. Navigation theme (`src/navigation/navigationTheme.ts`)

```ts
navigationTheme(scheme: ColorScheme, colors: ColorPalette): NavigationTheme;
```

Maps `background`, `surface` (card), `textPrimary` (text), `border`, and `tabActive` (primary).

## 5. UI behavior

**Menu** (`MenuScreen`): shows two rows, Edition and Theme. The Theme row shows its current choice
name (System, Light, or Dark) as the value. A tap opens `/change-theme`.

**Theme screen** (`ThemeScreen`, route `change-theme`):

- Native header title is "Theme" with a back arrow.
- `OptionList` with three rows in the order System, Light, Dark. The current choice is marked.
- A tap on a row calls `setPreference`, then goes back. The new theme shows on the way back.
- Leaving with the back arrow changes nothing.
- A tap on the current row changes nothing and shows no error.
- Each row has the `button` role and a `selected` state, as in the edition list.

**Localization keys** (`src/localization/en.json`): `menu.theme` ("Theme"), `themeSelect.title`
("Theme"), `theme.system` ("System"), `theme.light` ("Light"), `theme.dark` ("Dark").

## 6. Native configuration

- `app.json`: `expo.userInterfaceStyle` is `automatic`. The splash plugin has a dark background
  variant (name to verify, see research R6).
- `StatusBar` style: `light` for the dark scheme, `dark` for the light scheme.
