# Party Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user share a 6-character code that another user types in the Party tab to load and play a shared dice pack for 10 hours.

**Architecture:** A new `party-api.ts` talks to a Supabase `parties` table over REST (`fetch` + public anon key, no SDK). Create uploads a stripped pack and returns a code; join fetches by code and saves it into local state. The store's `PartyLink` carries the pack inline. All UI stays in the existing routes.

**Tech Stack:** TanStack Start (React), Capacitor iOS, Supabase REST, Vitest (added here for the pure logic).

## Global Constraints

- **Code-only, app-to-app.** No links, no browser fallback, no Universal Links.
- **Text/emoji packs only.** Strip `photo` and `id` before upload.
- **Supabase via REST `fetch`** with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (public, baked at build). No `@supabase/supabase-js` dependency.
- **Expiry:** `PARTY_TTL_MS = 10 * 60 * 60 * 1000`, checked client-side.
- **Code alphabet:** `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no `O/0/I/1/L`), length 6.
- **Ships as app v1.1** after the current App Store review; review-safe (anonymous, no accounts).
- Package manager is **bun**. Run tests with `bun run test`.

---

### Task 1: Vitest setup + pure helpers in `party-api.ts`

**Files:**
- Create: `src/lib/party-api.ts`
- Create: `src/lib/party-api.test.ts`
- Modify: `package.json` (add `test` script + vitest devDep)
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `generateCode(len?: number): string`; `type SharedPack = { name: string; color: string; sides: { text: string; emoji?: string; mode?: "side" | "pip" }[] }`; `stripPack(pack: { name: string; color: string; sides: { text: string; emoji?: string; photo?: string; mode?: "side" | "pip" }[] }): SharedPack`; `PARTY_TTL_MS: number`; `isExpired(createdAt: number, now?: number): boolean`.

- [ ] **Step 1: Add vitest**

Run: `bun add -d vitest@^2`
Expected: vitest appears under devDependencies.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 3: Add the `test` script** in `package.json` scripts (next to `"lint"`):

```json
"test": "vitest run",
```

- [ ] **Step 4: Write the failing test** — `src/lib/party-api.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { generateCode, stripPack, isExpired, PARTY_TTL_MS } from "./party-api";

describe("generateCode", () => {
  it("is 6 chars from the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode();
      expect(c).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });
});

describe("stripPack", () => {
  it("drops photo/id and keeps text, emoji, mode", () => {
    const out = stripPack({
      name: "Night",
      color: "var(--pink)",
      sides: [{ text: "Shot", emoji: "🍺", photo: "data:image/png;base64,AAA", mode: "side" }],
    });
    expect(out).toEqual({
      name: "Night",
      color: "var(--pink)",
      sides: [{ text: "Shot", emoji: "🍺", mode: "side" }],
    });
    expect((out.sides[0] as Record<string, unknown>).photo).toBeUndefined();
  });
});

describe("isExpired", () => {
  it("is false inside the window and true past it", () => {
    const t0 = 1_000_000;
    expect(isExpired(t0, t0)).toBe(false);
    expect(isExpired(t0, t0 + PARTY_TTL_MS - 1)).toBe(false);
    expect(isExpired(t0, t0 + PARTY_TTL_MS + 1)).toBe(true);
  });
});
```

- [ ] **Step 5: Run to verify it fails**

Run: `bun run test`
Expected: FAIL — cannot import from `./party-api` (module has no such exports yet).

- [ ] **Step 6: Implement the pure helpers** — `src/lib/party-api.ts`

```ts
// Cross-device party sharing via Supabase REST. Pure helpers here; network
// functions added in Task 2. Safe on web/SSR — network calls guard on config.

export type SharedPack = {
  name: string;
  color: string;
  sides: { text: string; emoji?: string; mode?: "side" | "pip" }[];
};

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no O/0, I/1/L

export function generateCode(len = 6): string {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[arr[i] % ALPHABET.length];
  return out;
}

