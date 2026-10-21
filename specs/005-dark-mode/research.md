# Research: Dark Mode

> **TL;DR:** Nine decisions, no open clarification. Use two palettes behind one React context, read the phone scheme with `useColorScheme`, save a three-value choice, and show it from a Menu row that opens a list. The biggest risk is the native splash (R6). **Check this:** R1 (`app.json` to `automatic`), R5 (list screen, not an inline control), R6 (splash follows the phone).

Facts about the code come from reading `src/design-system/tokens.ts`, `app/_layout.tsx`, and
`app.json`. Items marked **verify** need a quick check when the code is written.

## R1. How the app learns the phone scheme

- **Decision**: Use `useColorScheme()` from `react-native`. Change `userInterfaceStyle` in
  `app.json` from `"light"` to `"automatic"`.
- **Rationale**: With `"light"`, the OS locks the app to light and the hook always returns `light`.
  `"automatic"` lets the hook report the phone setting and update when it changes (FR-002, FR-003).
  This is a native config change. A new build is needed, and Expo Go is not enough to prove it.
- **Alternatives**: `expo-system-ui` or `Appearance.addChangeListener` by hand. The hook already
  does this and needs no package.

## R2. Palette shape

- **Decision**: `lightColors` keeps today's nine values. `darkColors` has the same nine keys:
  `background`, `surface`, `textPrimary`, `textSecondary`, `tabActive`, `tabInactive`, `border`,
  `placeholder`, `link`. The type `ColorPalette` is `Record<keyof typeof lightColors, string>`. The
  static `colors` export is removed, so no code can read a color without a theme.
- **Rationale**: Same keys mean components change how they read colors, not which colors they read.
  Keeping light values unchanged means the light Maestro baselines stay valid. Removing `colors`
  makes the compiler find every missed component (FR-004).
- **Proposed dark values** (to tune in design review; all must pass R9 contrast): `background`
  `#121212`, `surface` `#1E1E1E`, `textPrimary` `#F2F2F2`, `textSecondary`
  `#A8A8A8`, `tabActive` `#6EA2FF`, `tabInactive` `#8A8A8A`, `border` `#2E2E2E`, `placeholder`
  `#2A2A2A`, `link` `#6EA2FF`.
- **Alternatives**: Semantic role tokens with a theme-by-name map. More flexible, but the app has
  nine colors, so it is more structure than needed. Revisit if a theme beyond two is requested.

## R3. Theme provider and style access

- **Decision**: `ThemeProvider({ scheme, children })` in the design system. `useColors()` returns the
  palette. `useThemedStyles(factory)` returns `StyleSheet.create(factory(colors))` memoized by
  palette. Without a provider, `useColors()` returns `lightColors`.
- **Rationale**: Components today build styles once at import with `StyleSheet.create`. They must now
  build styles per palette. A memoized factory keeps the code close to today's shape. The light
  default keeps existing component tests valid without wrapping each one.
- **Alternatives**: Pass the palette as a prop through every screen (noisy). Use a global mutable
  palette (does not re-render).

## R4. Preference logic and storage

- **Decision**: `ThemePreference` is `'system' | 'light' | 'dark'`. Key `preferences.theme`. Functions
  `parseThemePreference`, `loadThemePreference`, `saveThemePreference`, and
  `resolveScheme(preference, system)`. They copy the edition module: never reject, an unknown or
  unreadable value becomes `system` (FR-009), a failed write returns `false` (FR-010).
  `resolveScheme` returns the system scheme for `system`, falls back to `light` when the system gives
  none, and returns `light` or `dark` as chosen.
- **Rationale**: Constitution III wants business logic unit tested. Reusing the edition shape keeps
  one idiom for preferences. The `KeyValueStorage` type is imported from the edition module (two
  uses now; move it to a shared file if a third appears).
- **Alternatives**: Store the resolved scheme. Wrong, because a stored `dark` would stop following
  the phone.

## R5. Where the setting lives

- **Decision**: A Theme row in the Menu, under the Edition row, shows the current choice. A tap opens
  a `change-theme` route. It shows `OptionList` with System, Light, Dark and a mark on the current
  one. A tap on an option applies it and goes back, like the edition list.
