# Phase 1 Result

Branch: `claude/caroline-party-dice-redesign-17rxp6`. Scope: Part A (remove
restricted content), Part B (product-positioning audit), Part C (minimum
positioning copy changes), Part D (restricted-content audit script), Part
E (validation). Quick Play / Icebreaker / Team Battle and any new shared
game engine were explicitly **not** started, per the completion boundary.

## Files changed

**Content removal / replacement (Part A):**
- `src/lib/preset-packs.ts` — deleted the `preset_drinking` pack entirely; replaced "Cheers All" 🍾 in the `preset_party` ("Party Madness") pack with "Round of Applause" 👏
- `src/routes/custom.$id.tsx` — replaced the default new-pack seed side "Take a shot" 🥃 with "Tell a Joke" 😂 (plus mechanical prettier reformatting of the file, no logic changes — see Validation)
- `src/routes/terms.tsx` — rewrote the Terms of Use paragraph to remove "drinking prompts" / "drink responsibly" language while preserving the liability disclaimer's intent

**Positioning copy (Part C):**
- `src/routes/__root.tsx` — site title/meta description/OG tags renamed from "Caroline — The Dice" to "Caroline — Party Dice," description now names the actual content categories (questions, challenges, group games) instead of generic "let the party roll" copy
- `src/routes/app.custom.tsx` — added a one-line value-proposition subhead under the "Dice Packs" heading to make the app's differentiator (user-authored content) explicit

**New tooling (Part D):**
- `scripts/audit-restricted-content.sh` — case-insensitive English/Chinese/Swedish restricted-term scanner over `src/`, `ios/App/App/`, `public/`, `capacitor.config.ts`, `package.json`; excludes generated build output, `node_modules`, lockfiles, and Xcode-generated project internals; exits non-zero on any unexplained match; includes a documented (currently empty) allowlist mechanism for future confirmed false positives

**Documentation:**
- `docs/APP_STORE_REDESIGN.md` — Phase 1 marked done, "Remove" section updated to reflect actual removals, added a note that removal alone is not sufficient and points to the positioning audit
- `docs/CURRENT_APP_AUDIT.md` — alcohol-content inventory table updated to show each item's removal status; noted two ambiguous (not confirmed-alcohol) entries found during the positioning pass
- `docs/PRODUCT_POSITIONING_AUDIT.md` — new; full route/component/metadata sweep (Part B)
- `docs/PHASE_1_RESULT.md` — this file

## Alcohol content removed

1. Entire `preset_drinking` pack ("Friends Drinking 🍻": "Shot!" 🍺, "Toast King," "Swap Drinks" 🍹, "Punishment Round" 🍻) — deleted.
2. "Cheers All" 🍾 inside the unrelated "Party Madness" preset — removed.
3. "Take a shot" 🥃 default custom-pack side — removed.
4. "drinking prompts" / "drink responsibly" language in the Terms of Use — removed.

## Replacements introduced

- "Round of Applause" 👏 in place of "Cheers All" 🍾 (Party Madness pack)
- "Tell a Joke" 😂 in place of "Take a shot" 🥃 (default custom-pack seed)
- Terms of Use now says "...including any dares, questions, or party games you choose to play. Please be safe, be kind, and respect everyone at the table."

None of these use disguised drinking-adjacent wording ("penalty," "punishment sip," "adult challenge," etc.) — they're genuine social/performance activities, matching the style of the app's other non-alcohol preset content.

## User-facing positioning changes

- Site title/meta/Open Graph description now explicitly frame the product as a customizable party-dice game with named content categories, not a generic "dice app."
- The Custom Dice tab now states its value proposition in one line instead of jumping straight from the heading into the pack list.
- No navigation, mode structure, or paywall copy was touched — per the explicit "do not redesign navigation" constraint.

Full route-by-route findings, including screens reviewed and found clean, are in `docs/PRODUCT_POSITIONING_AUDIT.md`.

## Validation: commands and results

This sandbox's package registry (`europe-west4-npm.pkg.dev/lovable-core-prod/...`) returned `403` for a subset of packages during `bun install`, before any Phase 1 changes were made — confirmed by reverting to the pre-Phase-1 commit and re-running. This is a pre-existing environment/network limitation, not something introduced by this phase. Exact commands run and their actual results, reported honestly:

