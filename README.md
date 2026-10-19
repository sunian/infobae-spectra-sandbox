# Infobae

Mobile news reader (React Native, Expo, TypeScript). See `docs/PROJECT_GUIDE.md` for the layout,
rules, and quality gates.

```bash
npm install
npm start          # then press a (Android) or i (iOS)
npm run verify     # lint + typecheck + unit tests (before a push)
npm run test:e2e   # Maestro screenshot tests (before a PR merge)
```

The app reads the live Infobae APIs. Tests and the screenshot build use bundled fixture data
instead (`EXPO_PUBLIC_CONTENT_SOURCE=fixture`). `npm run build:android:release:live` builds a release
app with the live APIs. See "Content sources" in `docs/PROJECT_GUIDE.md`.
