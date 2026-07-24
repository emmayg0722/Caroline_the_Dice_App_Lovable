# Current App Audit

Scope: repository audit only. No application code was modified while
producing this document.

## 1. Project / scheme

Not an Xcode project in the traditional sense. This is a **Bun + Vite +
TanStack Start** web app (`package.json` name: `tanstack_start_ts`). iOS
distribution is via **Capacitor**: `ios/App/App.xcodeproj` wraps the built
web bundle (`dist/client`) as a native shell. The Xcode project exists only
to host the WKWebView shell (`ios/App/App/AppDelegate.swift`,
`MainViewController.swift`) — there's no SwiftUI/UIKit feature code to
speak of there.

- Build web bundle: `bun run build`
- Build iOS-flavored bundle + sync native shell: `bun run sync:ios` (runs `CAP_BUILD=1 vite build && cap sync ios`)
- Open native shell in Xcode: `bun run open:ios`

## 2. Minimum iOS version

Not declared in this repo (no `IPHONEOS_DEPLOYMENT_TARGET` override found in
the tracked `Info.plist`/config files inspected). This is controlled by the
Xcode project's build settings, which weren't fully enumerated as part of
this text-only audit — confirming the exact value requires opening the
`.xcodeproj` in Xcode or inspecting `project.pbxproj` build settings
directly.

## 3. App entry point

- Web/router root: `src/router.tsx`, `src/routeTree.gen.ts` (auto-generated — do not hand-edit)
- App shell layout: `src/routes/__root.tsx`
- Native iOS bootstrap: `ios/App/App/AppDelegate.swift` (standard Capacitor bridge boilerplate)

## 4. Navigation structure

File-based routing (TanStack Start), see `src/routes/README.md` for
conventions. Route map:

- `/` → redirects to `/app/classic`
- `/app` (`app.tsx`) — shell with `PhoneShell` + `BottomNav`, wraps an `<Outlet />`
  - `/app/` → redirects to `/app/classic`
  - `/app/classic` — freeform N-dice roller ("Classic" mode)
  - `/app/custom` — list of user packs (Pro-gated) + free preset packs
  - `/app/party` — join/manage time-boxed shared "Party Packs"
  - `/app/pro` — RevenueCat one-time purchase upsell
  - `/app/settings` — sub-sections: size, sound, theme, premium, about
- `/pack/$id` — roll a specific pack (preset or custom)
- `/custom/new`, `/custom/$id` — pack editor (create/edit)
- `/party/$code` — join a shared party by code (not fully read in this pass — recommend reading before Phase 1 touches sharing)
- `/share/$code` — share-link confirmation screen after creating a Party Link
- `/terms`, `/privacy` — legal pages

Bottom tab nav (`src/components/caroline/BottomNav.tsx`) drives Classic /
Custom / Party / Pro / Settings.

## 5. Current screens and game modes

- **Classic**: pick 1–6 dice, tap or shake to roll, shows running total and recent-roll history.
- **Custom**: create/edit 6-sided "packs" (text + emoji + optional photo per side), roll them, share via time-boxed Party Link. Pro-gated for creating packs; free to roll presets.
- **Party**: join someone else's shared pack via code or link; packs expire 10 hours after creation.
- **Pro**: RevenueCat one-time $4.99 unlock (`useProPurchase` hook), plus redeem/restore.
- **Settings**: dice size, sound choice, visual theme (Default/Minimal/Dark/Pastel/Meme), premium, about/legal links.

There is **no** Quick Play, Icebreaker, or Team Battle mode today — those
are aspirational, per the redesign brief, not existing product to migrate.

## 6. Game-state models

Defined in `src/lib/caroline-store.ts`:

- `DiceSide { text, emoji?, photo?, mode?: "side" | "pip" }`
- `DicePack { id, name, sides: DiceSide[], color, createdAt }`
- `PartyLink { code, packId, createdAt }`
- Store `State { pro, recentScores, packs, parties, soundId, dieScale, theme, shakeEnabled, dieColorMode }`