| Command | Result | Notes |
| --- | --- | --- |
| `bun install` | **Failed** (exit 1) | `403` on `@capacitor/core`, `@capacitor/splash-screen`, `@revenuecat/purchases-capacitor`, and their transitive deps. Pre-existing `node_modules` (395 MB) from container setup was reused for the remaining checks. |
| `bunx tsc --noEmit` (no dedicated `typecheck` script exists in `package.json`) | **Failed** (exit 2) — 10 errors | All 10 errors are `Cannot find module '@capacitor/core'` / `'@revenuecat/purchases-capacitor'` / `'@capacitor/splash-screen'` in `src/lib/iap.ts` and `src/routes/__root.tsx`, plus two cascading implicit-`any` errors in `iap.ts`. Confirmed pre-existing: neither file's *imports* were touched by Phase 1 (only `__root.tsx`'s meta strings were edited), and the three missing packages are exactly the ones that failed to install above. |
| `bun run lint` | **Failed** (exit 1) both before and after Phase 1 | Before: 139 problems (132 errors) repo-wide, pre-existing. After Phase 1 edits + targeted `prettier --write` on the 5 files this phase touched: 112 problems (105 errors) remain, **all in files Phase 1 did not touch** (`Dice.tsx`, several `src/components/ui/*` primitives, `iap.ts`, `use-shake.ts`, `caroline-store.ts`, `dice-sound.ts`, and most other route files). All 5 files this phase modified are now lint-clean. The remaining repo-wide prettier debt predates Phase 1 and was left alone, since a full-repo reformat is outside "minimum safe changes." |
| `bun run build` | **Failed** (exit 1) | Rollup: `Failed to resolve import "@capacitor/splash-screen"` from `src/routes/__root.tsx` — same missing-package cause as above, at the same pre-existing dynamic import (`import("@capacitor/splash-screen")`) that Phase 1 did not modify. |
| `scripts/audit-restricted-content.sh` | **Passed** (exit 0) | "No matches found across src ios/App/App public capacitor.config.ts package.json." |
| `bunx cap sync ios` | **Failed** (exit 1) | `could not determine executable to run for package cap` — `@capacitor/cli` was not resolvable, same root cause as `bun install`'s failures. No claim is made that the iOS project was built or synced; it was not. |

**Bottom line on validation:** the restricted-content removal itself introduced no new type, lint, or build errors. Every failure above traces to this sandbox's inability to fetch three native-only packages from its private registry mirror — verified pre-existing by reverting to the commit before this phase and reproducing the same `bun install` 403s and the same `tsc`/`build` failures. This should be re-run in an environment with full registry access before treating the build/typecheck/`cap sync` results as final; the lint and restricted-content results are trustworthy as reported since they don't depend on the missing packages.

## Remaining warnings

- 7 ESLint warnings remain repo-wide (pre-existing, not itemized here since they're outside touched files — see `bun run lint` output for detail if needed).
- `src/lib/dice-sound.ts` holds photo-compression/cutout helpers (`compressPhoto`, `cutoutWhiteBackground`) despite its sound-focused filename — a pre-existing naming quirk noted in the original repository audit, not touched here.

## Could the app still be perceived as a drinking game?

Not from anything shipped in this repository as of this commit — the restricted-content script confirms zero matches across `src/`, the iOS shell's user-facing surface, `public/`, and repo-level config/metadata. Two ambiguous, non-alcohol-term entries ("Penalty Chain," "King's Order" in the `preset_party` pack) remain and are documented in `docs/PRODUCT_POSITIONING_AUDIT.md` as Phase-2-watch items, not confirmed violations.

The unresolved risk is entirely **outside this repository's reach**: App Store Connect screenshots, subtitle, description, and keywords are not stored in source control and could not be inspected or changed as part of this work. If any of those still show or describe the drinking preset that was just removed from the app, the app can still be perceived as a drinking game regardless of what ships in the binary — see the metadata list below.

## Recommended Phase 2 scope

Per the audit's own findings (`docs/PRODUCT_POSITIONING_AUDIT.md`, Q7), a **small differentiation upgrade** is the right next step, not the full four-mode rebuild:

1. Give the first-launch (Classic) screen a one-line framing of what Caroline is, since currently there is none.
2. Surface Custom Dice more prominently — it's the app's real differentiator and is currently a Pro-gated third tab.
3. Resolve the two ambiguous "Penalty Chain" / "King's Order" entries with unambiguous wording.
4. Add one or two more non-alcohol preset packs so the product reads as broadly social, not narrowly repurposed.

This assessment applies **only if** Classic/Party/Pro are judged, after human review of the running app, to already deliver a coherent non-alcohol party experience. If instead they read as interchangeable collections of random prompts with no session structure or scoring, the larger multi-mode redesign (Quick Play/Icebreaker/Team Battle) becomes the safer bet for defensibility — that judgment call is for a human reviewing the live app, not something this audit can settle from source alone.

## App Store metadata items that cannot be inspected from this repository

- App Store Connect screenshots
- App name/subtitle as registered with Apple
- App description and promotional text
- Keywords
- Age rating questionnaire answers
- Any previously-submitted App Review notes
- The rendered appearance of the app icon/logo (only filenames were checked here, not pixels)

These must be reviewed and, if needed, replaced directly in App Store Connect — nothing in this repository can verify or fix them.
