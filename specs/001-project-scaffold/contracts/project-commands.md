# Contract: Project Commands

The scaffold exposes these commands to developers and to CI. Each exits 0 on success and non-zero
on failure.

| Command | Purpose | Gate |
|---------|---------|------|
| `npm install` | Install dependencies | Setup |
| `npm start` | Start the dev server for Android and iOS | Run |
| `npm run lint` | ESLint over the whole codebase | Before push |
| `npm run typecheck` | `tsc --noEmit` (strict) | Before push |
| `npm test` | All unit tests | Before push |
| `npm run verify` | lint + typecheck + test | Before push |
| `npm run test:e2e` | All Maestro screenshot flows | Before PR merge |

## Tab shell contract

The tab bar shows 5 tabs in this order: Home, My Infobae, Media, Chat, Menu. Each tab route renders
one placeholder screen. Labels come from `en.json` keys `tabs.home`, `tabs.myInfobae`, `tabs.media`,
`tabs.chat`, `tabs.menu`. Each placeholder shows the same label as its tab.