There is no `Player`, `Team`, `GameSession`, `Round`, or score model beyond
`recentScores` (last 6 dice totals). Any Team Battle / multi-player
scoring work is greenfield, not a refactor of existing code.

## 7. Where challenge/card/dice content is stored

- Bundled presets: `src/lib/preset-packs.ts` (`PRESET_PACKS` array, hardcoded in TS)
- User-created packs: `localStorage` via `caroline-store.ts` (`packs` field), no file/JSON bundle
- Default template shown when creating a new pack: `defaultPack()` in `src/routes/custom.$id.tsx`

## 8. Localization

**None exists.** No i18n library (`i18next`, `react-intl`, etc.), no
`.strings`/`.json` locale catalogs, no `Localizable.strings` in the iOS
shell beyond Capacitor's own. All user-facing copy is hardcoded English
directly in JSX across `src/routes/*.tsx` and `src/components/caroline/*`.
Any localization phase starts from zero infrastructure, not a migration.

## 9. User settings and persistence

Single `localStorage` key `caroline.state.v1`, read/written through a
minimal pub-sub store in `src/lib/caroline-store.ts` (no external state
library — hand-rolled `useSyncExternalStore`-style pattern via a module-level
`listeners` Set). Photos are stored inline as data URIs on `DiceSide.photo`
(client-side compression/cutout in `src/lib/dice-sound.ts` — despite the
filename, this file also holds `compressPhoto`/`cutoutWhiteBackground`
helpers, worth a rename if touched). RevenueCat (`src/lib/iap.ts`) is the
source of truth for Pro entitlement on-device and pushes updates into the
store.

## 10. Dice animation, haptics, sound, gesture handling

- Animation/rendering: `src/components/caroline/Dice.tsx` (pip layout, die face, tumble CSS transition via `--tumble-ms` custom property, confetti, `PhoneShell`)
- Sound: `src/lib/dice-sound.ts` (roll sound playback, `getRollDurationMs`, `SOUND_OPTIONS`)
- Shake gesture: `src/hooks/use-shake.ts` (`DeviceMotionEvent`, iOS 13+ permission prompt handled lazily on first tap)
- **Haptics: not wired up.** `@capacitor/haptics` is a declared dependency and linked into the native Swift Package (`ios/App/CapApp-SPM/Package.swift`), but no `src/` code imports or calls it. Treat "preserve haptics" from the original brief as "haptics don't exist yet to preserve" — adding them is new work, not a preservation risk.

## 11. Tests

**None.** No test runner is configured in `package.json` (no Vitest/Jest/
Playwright), no `*.test.*`/`*.spec.*` files anywhere in the repo. `bun run
lint` (ESLint) is the only automated check currently available.

## 12. External dependencies

Notable ones beyond standard React/Vite/Radix/shadcn tooling:

- `@capacitor/core`, `@capacitor/ios`, `@capacitor/app`, `@capacitor/haptics` (unused), `@capacitor/splash-screen`, `@capacitor/status-bar` — native iOS shell
- `@revenuecat/purchases-capacitor` — in-app purchase (Pro unlock)
- `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin` — routing/framework
- `@tanstack/react-query` — present but not yet confirmed in active use for data fetching (worth checking before removing)
- No backend/analytics/ads SDKs found.

## 13. Alcohol/drinking-related content inventory

Case-insensitive search across `src/`, `ios/`, `public/`, and repo-root docs
for drink/drinking/drunk/sip/shot/beer/wine/alcohol/cocktail/bottoms
up/waterfall and CJK/Swedish equivalents. Hits:

