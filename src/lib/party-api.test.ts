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
