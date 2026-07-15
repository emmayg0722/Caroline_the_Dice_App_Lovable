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

function getConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
  const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";
  if (!url || !anon) {
    throw new Error("Sharing isn't set up yet.");
  }
  return { url, anon };
}

function authHeaders(anon: string): Record<string, string> {
  return {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    "Content-Type": "application/json",
  };
}

export async function createParty(pack: Parameters<typeof stripPack>[0]): Promise<{ code: string; createdAt: number }> {
  const { url, anon } = getConfig();
  const shared = stripPack(pack);
  const createdAt = Date.now();
  const created_at = new Date(createdAt).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const res = await fetch(`${url}/rest/v1/parties`, {
      method: "POST",
      headers: { ...authHeaders(anon), Prefer: "return=minimal" },
      body: JSON.stringify({ code, pack: shared, created_at }),
    });
    if (res.ok) return { code, createdAt };
    if (res.status === 409) continue; // duplicate code, try another
    throw new Error("Couldn't create party. Please try again.");
  }
  throw new Error("Couldn't create party. Please try again.");
}

export async function fetchParty(code: string): Promise<{ pack: SharedPack; createdAt: number } | null> {
  const { url, anon } = getConfig();
  const fetchUrl = `${url}/rest/v1/parties?code=eq.${encodeURIComponent(code)}&select=pack,created_at`;
  const res = await fetch(fetchUrl, { headers: authHeaders(anon) });
  if (!res.ok) throw new Error("Couldn't reach the party. Check your connection.");
  const rows = (await res.json()) as { pack: SharedPack; created_at: string }[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return { pack: rows[0].pack, createdAt: new Date(rows[0].created_at).getTime() };
}
