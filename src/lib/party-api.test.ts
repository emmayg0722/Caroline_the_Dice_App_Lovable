import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateCode, stripPack, isExpired, PARTY_TTL_MS, createParty, fetchParty } from "./party-api";

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