export function stripPack(pack: {
  name: string;
  color: string;
  sides: { text: string; emoji?: string; photo?: string; mode?: "side" | "pip" }[];
}): SharedPack {
  return {
    name: pack.name,
    color: pack.color,
    sides: pack.sides.map((s) => ({ text: s.text, emoji: s.emoji, mode: s.mode })),
  };
}

export const PARTY_TTL_MS = 10 * 60 * 60 * 1000;

export function isExpired(createdAt: number, now = Date.now()): boolean {
  return now - createdAt > PARTY_TTL_MS;
}
```

- [ ] **Step 7: Run to verify pass**

Run: `bun run test`
Expected: PASS (3 files/suites green).

- [ ] **Step 8: Commit**

```bash
git add package.json vitest.config.ts src/lib/party-api.ts src/lib/party-api.test.ts
git commit -m "feat(party): vitest + party-api pure helpers (code, strip, expiry)"
```

---

### Task 2: Network functions `createParty` / `fetchParty`

**Files:**
- Modify: `src/lib/party-api.ts`
- Modify: `src/lib/party-api.test.ts`

**Interfaces:**
- Consumes: `generateCode`, `stripPack`, `SharedPack` (Task 1).
- Produces: `createParty(pack): Promise<{ code: string; createdAt: number }>`; `fetchParty(code: string): Promise<{ pack: SharedPack; createdAt: number } | null>`. `createParty` input type is the same object shape `stripPack` accepts.

- [ ] **Step 1: Write failing tests** — append to `src/lib/party-api.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createParty, fetchParty } from "./party-api";

const PACK = { name: "P", color: "var(--pink)", sides: [{ text: "A", emoji: "😀", mode: "side" as const }] };

beforeEach(() => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://x.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon123");
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("createParty", () => {
  it("POSTs and returns a code on 201", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    const { code } = await createParty(PACK);
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.pack.sides[0]).not.toHaveProperty("photo");
    expect(body.code).toBe(code);
  });

  it("retries on 409 code collision then succeeds", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 409 })
      .mockResolvedValueOnce({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    await createParty(PACK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("fetchParty", () => {
  it("returns pack + createdAt for a found code", async () => {
    const iso = "2026-07-15T00:00:00.000Z";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, json: async () => [{ pack: PACK, created_at: iso }],
    }));
    const res = await fetchParty("ABC234");
    expect(res?.pack.name).toBe("P");
    expect(res?.createdAt).toBe(new Date(iso).getTime());
  });

  it("returns null when no row", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    expect(await fetchParty("ZZZ999")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `bun run test`
Expected: FAIL — `createParty`/`fetchParty` not exported.

- [ ] **Step 3: Implement network functions** — append to `src/lib/party-api.ts`

```ts
const SUPABASE_URL = (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON = (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ?? "";

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error("Sharing isn't set up yet.");
  }
}
function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    "Content-Type": "application/json",
  };
}

export async function createParty(pack: Parameters<typeof stripPack>[0]): Promise<{ code: string; createdAt: number }> {
  assertConfigured();
  const shared = stripPack(pack);
  const createdAt = Date.now();
  const created_at = new Date(createdAt).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/parties`, {
      method: "POST",
      headers: { ...authHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ code, pack: shared, created_at }),
    });
    if (res.ok) return { code, createdAt };
    if (res.status === 409) continue; // duplicate code, try another
    throw new Error("Couldn't create party. Please try again.");
  }
  throw new Error("Couldn't create party. Please try again.");
}

