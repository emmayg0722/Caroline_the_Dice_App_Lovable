# Party Link Fix + Privacy Manifest

Follow-up to Phase 1, prompted by two questions: would the current app pass
Apple review, and does Party Link sharing actually work. Both were checked
empirically (not just by reading code), and both surfaced real problems.
This document covers the fixes; the underlying findings are also folded
into `docs/APP_STORE_REDESIGN.md`.

## What was found

**1. Party Link sharing was completely non-functional across devices.**
Verified by scripting two isolated browser contexts (simulating two
separate phones) against a local dev server: Device A created a custom
pack and generated a Party Link; opening that exact link on Device A
itself worked, but opening it on Device B — a fresh context that never
touched this pack — showed "This Party Link expired... Ask your friend for
a fresh link," even though nothing had expired.

Root cause: `createParty()` in `src/lib/caroline-store.ts` only ever wrote
the code and pack reference to the *creator's own* `localStorage`. Nothing
was transmitted anywhere. Since there's no backend, a code generated on
one device could never resolve on another — the feature could not have
worked as shipped, for anyone, ever, despite the UI's own copy ("Share this
link with friends," "Join a shared dice pack").

**2. No Privacy Manifest.** Apple has required a `PrivacyInfo.xcprivacy`
in the app bundle since spring 2024 for apps using certain "required
reason" APIs and third-party SDKs (RevenueCat here). None existed. Missing
manifests can fail at App Store Connect upload/processing, before a human
reviewer ever looks at content — a harder blocker than a content issue.

## Fix 1: Party Link now carries the pack inside the link itself

Since adding a backend is explicitly out of scope (`AGENTS.md`: "Do not add
a backend... without explicit approval"), the fix keeps the no-backend,
offline-first architecture and instead makes the link self-contained: the
"code" is now a URL-safe, base64url-encoded copy of the pack's name, color,
sides (text/emoji/mode), and creation timestamp — not a lookup key.

New file: `src/lib/party-link.ts` — `encodeSharedPack()` / `decodeSharedPack()`.

Changed:
- `src/lib/caroline-store.ts` — `createParty()` now takes the full `DicePack` (not just an id) and encodes it into the code.
- `src/routes/pack.$id.tsx`, `src/routes/app.custom.tsx` — pass the whole pack to `createParty()`.
- `src/routes/party.$code.tsx` — decodes the pack directly from the URL param first; falls back to the old local-storage lookup only for backward compatibility with any pre-fix link opened on the same device that made it. Expiry (10 hours) is computed from the timestamp embedded in the link, not from local state, so it works correctly on a device that never saw the link before.
- `src/routes/share.$code.tsx` — decodes and displays what the recipient will actually see; the old giant "Code" display (sized for a 6-character code) is replaced with the link itself, since the token is now long. Added a disclosure when the pack has any photo side (see limitation below).
- `src/routes/app.party.tsx` — the "paste a link" regex and the manual "paste code" input no longer force-uppercase input, since the token is case-sensitive (base64url); a case-mangled paste would silently fail to decode.

**Re-verified with the same two-device test after the fix**: Device B
(fresh context) now correctly loads the shared pack, shows the right name,
color, sides, and a correctly-computed "9h 59m" remaining — with zero
prior local state. Screenshots were captured during this session.

### Real limitation this introduces: no photos in shared links

A pack's `photo` field is a base64 data URI, potentially tens of KB per
side. Six of those would make the link far too long to be usable (way past
practical URL length limits, and unusable as a scannable/typeable code).
**Photos are stripped from the encoded link** — a recipient sees that
side's emoji/text only, never the photo. The Share screen now shows a
visible note when the pack being shared has any photo side, so this is
disclosed to the host before they share, not a silent surprise for the
recipient.

This is a real product tradeoff, not a bug: the alternative (a working
photo-inclusive share) needs either a backend (out of scope) or a
peer-to-peer transfer mechanism (much larger scope). If sharing packs with
photos becomes a priority, that's a Phase 2+ conversation, not something to
patch quietly here.

### Also changed, as a consequence

- The "code" is no longer a short, human-typeable string — it's a few
  hundred characters. The "Enter Party Code" box on `/app/party` still
  works, but only via paste, not by someone typing it from memory. This was
  already unrealistic for a random 6-character code shared verbally, so in
  practice this doesn't change how the feature is actually used (link
  tap/paste, or native share sheet) — but it's a visible UI change worth
  knowing about before anyone reviews screenshots.
- `/party/$code` no longer shows the raw code in its header (it did before,
  as "Party Pack · CODE123"); with a long token that line is dropped to
  just "Party Pack."

## Fix 2: Added a Privacy Manifest

New file: `ios/App/App/PrivacyInfo.xcprivacy`, wired into
`ios/App/App.xcodeproj/project.pbxproj` (both the file reference and the
Resources build phase, mirroring how `Assets.xcassets` is registered — a
manifest dropped in the folder without this wiring would not actually ship
in the built app).

Declares, based on what this app itself does (no accounts, no analytics,
no tracking, no data leaving the device except an anonymous RevenueCat
purchase check):
- `NSPrivacyTracking`: false
- `NSPrivacyTrackingDomains`: empty
- `NSPrivacyCollectedDataTypes`: empty
- `NSPrivacyAccessedAPITypes`: UserDefaults, reason `CA92.1` (own-app data only) — the one required-reason API category a Capacitor/native-bridge app of this shape most plausibly touches

**This is a best-effort starting manifest, not a guaranteed-complete one.**
I cannot run Xcode's own privacy report generation or static analysis from
this sandbox (no Xcode, no macOS). Apple's own tooling checks this at
archive/upload time and will flag anything missing with a specific,
actionable list — treat that as the authoritative check before submission,
not this document. If RevenueCat's SDK ships its own manifest (likely, via
its CocoaPod/SPM package), that's separate and out of this app's control.

## What's still unverified

- The pbxproj edit is well-formed (validated: balanced braces/parens,
  correct plist XML) and follows the existing project's exact pattern, but
  it was made without Xcode itself — **please confirm it opens cleanly and
  the file shows up under the App target in Xcode** before relying on it.
- Whether the generated Privacy Manifest is fully sufficient is something
  only Xcode's own privacy report (or an App Store Connect upload attempt)
  can confirm.
- Everything else in `docs/PHASE_1_RESULT.md`'s "cannot be inspected from
  this repository" list (screenshots, subtitle, keywords, age rating) is
  still unverified and still needs a manual App Store Connect check.

## Validation run

- `scripts/audit-restricted-content.sh`: pass, no matches.
- `bunx tsc --noEmit`: same 10 pre-existing errors as before this change (all from the 3 packages this sandbox's registry can't fetch — see `docs/PHASE_1_RESULT.md`), zero new errors.
- `bun run lint`: all files touched in this fix are clean, except 2 pre-existing `no-empty` errors in `share.$code.tsx` that predate this change (unrelated catch blocks).
- Live two-device Party Link test: pass, screenshots captured.
