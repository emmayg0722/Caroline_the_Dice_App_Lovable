// Real dice-roll sounds (CC0 samples served from CDN).
import { getStoredSoundId } from "./caroline-store";
import diceA from "@/assets/dice-roll.mp3.asset.json";

export type SoundOption = { id: string; label: string; description: string; url: string };

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "a",
    label: "Two dice · wooden table",
    description: "Sharp, classic clatter.",
    url: "/__l5e/assets-v1/586c394e-55d4-412e-bb08-1dfa443b79de/dice-a.mp3",
  },
  {
    id: "b",
    label: "Four dice · wooden table",
    description: "Fuller, heavier tumble.",
    url: "/__l5e/assets-v1/24ce48c4-d21c-466f-b304-43cefe87246c/dice-b.mp3",
  },
  {
    id: "c",
    label: "Four dice · shaken in hand",
    description: "Rattle only, no table impact.",
    url: "/__l5e/assets-v1/88e298ac-57fd-4b71-a3d5-04fcf7951130/dice-c.mp3",
  },
  {
    id: "d",
    label: "Single die · soft drop",
    description: "Light, quick tap.",
    url: "/__l5e/assets-v1/b7dd3375-80d5-4f97-bbfc-6572af065373/dice-d.mp3",
  },
  {
    id: "e",
    label: "Cup shake · classic",
    description: "Rolled out of a leather cup.",
    url: "/__l5e/assets-v1/c82e484f-842f-49ee-b15f-892bf909916a/dice-e.mp3",
  },
  {
    id: "f",
    label: "Quick tumble",
    description: "Snappy short roll.",
    url: "/__l5e/assets-v1/dae6f38b-a5ed-4584-9c40-f644ed8ba6e3/dice-f.mp3",
  },
  {
    id: "legacy",
    label: "Original sample",
    description: "The first dice clip used in the app.",
    url: diceA.url,
  },
];

const cache = new Map<string, HTMLAudioElement>();

function getAudio(id: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const opt = SOUND_OPTIONS.find((s) => s.id === id) ?? SOUND_OPTIONS[0];
  let a = cache.get(opt.id);
  if (!a) {
    a = new Audio(opt.url);
    a.preload = "auto";
    cache.set(opt.id, a);
  }
  return a;
}

export function playSoundById(id: string) {
  const a = getAudio(id);
  if (!a) return;
  try {
    const node = a.cloneNode(true) as HTMLAudioElement;
    node.volume = 0.9;
    const p = node.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // ignore
  }
}

export function playRollSound() {
  let id = "a";
  try { id = getStoredSoundId(); } catch { /* SSR */ }
  playSoundById(id);
}

// Naive "background removal": clears near-white pixels and softens edges.
export function cutoutWhiteBackground(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const max3 = Math.max(r, g, b);
          const min3 = Math.min(r, g, b);
          const sat = max3 - min3;
          if (r > 230 && g > 230 && b > 230 && sat < 25) {
            d[i + 3] = 0;
          } else if (r > 210 && g > 210 && b > 210 && sat < 35) {
            d[i + 3] = Math.round(((255 - r) / 45) * 255);
          }
        }
        ctx.putImageData(id, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function compressPhoto(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
