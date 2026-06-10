// Real dice-roll sounds (CC0 samples served from CDN).
import { getStoredSoundId } from "./caroline-store";

export type SoundOption = { id: string; label: string; description: string; url: string };

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "b",
    label: "Wooden table tumble",
    description: "Full, heavy clatter on wood.",
    url: "/__l5e/assets-v1/24ce48c4-d21c-466f-b304-43cefe87246c/dice-b.mp3",
  },
  {
    id: "clack",
    label: "Click-clack",
    description: "Sharp, snappy click-clack.",
    url: "/__l5e/assets-v1/b90475b1-be20-473e-a67c-5c0c5d410b33/dice-clack.mp3",
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
  let id = "b";
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
