import type { DicePack, DiceSide } from "./caroline-store";

// Party Links have no backend: nothing is transmitted anywhere when a link
// is created. For a link to actually work on a friend's device, the pack's
// content has to travel *inside the link itself* — so the "code" in a Party
// Link is really a compact, URL-safe encoding of the pack, not a lookup key
// into shared storage. This trades a short, human-typeable code for a link
// that genuinely works cross-device with no server.
//
// Photos are intentionally left out of the encoding: a data-URI photo can be
// tens of KB, which would blow past practical URL length limits. Packs that
// use photos on any side can still be shared, but the recipient sees that
// side's emoji/text only, not the photo. Callers should surface this to the
// user before sharing (see the `hasPhotoSide` check in the Share flow).

const TEN_HOURS_MS = 10 * 60 * 60 * 1000;

type SharedSide = Pick<DiceSide, "text" | "emoji" | "mode">;

type SharedPayload = {
  n: string; // pack name
  c: string; // pack color
  s: SharedSide[]; // sides, without photos
  t: number; // createdAt, ms epoch — the expiry clock travels with the link
};

function toBase64Url(json: string): string {
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  return typeof window === "undefined"
    ? Buffer.from(withPadding, "base64").toString("utf-8")
    : decodeURIComponent(escape(atob(withPadding)));
}

export function hasPhotoSide(pack: Pick<DicePack, "sides">): boolean {
  return pack.sides.some((s) => Boolean(s.photo));
}

/** Encodes a pack (minus photos) plus its creation time into a URL-safe token. */
export function encodeSharedPack(pack: DicePack, createdAt: number): string {
  const payload: SharedPayload = {
    n: pack.name,
    c: pack.color,
    s: pack.sides.map((s) => ({ text: s.text, emoji: s.emoji, mode: s.mode })),
    t: createdAt,
  };
  return toBase64Url(JSON.stringify(payload));
}

/** Reconstructs a shareable DicePack (and its expiry) from a link token, or
 *  null if the token isn't a valid encoded pack (e.g. a pre-Phase-2 short
 *  code, or a corrupted paste). */
export function decodeSharedPack(
  token: string,
): { pack: DicePack; createdAt: number; expired: boolean } | null {
  try {
    const json = fromBase64Url(token);
    const payload = JSON.parse(json) as SharedPayload;
    if (
      typeof payload.n !== "string" ||
      !Array.isArray(payload.s) ||
      typeof payload.t !== "number"
    ) {
      return null;
    }
    const pack: DicePack = {
      id: `shared_${token.slice(0, 12)}`,
      name: payload.n,
      color: payload.c,
      createdAt: payload.t,
      sides: payload.s.map((s) => ({ text: s.text ?? "", emoji: s.emoji, mode: s.mode })),
    };
    return {
      pack,
      createdAt: payload.t,
      expired: Date.now() - payload.t > TEN_HOURS_MS,
    };
  } catch {
    return null;
  }
}

export const PARTY_LINK_TTL_MS = TEN_HOURS_MS;
