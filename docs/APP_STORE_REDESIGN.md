# Caroline App Store Redesign

## Problem

The previous Caroline version risks rejection under App Store Review
Guideline 4.3(b) because a primary preset pack ("Friends Drinking 🍻") and
default custom-pack content are built around drinking-game mechanics
(shots, "Cheers All," "Punishment Round," a Terms-of-Use section normalizing
drinking prompts). This redesign must materially change the product rather
than only changing metadata or wording.

## New product definition

Caroline – Party Dice is an offline social party dice app. Players roll to
select questions, challenges, voting activities, team tasks, and
customizable game content — built entirely on React 19 + TanStack Start,
wrapped for iOS via Capacitor.

## Preserve

- Dice animation and rendering (`src/components/caroline/Dice.tsx`)
- Shake-to-roll interaction (`src/hooks/use-shake.ts`)
- Tap-to-roll interaction
- Dice sound (`src/lib/dice-sound.ts`)
- Existing visual identity / themes (Default, Minimal, Dark, Pastel, Meme)
- Player/pack setup flow
- Local persistence infrastructure (`src/lib/caroline-store.ts`, `localStorage`)
- Existing reusable UI components (`src/components/ui/*`)
- Settings screen and its sections (size, sound, theme, premium, about)
- Party Link sharing (time-boxed pack sharing) — not a social account system, keep as-is unless it conflicts with review notes

## Remove

- The "Friends Drinking 🍻" preset pack (`src/lib/preset-packs.ts`)
- "Take a shot" 🥃 as default custom-pack side content (`src/routes/custom.$id.tsx`)
- Drinking/alcohol language in `src/routes/terms.tsx` ("dares, drinking prompts," "drink responsibly")
- Any other alcohol terminology or imagery found in the restricted-content audit
- Alcohol references in store-facing content (App Store description/keywords, if present outside this repo)

There is currently no "Buy us a beer" sponsor wording in this repo — no
action needed there unless found during implementation.

## Target modes (aspirational — current app does not yet implement these)

The current app ships **Classic** (freeform N-dice roller), **Custom**
(user-created 6-sided packs with text/emoji/photo), **Party** (time-boxed
pack sharing via code/link), and **Pro** (RevenueCat one-time unlock). It
does not yet have Quick Play, Icebreaker, or Team Battle as distinct modes.
The longer-term target product, to be scoped in a later phase, contains:

1. Quick Play
2. Icebreaker
3. Team Battle
4. Custom Dice (already partially built — extend, don't rebuild)

This document will be updated once a phase is scoped to introduce these
modes; do not build them speculatively.

## Out of scope for the first resubmission

- Accounts
- Online rooms / real-time multiplayer beyond existing Party Link sharing
- Cloud synchronization
- Public user-generated content
- AI-generated challenges
- SharePlay
- New subscriptions (existing one-time Pro purchase stays)
- Backend services
- Advertising

## Release requirements

- No alcohol-driven gameplay
- No alcohol terminology in shipped resources
- Custom Dice creation and local persistence (already exists — verify it survives the content pass)
- A complete game can be played offline
- No placeholder screens
- No critical crashes
- Updated screenshots and store metadata (outside this repo)
- Updated age-rating answers (outside this repo)
- Clear App Review notes (outside this repo)

## Progress

- Phase 0 — Repository audit: **Done** — see `docs/CURRENT_APP_AUDIT.md`
- Phase 1 — Alcohol-content removal: Not started
- Phase 2 — Shared game architecture (if/when Quick Play/Icebreaker/Team Battle are scoped): Not started
- Phase 3 — Quick Play and Icebreaker: Not started
- Phase 4 — Team Battle: Not started
- Phase 5 — Custom Dice extensions: Not started
- Phase 6 — Localization (currently no i18n system exists — first pass would be introducing one): Not started
- Phase 7 — QA and App Store preparation: Not started
