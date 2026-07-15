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
