import { useEffect, useState, useCallback } from "react";

export type DiceSide = {
  text: string;
  emoji?: string;
  photo?: string;
  // "side" (default) = free combo of text + emoji + photo.
  // "pip" = classic die feel: emoji OR cutout image only, no text.
  mode?: "side" | "pip";
};

export type DicePack = {
  id: string;
  name: string;
  sides: DiceSide[];
  color: string;
  createdAt: number;
};


export type PartyLink = {
  code: string;
  packId: string;
  createdAt: number;
};

const KEY = "caroline.state.v1";

type State = {
  pro: boolean;
  rolls: number;
  recentScores: number[];
  packs: DicePack[];
  parties: PartyLink[];
  soundId: string;
  dieScale: number;
  theme: "default" | "dark";
};

const DEFAULT_STATE: State = {
  pro: false,
  rolls: 0,
  recentScores: [],
  packs: [],
  parties: [],
  soundId: "b",
  dieScale: 1,
  theme: "default",
};

function load(): State {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

const listeners = new Set<() => void>();
let state: State | null = null;

function ensure(): State {
  if (state === null) state = load();
  return state;
}

function save(next: State) {
  state = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function useCarolineStore() {
  // Gate SSR + first client render to DEFAULT_STATE to avoid hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    if (state === null) state = load();
    setHydrated(true);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const s = hydrated ? ensure() : DEFAULT_STATE;

  const setPro = useCallback((pro: boolean) => save({ ...ensure(), pro }), []);
  const recordRoll = useCallback((total: number) => {
    const cur = ensure();
    save({
      ...cur,
      rolls: cur.rolls + 1,
      recentScores: [total, ...cur.recentScores].slice(0, 6),
    });
  }, []);
  const savePack = useCallback((pack: DicePack) => {
    const cur = ensure();
    const exists = cur.packs.some((p) => p.id === pack.id);
    const packs = exists
      ? cur.packs.map((p) => (p.id === pack.id ? pack : p))
      : [pack, ...cur.packs];
    save({ ...cur, packs });
  }, []);
  const deletePack = useCallback((id: string) => {
    const cur = ensure();
    save({ ...cur, packs: cur.packs.filter((p) => p.id !== id) });
  }, []);
  const createParty = useCallback((packId: string): PartyLink => {
    const cur = ensure();
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const party = { code, packId, createdAt: Date.now() };
    save({ ...cur, parties: [party, ...cur.parties].slice(0, 20) });
    return party;
  }, []);
  const deleteParty = useCallback((code: string) => {
    const cur = ensure();
    save({ ...cur, parties: cur.parties.filter((p) => p.code !== code) });
  }, []);

  const setSoundId = useCallback((soundId: string) => save({ ...ensure(), soundId }), []);
  const setDieScale = useCallback((dieScale: number) => save({ ...ensure(), dieScale }), []);
  const setTheme = useCallback((theme: "default" | "dark") => save({ ...ensure(), theme }), []);

  return { ...s, setPro, recordRoll, savePack, deletePack, createParty, deleteParty, setSoundId, setDieScale, setTheme };
}

export function getStoredSoundId(): string {
  return ensure().soundId;
}

export function shouldShowBeer(rolls: number): boolean {
  if (rolls === 20) return true;
  if (rolls === 60) return true;
  if (rolls > 60 && (rolls - 60) % 100 === 0) return true;
  return false;
}

export const PACK_COLORS = [
  "var(--pink)",
  "var(--butter)",
  "var(--powder)",
  "var(--sage)",
  "var(--lavender)",
  "var(--peach)",
  "var(--mint)",
  "var(--sky)",
  "var(--lemon)",
  "var(--plum)",
  "var(--clay)",
  "var(--snow)",
];

export const CARD_SURFACES = [
  "var(--paper)",
  "var(--cream)",
  "var(--sand)",
  "var(--mist)",
  "var(--dusk)",
] as const;

/** Pick a card surface that contrasts with a given pack color so dice stand out.
 *  The mapping is hue-aware: warm dice → cool surfaces, cool dice → warm surfaces,
 *  and white/very-light dice always get a tinted surface so they never disappear. */
export function pickCardSurface(packColor: string): string {
  const c = packColor;
  // White / very light dice need a tinted surface to keep an edge.
  if (c.includes("--snow") || c.includes("--cream")) return "var(--mist)";
  // Warm yellows/peaches → cool surface
  if (c.includes("--butter") || c.includes("--lemon") || c.includes("--peach") || c.includes("--clay")) {
    return "var(--mist)";
  }
  // Cool blues/greens → warm surface
  if (c.includes("--powder") || c.includes("--sky") || c.includes("--sage") || c.includes("--mint")) {
    return "var(--sand)";
  }
  // Pinks / purples → neutral paper with a hint of warmth
  if (c.includes("--pink") || c.includes("--plum") || c.includes("--lavender")) {
    return "var(--cream)";
  }
  return "var(--paper)";
}

export function newPackId() {
  return "pk_" + Math.random().toString(36).slice(2, 10);
}
