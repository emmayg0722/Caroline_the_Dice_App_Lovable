# Caroline Development Instructions

## Product direction

Caroline is being redesigned from a drinking-game dice app into a general
social party game, "Caroline – Party Dice." Alcohol consumption must not be
a game mechanic, reward, punishment, instruction, theme, or hidden feature.

## Mandatory restrictions

Remove and do not introduce:

- drinking challenges or alcohol instructions
- sip, shot, beer, wine, alcohol, drunk, drinking game, bottoms up, cheers, or equivalent wording
- beer, wine, shot-glass, bottle, or cocktail imagery/emoji
- hidden alcohol modes
- alcohol-related premium content (e.g. a paid "drinking" pack)
- alcohol references in preset packs, default editor content, legal pages, comments, previews, or unused assets

Do not merely rename drinking instructions as "penalties." Replace them with
genuinely social questions, challenges, voting, performance, teamwork, and
conversation mechanics.

## Actual tech stack (read this before assuming anything else)

This is **not** a native SwiftUI/Xcode app. It is a **React 19 + TypeScript
+ TanStack Start (Vite)** web app, wrapped for iOS distribution with
**Capacitor** (`ios/` is the generated native shell — do not hand-edit
generated Xcode project internals). Package manager is **Bun** (`bun.lock`).

- Entry / shell: `src/routes/__root.tsx`, `src/router.tsx`, `src/routeTree.gen.ts` (auto-generated, never hand-edit)
- Routing: TanStack Start file-based routing under `src/routes/` — see `src/routes/README.md` for conventions
- App shell + tab nav: `src/routes/app.tsx`, `src/components/caroline/BottomNav.tsx`
- Dice rendering/animation: `src/components/caroline/Dice.tsx`
- Dice sound: `src/lib/dice-sound.ts`
- Shake-to-roll: `src/hooks/use-shake.ts` (`DeviceMotionEvent`, no haptics wired yet — `@capacitor/haptics` is installed but unused in `src/`)
- Local persistence: `src/lib/caroline-store.ts` (`localStorage`, key `caroline.state.v1`)
- Bundled/preset content: `src/lib/preset-packs.ts`
- In-app purchase (RevenueCat): `src/lib/iap.ts`, `src/hooks/use-pro-purchase.ts`
- UI primitives: `src/components/ui/*` (shadcn/Radix — reuse these, don't reinvent)
- No localization system exists yet — all user-facing strings are hardcoded English JSX. Do not assume `next-intl`/`i18next`/`.strings` files exist.
- No test framework is configured — no Vitest/Jest, no test files. Do not reference `xcodebuild` or XCTest.

## Engineering constraints

- Preserve the existing React/TanStack Start architecture where reasonable.
- Preserve the existing dice animation (`Dice.tsx`), sound, shake-to-roll, themes (`app.settings.tsx` theme section), and `localStorage` persistence infrastructure.
- Prefer small, reviewable changes.
- Do not perform a complete rewrite unless the existing architecture makes incremental refactoring impossible.
- Do not add a backend, user accounts, analytics SDK, advertising SDK, or new third-party dependency without explicit approval. RevenueCat (IAP) already exists — do not replace it.
- Store custom game packs locally (as today, via `caroline-store.ts`).
- Ensure the core game works offline.
- Do not delete working code before identifying dependencies.
- Run `bun run lint` and any configured checks after every implementation phase.
- Run `bun run build` (and `bun run build:ios` when touching Capacitor-relevant code) after meaningful changes.
- Report warnings and failures honestly.

## Required workflow

Before editing:

1. Inspect the repository structure.
2. Read `docs/APP_STORE_REDESIGN.md` and `docs/CURRENT_APP_AUDIT.md`.
3. Identify the entry point, navigation, content source, persistence, and any tests relevant to the change.
4. Produce/confirm an implementation plan.
5. Wait for the implementation task before making large changes.

After editing:

1. Run `bun run lint` (and `bun run format` if reformatting is in scope).
2. Run tests if/when a test suite exists for the touched area.
3. Run `bun run build`.
4. Summarize changed files.
5. List remaining risks and unfinished work.
6. Update `docs/APP_STORE_REDESIGN.md`.
