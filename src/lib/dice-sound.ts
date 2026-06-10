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
    url: "/__l5e/assets-v1/b7dd3375-80d5-4f97-bbfc-6572af065373/dice-d.mp3",
  },
  {
    id: "off",
    label: "Off",
    description: "Silent rolls — no sound effect.",
    url: "",
  },
];

const cache = new Map<string, HTMLAudioElement>();

function getAudio(id: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const opt = SOUND_OPTIONS.find((s) => s.id === id) ?? SOUND_OPTIONS[0];
  if (!opt.url) return null;
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

const DEFAULT_ROLL_MS = 825;

function audioDurationMs(id: string): number {
  const a = getAudio(id);
  if (!a) return 0;
  const d = a.duration;
  if (!d || !isFinite(d) || d <= 0) return 0;
  return Math.round(d * 1000);
}

/** Returns the roll animation duration in ms, aligned to the active sound.
 *  If sound is "off", falls back to the first sound's duration. */
export function getRollDurationMs(): number {
  let id = "b";
  try { id = getStoredSoundId(); } catch { /* SSR */ }
  const effective = id === "off" ? "b" : id;
  return audioDurationMs(effective) || DEFAULT_ROLL_MS;
}

/** Warm audio metadata so durations are available before first roll. */
if (typeof window !== "undefined") {
  for (const opt of SOUND_OPTIONS) {
    if (opt.url) getAudio(opt.id);
  }
}

// Edge-flood background removal:
//  1. Sample the four borders to learn the dominant background color(s).
//  2. BFS from every edge pixel, knocking out alpha for pixels within tolerance.
//  3. Feather the cutout edge so silhouettes don't look jagged.
// Works for white, near-white, and uniform colored backgrounds.
export function cutoutWhiteBackground(file: File, max = 384): Promise<string> {
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

        // 1) Sample border pixels for the background reference color, using
        //    the median per-channel so a stray subject pixel on the edge
        //    doesn't poison the reference.
        const rs: number[] = [], gs: number[] = [], bs: number[] = [];
        const sample = (x: number, y: number) => {
          const i = (y * w + x) * 4;
          rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]);
        };
        for (let x = 0; x < w; x++) { sample(x, 0); sample(x, h - 1); }
        for (let y = 0; y < h; y++) { sample(0, y); sample(w - 1, y); }
        const med = (a: number[]) => {
          a.sort((x, y) => x - y);
          return a[a.length >> 1];
        };
        const bgR = med(rs), bgG = med(gs), bgB = med(bs);
        const bgLum = (bgR + bgG + bgB) / 3;
        // Variance among border samples tells us how clean the background is.
        // High-variance backgrounds (busy / textured) need a wider tolerance,
        // clean studio backgrounds need a tighter one to keep edges crisp.
        let variance = 0;
        for (let k = 0; k < rs.length; k++) {
          const dr = rs[k] - bgR, dg = gs[k] - bgG, db = bs[k] - bgB;
          variance += dr * dr + dg * dg + db * db;
        }
        variance = Math.sqrt(variance / rs.length);
        const baseTol = bgLum > 220 ? 40 : bgLum < 40 ? 38 : 32;
        const tol = Math.min(72, Math.round(baseTol + variance * 0.7));
        const tol2 = tol * tol;

        // 2) BFS flood-fill from edges in background-similar pixels.
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];
        const enqueue = (x: number, y: number) => {
          const p = y * w + x;
          if (visited[p]) return;
          const i = p * 4;
          const dr = d[i] - bgR, dg = d[i + 1] - bgG, db = d[i + 2] - bgB;
          if (dr * dr + dg * dg + db * db > tol2) return;
          visited[p] = 1;
          d[i + 3] = 0;
          queue.push(p);
        };
        for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
        for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w - 1, y); }
        while (queue.length) {
          const p = queue.pop()!;
          const x = p % w, y = (p / w) | 0;
          if (x > 0)     enqueue(x - 1, y);
          if (x < w - 1) enqueue(x + 1, y);
          if (y > 0)     enqueue(x, y - 1);
          if (y < h - 1) enqueue(x, y + 1);
        }

        // 3) Feather edge across a wider band, then de-fringe halo color.
        //    A pixel is in the feather band if any neighbour up to `radius`
        //    away is transparent. Alpha ramps from 0 → 255 across the band
        //    by color distance, and we subtract the bg tint from semi-
        //    transparent pixels so light halos don't outline the subject.
        const out = new Uint8ClampedArray(d);
        const radius = Math.max(1, Math.round(Math.min(w, h) / 220));
        const featherLow = tol * 0.45;
        const featherHigh = tol * 1.15;
        const range = featherHigh - featherLow;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            if (visited[p]) continue;
            // Quick neighbour scan
            let nearTransparent = false;
            for (let dy = -radius; dy <= radius && !nearTransparent; dy++) {
              const yy = y + dy;
              if (yy < 0 || yy >= h) continue;
              for (let dx = -radius; dx <= radius; dx++) {
                const xx = x + dx;
                if (xx < 0 || xx >= w) continue;
                if (visited[yy * w + xx]) { nearTransparent = true; break; }
              }
            }
            if (!nearTransparent) continue;
            const i = p * 4;
            const dr = d[i] - bgR, dg = d[i + 1] - bgG, db = d[i + 2] - bgB;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            const t = Math.min(1, Math.max(0, (dist - featherLow) / range));
            const a = Math.round(255 * t);
            out[i + 3] = a;
            if (a > 0 && a < 255) {
              // Un-premultiply the background tint to remove the halo:
              // observed = subject*a + bg*(1-a) ⇒ subject = (observed - bg*(1-a)) / a
              const inv = a / 255;
              out[i]     = Math.max(0, Math.min(255, (d[i]     - bgR * (1 - inv)) / inv));
              out[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bgG * (1 - inv)) / inv));
              out[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bgB * (1 - inv)) / inv));
            }
          }
        }
        ctx.putImageData(new ImageData(out, w, h), 0, 0);
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