| File | Line | Content |
| --- | --- | --- |
| `src/lib/preset-packs.ts` | 5–16 | Entire `preset_drinking` pack: "Friends Drinking 🍻", "Shot!" 🍺, "Swap Drinks" 🍹, "Punishment Round" 🍻 |
| `src/lib/preset-packs.ts` | 71 | "Cheers All" 🍾 in the unrelated "Party Madness" preset pack |
| `src/routes/custom.$id.tsx` | 26 | `defaultPack()` seeds every new custom pack with a "Take a shot" 🥃 side |
| `src/routes/terms.tsx` | 50–52 | Terms of Use text: "...including any dares, drinking prompts, or party games you choose to play. Please be safe, drink responsibly..." |

No hits in `ios/` (native shell has no user-facing strings of its own
beyond `Info.plist`, which is clean), `public/` (only two `.mp3` dice-sound
files, no alcohol-themed assets), or asset filenames (`src/assets/` is
logos + dice sounds only, no beer/wine/cocktail imagery).

All four hits are real and require removal in Phase 1 — none are false
positives like "screenshot" containing "shot."

## Recommended incremental migration plan

1. **Phase 1 (small)**: Remove the `preset_drinking` pack, change the
   `defaultPack()` seed content, rewrite the Terms of Use paragraph. Add a
   `scripts/audit_restricted_content.sh` grep script mirroring the search
   above so future changes can be checked automatically.
2. **Phase 2 (medium, only if Quick Play/Icebreaker/Team Battle are
   greenlit)**: Introduce a content/domain layer (challenge categories,
   session/turn state) separate from route components, since none exists
   today — this is new architecture, not a refactor.
3. **Phase 3–5 (medium–large)**: Build Quick Play, Icebreaker, and Team
   Battle as new routes/components reusing `Dice.tsx`, `use-shake.ts`,
   `caroline-store.ts` patterns.
4. **Phase 6 (large)**: Introduce an i18n system from scratch (none
   exists) and extract the ~15 route files' hardcoded strings into it.
5. **Phase 7 (medium)**: QA pass, restricted-content re-audit, Release build.

## Files expected to change per phase

- Phase 1: `src/lib/preset-packs.ts`, `src/routes/custom.$id.tsx`, `src/routes/terms.tsx`, new `scripts/audit_restricted_content.sh`
- Phase 2+: net-new files under a to-be-decided `src/lib/game/` or similar; existing route files touched only to wire in new modes

## Recommended implementation order

1. Phase 1 — alcohol-content removal (small, low risk, unblocks App Store resubmission fastest)
2. Phase 7-lite — re-run the restricted-content grep and do a manual smoke test after Phase 1, before deciding whether Phases 2–6 are needed for this resubmission or a later release
3. Phases 2–6 — only after explicit go-ahead, since they're net-new product surface, not cleanup

## Estimated complexity

- Phase 1: **Small**
- Phase 2 (shared game architecture): **Medium**
- Phase 3 (Quick Play + Icebreaker): **Medium–Large**
- Phase 4 (Team Battle): **Large**
- Phase 5 (Custom Dice extensions): **Small–Medium** (core already exists)
- Phase 6 (localization from scratch): **Large**
- Phase 7 (QA/release prep): **Medium**

## Questions that need Xcode/runtime inspection (not answerable from source alone)

- Exact `IPHONEOS_DEPLOYMENT_TARGET` / minimum iOS version.
- Whether `@tanstack/react-query` is actually wired into any data flow, or a leftover scaffold dependency.
- Real device behavior of `useShakeToRoll`'s permission prompt flow on iOS 13+ (motion permission UX).
- Whether the existing "Party Link" sharing (cross-device pack sharing by code, no backend visible in this repo) has a server component outside this repository, or is purely client-side with codes that only resolve to packs already stored on each device — this repo shows no API calls for it, which is worth confirming before Phase 1 touches `party.$code.tsx` (not fully read in this pass).

## Exact build/test commands recommended

```bash
bun install
bun run lint          # ESLint — the only automated check today
bun run build          # web build (Vite/TanStack Start)
bun run build:ios      # iOS-flavored web build (CAP_BUILD=1)
bun run sync:ios        # build + cap sync ios (touches native shell)
```

No `bun run test` exists — do not invent one without first proposing a test
framework choice.
