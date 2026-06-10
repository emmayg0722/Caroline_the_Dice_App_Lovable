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

  return { ...s, setPro, recordRoll, savePack, deletePack, createParty, deleteParty, setSoundId, setDieScale };
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
];

export function newPackId() {
  return "pk_" + Math.random().toString(36).slice(2, 10);
}