export async function fetchParty(code: string): Promise<{ pack: SharedPack; createdAt: number } | null> {
  assertConfigured();
  const url = `${SUPABASE_URL}/rest/v1/parties?code=eq.${encodeURIComponent(code)}&select=pack,created_at`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't reach the party. Check your connection.");
  const rows = (await res.json()) as { pack: SharedPack; created_at: string }[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return { pack: rows[0].pack, createdAt: new Date(rows[0].created_at).getTime() };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `bun run test`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/party-api.ts src/lib/party-api.test.ts
git commit -m "feat(party): createParty/fetchParty over Supabase REST"
```

---

### Task 3: Store — inline pack, `saveParty`, drop old `createParty`

**Files:**
- Modify: `src/lib/caroline-store.ts` (types ~21-25; `createParty` ~126-131; `deleteParty` ~133-135; return ~144)
- Modify: `src/routes/share.$code.tsx:18` (pack lookup)
- Modify: `src/routes/party.$code.tsx:21` (pack lookup)
- Modify: `src/routes/app.party.tsx` (parent pack lookup + `ActivePartyRow` pack type)
- Modify: `src/routes/app.custom.tsx` (Share button — it calls the now-removed `createParty`, so it must move to the new flow here or the build breaks)

**Interfaces:**
- Consumes: `SharedPack` (Task 1).
- Produces: `type PartyLink = { code: string; pack: SharedPack; createdAt: number }`; store hook adds `saveParty(party: PartyLink): void`; removes `createParty`; keeps `deleteParty(code)`.

- [ ] **Step 1: Update the `PartyLink` type** — `src/lib/caroline-store.ts` (add the import at top and replace the type)

At top of file, add:
```ts
import type { SharedPack } from "./party-api";
```
Replace lines 21-25:
```ts
export type PartyLink = {
  code: string;
  pack: SharedPack;
  createdAt: number;
};
```

- [ ] **Step 2: Replace `createParty` with `saveParty`** — in the hook body (was ~126-131)

```ts
  const saveParty = useCallback((party: PartyLink) => {
    const cur = ensure();
    const parties = [party, ...cur.parties.filter((p) => p.code !== party.code)].slice(0, 20);
    save({ ...cur, parties });
  }, []);
```

- [ ] **Step 3: Update the hook's return** (was ~144) — swap `createParty` for `saveParty`:

```ts
  return { ...s, setPro, recordRoll, savePack, deletePack, saveParty, deleteParty, setSoundId, setDieScale, setTheme, setShakeEnabled, setDieColorMode };
```

- [ ] **Step 4: Fix `share.$code.tsx` pack lookup** — replace line 18:

```ts
  const pack = party?.pack;
```
(Remove `packs` from the `useCarolineStore()` destructure on line 16 if now unused.)

- [ ] **Step 5: Fix `party.$code.tsx` pack lookup** — replace line 21:

```ts
  const pack = party?.pack;
```

- [ ] **Step 6: Fix `app.party.tsx` parent mapping + row type**

In `ActivePartyRow` props (line 20) change `pack: DicePack;` to `pack: SharedPack;` and import the type: add `SharedPack` to the `caroline-store` import on line 4 (`import { useCarolineStore, type PartyLink, type SharedPack } ...` — remove `DicePack` if now unused).
In the parent `.map` (around lines 95-102), replace `const pack = packs.find((x) => x.id === p.packId);` with `const pack = p.pack;` and drop `packs` from the destructure if unused.

- [ ] **Step 7: Move `app.custom.tsx` Share button to the new flow** (so the build stays green — the store's old `createParty` is gone)

Add to imports in `src/routes/app.custom.tsx`:
```ts
import { useNavigate } from "@tanstack/react-router";
```
In `CustomTab()`: add `saveParty` to the existing `useCarolineStore()` destructure, and add:
```ts
  const navigate = useNavigate();
  const [sharing, setSharing] = useState<string | null>(null);
```
Replace the My Packs Share `<button>` onClick (was ~142-145) and its label:
```tsx
                    onClick={async () => {
                      try {
                        setSharing(p.id);
                        const { createParty, stripPack } = await import("@/lib/party-api");
                        const { code, createdAt } = await createParty(p);
                        saveParty({ code, pack: stripPack(p), createdAt });
                        navigate({ to: "/share/$code", params: { code } });
                      } catch (e) {
                        alert((e as Error).message);
                      } finally {
                        setSharing(null);
                      }
                    }}
                    disabled={sharing === p.id}
```
Label:
```tsx
                    <Share2 className="h-3.5 w-3.5" /> {sharing === p.id ? "Sharing…" : "Share"}
```

- [ ] **Step 8: Typecheck**

Run: `bun run build`
Expected: builds with no TS errors. (Fix any remaining `packId`/`DicePack` references the compiler flags.)

- [ ] **Step 9: Commit**

```bash
git add src/lib/caroline-store.ts src/routes/share.\$code.tsx src/routes/party.\$code.tsx src/routes/app.party.tsx src/routes/app.custom.tsx
git commit -m "feat(party): PartyLink holds pack inline + saveParty; share uploads pack"
```

---

### Task 4: Share screen shows the code (not a link)

**Files:**
- Modify: `src/routes/share.$code.tsx` (show the code, drop the URL)

**Interfaces:**
- Consumes: a party saved locally under `code` (created in Task 3's Share flow).
- Produces: the share screen displays the code with Copy / native-share of code text.

- [ ] **Step 1: Show the code on the share screen** — `src/routes/share.$code.tsx`

Replace the URL block (the `Code` card + the `{url}` line, ~93-101) so it shows only the code, and change the `share()`/`copy()` to use the **code** text, not a URL:

Replace `copy()` and `share()`:
```ts
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  async function share() {
    const text = `Join my Caroline party — open the app, Party tab, code ${code}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Caroline — Party", text }); } catch {}
    } else {
      copy();
    }
  }
```
Delete the `url` state + effect (lines ~26-29) and the `{url}` truncate line (~98-100). Keep the big code display (`{code}`). Update the helper copy under the heading to: "Share this code. A friend opens Caroline → Party → types the code (valid 10 hours)."

- [ ] **Step 2: Verify build**

Run: `bun run build`
Expected: no TS errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/share.\$code.tsx
git commit -m "feat(party): share screen shows the code"
```

---

### Task 5: Join flow — single code input in the Party tab

**Files:**
- Modify: `src/routes/app.party.tsx` (PartyTab `join` ~91-94; the input block; state)

**Interfaces:**
- Consumes: `fetchParty`, `isExpired` (Tasks 1-2); `saveParty` (Task 3).
- Produces: typing a valid code saves the party locally and opens `/party/$code`.

- [ ] **Step 1: Rewrite `join` and state** — `src/routes/app.party.tsx`

In `PartyTab()`, update the destructure to include `saveParty`, drop `link`:
```ts
  const { parties, deleteParty, saveParty } = useCarolineStore();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
```
Replace `join`:
```ts
  async function join(c: string) {
    const clean = c.trim().toUpperCase();
    if (!clean) return;
    try {
      setJoining(true);
      setJoinError(null);
      const { fetchParty, isExpired } = await import("@/lib/party-api");
      const res = await fetchParty(clean);
      if (!res) { setJoinError("No party found for that code."); return; }
      if (isExpired(res.createdAt)) { setJoinError("This party has expired."); return; }
      saveParty({ code: clean, pack: res.pack, createdAt: res.createdAt });
      navigate({ to: "/party/$code", params: { code: clean } });
    } catch (e) {
      setJoinError((e as Error).message);
    } finally {
      setJoining(false);
    }
  }
```

- [ ] **Step 2: Replace the input block** — remove the "Paste Party Link" input + "Open Party Link" button + the "or" divider (the block spanning ~126-151), leaving only the code input. Update the code input area (~153-167) to show the error and busy state:

```tsx
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-cream px-3">
            <Hash className="h-4 w-4 text-ink/50" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Party Code"
              className="w-full bg-transparent py-3 font-display text-base font-bold tracking-[0.2em] outline-none placeholder:text-ink/40 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
            />
            <button
              onClick={() => join(code)}
              disabled={joining}
              className="rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>
          {joinError && <p className="text-xs text-coral">{joinError}</p>}
        </div>
```
Remove the now-unused `Link2` import and `link`/`setLink` state.

- [ ] **Step 3: Verify build**

Run: `bun run build`
Expected: no TS errors, no unused-import errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/app.party.tsx
git commit -m "feat(party): join by code in the Party tab"
```

---

### Task 6: `party.$code` fetch fallback (self-sufficient route)

**Files:**
- Modify: `src/routes/party.$code.tsx` (component top, ~15-27)

**Interfaces:**
- Consumes: `fetchParty` (Task 2); `saveParty` (Task 3).
- Produces: opening `/party/$code` for a code not in local storage hydrates it once.

- [ ] **Step 1: Add hydration effect** — `src/routes/party.$code.tsx`

After the existing `party`/`pack` memos, add `saveParty` to the store destructure and:
```ts
  const [hydrating, setHydrating] = useState(false);
  useEffect(() => {
    if (party || hydrating) return;
    setHydrating(true);
    import("@/lib/party-api").then(async ({ fetchParty }) => {
      try {
        const res = await fetchParty(code.toUpperCase());
        if (res) saveParty({ code: code.toUpperCase(), pack: res.pack, createdAt: res.createdAt });
      } catch { /* fall through to the expired screen */ }
      finally { setHydrating(false); }
    });
  }, [party, code, hydrating, saveParty]);
```
Guard the "expired" early-return so it doesn't flash during hydration:
```ts
  if (!party || !pack) {
    if (hydrating) return null; // brief: waiting on fetch
    // ...existing expired UI...
  }
```

- [ ] **Step 2: Verify build**

Run: `bun run build`
Expected: no TS errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/party.\$code.tsx
git commit -m "feat(party): hydrate /party/\$code from Supabase when not local"
```

---

### Task 7: Config, version bump, and full verification

**Files:**
- Modify: `.env` (add Supabase keys)
- Modify: `ios/App/App.xcodeproj/project.pbxproj` (`MARKETING_VERSION` → 1.1; `CURRENT_PROJECT_VERSION` → 3, both configs)

**Interfaces:** none.

- [ ] **Step 1: Add env keys** — append to `.env` (values from the user's Supabase project):

```
# Supabase — party code sharing (public anon key, safe to ship)
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

- [ ] **Step 2: Bump the app version** — in `project.pbxproj`, set both build configs:

```
MARKETING_VERSION = 1.1;
CURRENT_PROJECT_VERSION = 3;
```

- [ ] **Step 3: Run the full test + build + sync**

Run: `bun run test && bun run sync:ios`
Expected: tests pass; sync completes; then verify the keys are baked in:
`grep -rl "YOUR-PROJECT.supabase.co" ios/App/App/public/assets/*.js` → prints a file.

- [ ] **Step 4: Commit**

```bash
git add ios/App/App.xcodeproj/project.pbxproj
git commit -m "chore(party): app v1.1 (build 3) for Party Codes"
```

*(`.env` is gitignored — do not commit it.)*

---

## Supabase setup (user does this before Task 7; provided verbatim for them)

1. Create a free Supabase project.
2. SQL editor → run:
```sql
create table parties (
  code       text primary key,
  pack       jsonb not null,
  created_at timestamptz not null default now()
);
alter table parties enable row level security;
create policy "anon insert parties" on parties for insert to anon with check (true);
create policy "anon select parties" on parties for select to anon using (true);
```
3. Project Settings → API → copy **Project URL** + **anon public** key into `.env` (Task 7 Step 1).

## Manual / device verification (after all tasks + Supabase live)

- Create a party from a custom pack on device A → a 6-char code appears; Copy works.
- On device B (different Apple ID), Party tab → type the code → pack loads and rolls.
- Wrong code → "No party found." Airplane mode → "check your connection" (no hang).
- Backdate a row's `created_at` >10h in Supabase → join shows "expired."

## Notes / follow-ups (out of scope)

- Sharing is on the Pro-only "My Packs" list (matches the Pro feature framing). Preset-pack sharing can be added later by giving presets a Share button that calls the same flow.
- Optional later: a `get_party(code)` RPC instead of open table `select`; server-side expiry cleanup; Universal Links for auto "open in app."
