# SOP — App Store Submission (Caroline / Capacitor iOS)

Standard operating procedure for shipping this app (a **Capacitor** web app wrapped
in a native iOS shell) to the App Store, including RevenueCat in-app purchases.
Written from a real end-to-end submission. Follow top to bottom for a first release;
see **§11** for subsequent updates.

> **Golden rule for this app:** the UI is a web app inside a WKWebView. The web
> assets and the RevenueCat key are compiled/synced **into the build**, and are
> **gitignored**. So a valid build only exists after a local `sync:ios` + Xcode
> Archive. Do **not** use Xcode Cloud (see §7).

---

## 0. Fixed values (must match everywhere)

| Thing | Value |
|---|---|
| Bundle ID | `app.caroline.dice` |
| IAP product ID | `caroline_pro_lifetime` (Non-Consumable, $4.99) |
| RevenueCat entitlement | `pro` (identifier — display name can differ) |
| SDK key env var | `VITE_REVENUECAT_IOS_KEY` (in `.env`, gitignored) |
| Web build command | `bun run sync:ios` (= vite build + `cap sync ios`) |

If any of these drift out of sync between the code, App Store Connect, and
RevenueCat, purchases silently fail.

---

## 1. One-time prerequisites

- [ ] **Apple Developer Program** active ($99/yr) — a free Apple ID cannot ship.
- [ ] **Agreements, Tax, and Banking** = *Active* in App Store Connect → Business.
      (IAPs return nothing until this is done — even in sandbox.)
- [ ] **RevenueCat** account created.

---

## 2. Register the app (App Store Connect + Developer portal)

1. **developer.apple.com** → Certificates, Identifiers & Profiles → **Identifiers**
   → **+** → App IDs → App → Bundle ID **Explicit** = `app.caroline.dice`,
   enable **In-App Purchase** capability. *(Or let Xcode register it via Signing.)*
2. **appstoreconnect.apple.com** → My Apps → **+ New App**:
   - Platform iOS, Name (globally unique), Primary language English,
     Bundle ID `app.caroline.dice`, SKU (any internal string), Full Access.

The Bundle ID must be registered in step 1 or it won't appear in the step 2 dropdown.

---

## 3. Create the In-App Purchase (App Store Connect)

App Store Connect → your app → **In-App Purchases** → **+ Non-Consumable**:

- [ ] Product ID **`caroline_pro_lifetime`** (exact)
- [ ] **Reference Name** (internal), e.g. "Caroline Pro (Lifetime)"
- [ ] **Price** → $4.99
- [ ] **App Store Localization** (English U.S.):
      - Display Name ≤ 30 chars — "Caroline Pro"
      - Description ≤ 45 chars — "Custom dice packs, photos & Party Links"
- [ ] **Review screenshot** (required — a shot of the Pro/unlock screen)

Target status = **Ready to Submit**. Common blocker: the **review screenshot**.

---

## 4. RevenueCat setup

RevenueCat needs **two** Apple keys (both are `.p8` + Key ID + Issuer ID, generated
under App Store Connect → **Users and Access → Integrations**):

| Key type | Section | Purpose |
|---|---|---|
| **In-App Purchase Key** | Integrations → In-App Purchase | validate StoreKit 2 purchases |
| **App Store Connect API Key** | Integrations → App Store Connect API (Team Keys) | let RevenueCat import/manage products |

Steps:
1. **Apps** → add an **App Store app**: Bundle ID `app.caroline.dice`, upload the
   In-App Purchase Key (or paste the App-Specific Shared Secret from App Info).
2. Connect the **App Store Connect API Key** (role **Admin**) so **Import** works.
3. **Products** → on the **Caroline – The Dice** (Apple) row, **Import** or **+ New**
   → `caroline_pro_lifetime`. ⚠️ Do **not** put it under **Test Store** — the shipping
   app uses the `appl_` key and reads the App Store app, not the test store.
4. **Entitlements** → identifier **`pro`** → attach the product.
5. **Offerings** → mark one **Current**, with a **Package** containing the product.
   *(No Current offering ⇒ buy button errors "No Pro offering configured".)*
6. **API Keys** → copy the **iOS public key** (starts with **`appl_`**, not `test_`).

---

## 5. Wire the key into the build

The key is a **build-time** value (Vite compiles it into the JS bundle). It must be
present **before** archiving.

```bash
# in the project root
echo 'VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxx' >> .env   # or edit .env
bun run sync:ios
# verify it's actually baked in:
grep -rl "appl_xxxxxxxx" ios/App/App/public/assets/*.js
```

`.env` is gitignored (the `appl_` key is public/safe, but keep secrets — shared
secret, `.p8` — only in the RevenueCat dashboard, never in the repo).

---

## 6. Project prep for review (native, one-time)

Edit `ios/App/App/Info.plist`:
- [ ] `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`
      (the photo picker **crashes** → rejection without these)
- [ ] `ITSAppUsesNonExemptEncryption` = `false` (skips the export-compliance prompt)

Edit `ios/App/App.xcodeproj/project.pbxproj`:
- [ ] `TARGETED_DEVICE_FAMILY = 1` (iPhone-only — avoids the iPad screenshot
      requirement; this app is phone-designed). Use `"1,2"` only if you truly want iPad.
- [ ] Bump `CURRENT_PROJECT_VERSION` for **every** upload (build numbers must be unique).

Signing: Xcode → target **App** → Signing & Capabilities → set **Team**,
**Automatically manage signing**, add **In-App Purchase** capability.

---

## 7. Build & upload  (⚠️ NOT Xcode Cloud)