- **Rationale**: It reuses `ListRow` and `OptionList`. Constitution I forbids one-off views, and this
  path needs no new component. Taps from a fresh Menu: Menu tab, Theme row, option = 3 (SC-003).
- **Alternatives**: An inline segmented control on the Menu. 2 taps, and the change shows at once on
  the same screen, but it needs a new design system component. Kept as deferred work.

## R6. Splash screen and first frame

- **Decision**: Keep the splash up until both the edition and the theme are read. Set a dark
  background for the splash in `app.json` with the plugin's `dark` option. **Checked (T001)**: the
  plugin takes `backgroundColor` and `dark: { backgroundColor }` (`expo-splash-screen` plugin types).
- **Rationale**: This prevents a wrong-theme frame from the app itself (FR-008) and covers phone Dark
  with choice System (US1 AC5).
- **Known gap**: The native splash follows the phone only. With phone Light and choice Dark, the
  splash is light, then the app is dark. The reverse also happens. The app cannot change the native
  splash color at runtime. The spec lists "no flash from the first visible screen", and the splash is
  outside the app's drawn screens, so this is accepted. The reviewer must confirm (see Check this).
- **Alternatives**: A custom in-app splash view in the chosen theme. It adds a second splash and a
  JS flash risk, so it is not worth it for this edge.

## R7. Status bar and navigation chrome

- **Decision**: `StatusBar style` is `light` when the active scheme is dark and `dark` otherwise.
  Do not use `auto`, because it follows the phone, not the override. Build a navigation theme from
  the palette in `src/navigation/navigationTheme.ts` and give it to the router's `ThemeProvider`.
  **Checked (T001)**: `expo-router` 58 exports `ThemeProvider`, `DefaultTheme`, and the `Theme`
  type, so no extra package is needed. The fallback (per-screen `contentStyle`) is not needed.
- **Rationale**: Navigation containers paint their own background. Without a theme, a dark app shows
  a white flash during a push or a pop. The header and tab bar colors come from the same palette
  (FR-012).
- **Alternatives**: Per-screen `contentStyle` only. Works, but easy to miss a screen.

## R8. Screenshot tests in dark

- **Decision**: Two Maestro passes. Pass 1 is the default (emulator day mode) and keeps today's
  baselines. It adds override flows: Menu, open Theme, choose Dark, check screenshots, relaunch
  without clearing state, check that Dark stays. Pass 2 runs flows tagged `dark` with the emulator in
  night mode (`adb shell cmd uimode night yes`) and choice System. It covers edition select, Home,
  Article, My Infobae, Media, Chat, Menu, and the Theme list, each against a `-dark.png` baseline.
  `record-baselines.sh` runs both passes and restores day mode. **Checked (T001)**: Maestro 2.11.0 has
  `--include-tags` and `--exclude-tags` on `maestro test`. The fallback folder is not needed.
- **Rationale**: Constitution IV and SC-006 need both themes per screen. The first-launch edition
  list has no Menu, so only the phone setting can make it dark. Night mode also proves "follow the
  phone" end to end.
- **Alternatives**: Run every flow twice with a manual override. It cannot reach the edition list
  and does not test the System path.

## R9. Contrast and article images

- **Decision**: A unit test computes the WCAG contrast ratio for each text and background pair in both
  palettes (`textPrimary`, `textSecondary`, `link`, and `tabActive` on `background` and on `surface`;
  `tabInactive` on `background`). Body text and links must reach 4.5:1. Large text and icons must
  reach 3:1. The test also checks that both palettes have the same keys. Images keep their own
  pixels. `Thumbnail` and `ArticleImage` show the palette `placeholder` while loading.
- **Rationale**: FR-011 and SC-005 need a repeatable check, not an eye check.
- **Note**: `tabInactive` at `#8A8A8A` on white is below 4.5:1 today. It is an inactive control. The
  test uses 3:1 for it. The reviewer can raise it.
- **Alternatives**: A manual contrast review only. It does not catch a later color change.
