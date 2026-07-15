# Design — Party Codes (cross-device pack sharing)

**Date:** 2026-07-15
**Status:** Approved design, pending spec review
**Ships as:** app **v1.1**, submitted after the current App Store review clears.

## Problem

The current "Party Link" feature is non-functional across devices. `createParty()`
stores the party + pack only in the creator's `localStorage` and shares a
`capacitor://localhost/party/CODE` link. A recipient on another device has neither
that link scheme nor the pack data, so they immediately see "This Party Link expired."

## Goal

Let a user share a **6-character code**. Another user with the app types the code in
the **Party tab** and gets the shared pack to play for 10 hours.

## Decisions (locked)

- **Code-only.** No shareable links, no browser fallback, no iOS Universal Links.
  Both users must have the app.
- **Text/emoji packs only.** Photos are stripped before upload (too large; not needed).
- **Backend = Supabase**, called directly from the app with the public **anon key**.
  No custom server code.
- **App-to-app**, no accounts/auth.

## Non-goals (YAGNI)

- Shareable/browser links, Universal Links, "open in app" deep-linking.
- Photos in shared packs.
- User accounts, editing a joined pack, server-side expiry cleanup.

---

## Architecture

```
Creator app                Supabase (parties table)              Joiner app
-----------                ------------------------              ----------
Share pack  --insert-->    { code, pack(jsonb), created_at }
show CODE
                           <--select by code--  type CODE in Party tab
                           --> pack -->          save locally, play /party/$code
```

- One Supabase table, two operations: **insert** (create), **select-by-code** (join).
- The app calls Supabase's auto-generated **REST API** with `fetch` (no
  `@supabase/supabase-js` dependency needed — keeps the bundle lean).
- Cross-origin from `capacitor://localhost` → `https://<project>.supabase.co` works
  (Supabase REST allows CORS with the apikey header).

### Data model (Supabase)

```sql
create table parties (
  code       text primary key,
  pack       jsonb not null,
  created_at timestamptz not null default now()
);
alter table parties enable row level security;

-- anyone may create a party
create policy "anon insert parties" on parties
  for insert to anon with check (true);

-- anyone may read a party (the client always filters by exact code)
create policy "anon select parties" on parties
  for select to anon using (true);
```

Sensitivity is low (dice-pack text/emoji only), so open anon insert/select is
acceptable. Codes are random 6-char; enumeration yields only party prompts.
*(Optional hardening later: a `get_party(code)` RPC instead of table select.)*

### Stored pack shape (stripped)

```ts
type SharedPack = {
  name: string;
  color: string;
  sides: { text: string; emoji?: string; mode?: "side" | "pip" }[];
};
```

Photos and local `id` are dropped on upload.

---

## Client module — `src/lib/party-api.ts`

Thin REST wrapper. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public, safe
to ship, baked at build time).

```ts
createParty(pack: DicePack): Promise<{ code: string }>
// strip → generate 6-char code → POST /rest/v1/parties
// on unique-violation (409), regenerate code, retry up to 5x

fetchParty(code: string): Promise<{ pack: SharedPack; createdAt: number } | null>
// GET /rest/v1/parties?code=eq.CODE&select=pack,created_at → null if 404/empty
```

- Code alphabet excludes ambiguous chars (no `O/0`, `I/1/L`). 6 chars.
- Headers: `apikey`, `Authorization: Bearer <anon>`, `Content-Type`, `Prefer: return=minimal`.

---

## Flows

### Create (native app)
1. Custom "My Packs" / Preset **Share** → `await createParty(pack)`.
2. On success → navigate to the **share screen** showing the big **CODE** with a
   Copy button (and native share-sheet of plain text "Join my Caroline party — code X").
3. On error → inline message "Couldn't create party. Check your connection."

### Join (native app, Party tab)
1. Single **code input** (remove the "Paste Party Link" box).
2. `join(code)` → `fetchParty(code)`:
   - not found → "No party found for that code."
   - found but `now - createdAt > 10h` → "This party expired."
   - ok → save `{ code, pack, createdAt }` to local `parties`, navigate `/party/$code`.

### Play (`/party/$code`)
- Reads the party from local storage (populated by join, or by the creator).
- Fallback: if the code isn't local, `fetchParty(code)` once and hydrate — makes the
  route self-sufficient.
- Existing roll UI, 10h countdown from `createdAt`.

---

## Code changes

| File | Change |
|---|---|
| `src/lib/party-api.ts` | **new** — `createParty`, `fetchParty` (REST) |
| `src/lib/caroline-store.ts` | `PartyLink` holds the **pack inline** (`{code, pack, createdAt}`) not `packId`. Remove the old `createParty` (upload now lives in `party-api`). Add `saveParty(party)` used by join to persist a fetched party locally. Keep `deleteParty`. |
| `src/routes/app.custom.tsx` | Share button → `await createParty(pack)` → share screen; handle loading/error |
| `src/routes/share.$code.tsx` | show **code** (drop the link/QR); Copy + native share text |
| `src/routes/app.party.tsx` | single **code input**; `join` fetches from API; drop link input |
| `src/routes/party.$code.tsx` | read `party.pack` inline; add `fetchParty` fallback |
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

## Error handling

- Network failure (create/join/fallback) → user-facing "check your connection" text,
  never a silent no-op.
- Code collision on insert → regenerate + retry (≤5).
- Missing env keys → `party-api` throws a clear "Sharing isn't configured" message
  (mirrors how `iap.ts` guards a missing key).

## Testing

- **Unit:** code generation (charset, length), expiry math, pack stripping (photos gone).
- **Integration:** `createParty` → `fetchParty` round-trip (against a Supabase test
  project or a mocked `fetch`).
- **Manual (device):** create on device A → type code on device B → pack loads and
  plays; wrong code → error; expired (or backdated `created_at`) → expired message;
  airplane mode → connection error, not a hang.

## Setup (one-time, user does; I provide exact steps + SQL)

1. Create a free **Supabase project**.
2. Run the `parties` table + RLS SQL above.
3. Copy **Project URL** and **anon public key** → `.env`.
4. `bun run sync:ios`; verify keys are baked in.

## Rollout

- Bump `MARKETING_VERSION` → **1.1**, `CURRENT_PROJECT_VERSION` accordingly.
- Create the 1.1 version in App Store Connect, archive, upload, submit.
- Review-safe: anonymous, no user data, no accounts, standard HTTPS.