**Do not use Xcode Cloud for this app.** It builds from the GitHub branch, but the
web assets (`ios/App/App/public`) and `.env` are gitignored, so the cloud build is
blank/keyless unless you write CI scripts. Use a local archive instead:

1. `bun run sync:ios` (ensure the latest web + key are in `ios/App/App/public`).
2. Xcode → run destination = **Any iOS Device (arm64)** (Archive is disabled for
   simulators/devices).
3. **Product ▸ Archive**.
4. Organizer → **Distribute App ▸ App Store Connect ▸ Upload**.
5. Wait for **processing** in App Store Connect (minutes–1 hr; email when ready).

*(If you edit the project on disk while Xcode is open, quit and reopen Xcode so it
reads the changes before archiving.)*

---

## 8. Screenshots

Apple requires exact pixel sizes per display "slot". Generate real retina PNGs with
Playwright driving the dev server (no manual device needed):

```bash
bun run dev            # serve the app
# scratchpad/shots.mjs: chromium context viewport W×H, deviceScaleFactor 3, screenshot each route
bun run scratchpad/shots.mjs
```

Viewport → output size:
| Slot | Viewport | Output PNG |
|---|---|---|
| iPhone 6.5" | 428 × 926 @3 | **1284 × 2778** (also accepts 1242×2688) |
| iPhone 6.9" | 440 × 956 @3 | **1320 × 2868** |
| iPad 13" | 1024 × 1366 @2 | **2048 × 2732** (also 2064×2752) |

Notes:
- Upload to the **matching slot**; the "dimensions are wrong" error = wrong slot size.
- Only the **first 3** show on the install sheet — order them best-first.
- Listing copy (name, subtitle, description, keywords, age rating, privacy answers)
  is kept in `appstore-screenshots/APP-STORE-LISTING.md`.

---

## 9. Complete the version page (clears "Unable to Add for Review")

**App Information:**
- [ ] Primary **Category** (Entertainment) + Secondary (Games)
- [ ] **Content Rights** → "No third-party content"
- [ ] **Copyright** → `<year> <name>` e.g. `2026 Emma Gao`

**Pricing and Availability:**
- [ ] App price = **Free** (the app is free; Pro is the IAP)

**App Privacy:**
- [ ] **Privacy Policy URL** — a **public** page (e.g. a GitHub **Pages** `github.io`
      URL — *not* the `github.com` repo URL). Reviewers open it.
- [ ] **Data questionnaire** (Admin only): **Purchases** + **Identifiers**, used for
      App Functionality, **not** linked to identity, **not** used for tracking.

**Version page:**
- [ ] **Screenshots** for each required slot
- [ ] **Age rating** questionnaire (alcohol references ⇒ expect **17+**; Game Center = **No**)
- [ ] **Build** → select the processed build
- [ ] **In-App Purchases** section → **attach `caroline_pro_lifetime`**
      (the first IAP is reviewed **with** the app version)

**App Review Information (bottom):**
- [ ] **Contact Information** (your name/phone/email — reviewer only)
- [ ] **Sign-in required** → **UNCHECK** (the app has no login; leaving it on forces
      required username/password fields)
- [ ] Notes — mention Pro is a one-time $4.99 non-consumable; include an offer code if useful
- [ ] **Support URL** (with Description/Keywords) — a public `http(s)` URL (no `mailto:`)

---

## 10. Test, then submit

- [ ] Install the build on a real device (TestFlight) and **sandbox-test** the
      purchase: Unlock Pro → Restore → Redeem. Confirm Pro unlocks. Requires a
      **Sandbox tester** (Users and Access → Sandbox).
- [ ] When "Unable to Add for Review" is clear → **Add for Review** → **Submit for Review**.

---

## 11. Subsequent updates (repeat, condensed)

1. Make code changes → commit.
2. `bun run sync:ios`.
3. Bump `CURRENT_PROJECT_VERSION` (build) and, for a user-facing release,
   `MARKETING_VERSION` (e.g. 1.0 → 1.1). Create a new version in App Store Connect
   if `MARKETING_VERSION` changed.
4. Archive → Upload → wait for processing → select the new build.
5. Update screenshots/notes if needed → **Submit**.
   (Additional IAPs, after the first is approved, can be submitted on their own.)

---

## Troubleshooting / gotchas hit during the first submission

| Symptom | Cause / fix |
|---|---|
| Purchase throws "Purchases aren't configured" | `VITE_REVENUECAT_IOS_KEY` empty at build time → set it, `sync:ios`, re-archive |
| Product only under **Test Store** in RevenueCat | Add it under the **App Store** app; test store isn't used by the shipping build |
| Key starts with `test_` | Wrong key — use the **`appl_`** iOS public key |
| "Missing Metadata" on the IAP | Fill price + localization + **review screenshot** |
| "Unable to Add for Review" | App/version fields (category, build, privacy, price, contact…) — different from IAP metadata |
| Privacy Policy URL rejected/empty | Use a **public** page (GitHub **Pages** `*.github.io/...`), not the repo URL |
| "Screenshot dimensions wrong" | Match the **exact** slot size (see §8) |
| "Screenshot required for 13-inch iPad" | App supports iPad → either add a 2048×2732 iPad shot, or set `TARGETED_DEVICE_FAMILY = 1` + rebuild |
| "User name / Password required" | **Uncheck "Sign-in required"** in App Review Information |
| Build number already used | Bump `CURRENT_PROJECT_VERSION` before re-archiving |
| Xcode Cloud build blank / no purchases | Don't use it here — web assets + key are gitignored; use local Archive |
| No white flash / white bar / edge-to-edge already handled in native config | see `MainViewController.swift`, `capacitor.config.ts`, `LaunchScreen.storyboard` |
