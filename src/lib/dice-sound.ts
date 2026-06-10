// Real dice-roll sound (CC0 sample served from CDN) + photo helpers.
import diceRollAsset from "@/assets/dice-roll.mp3.asset.json";

let diceAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!diceAudio) {
    diceAudio = new Audio(diceRollAsset.url);
    diceAudio.preload = "auto";
    diceAudio.volume = 0.9;
  }
  return diceAudio;
}

export function playRollSound() {
  const a = getAudio();
  if (!a) return;
  try {
    // Clone so rapid taps overlap naturally instead of being cut off.
    const node = a.cloneNode(true) as HTMLAudioElement;
    node.volume = 0.9;
    const p = node.play();
    if (p && typeof p.catch === "function") p.catch(() => { /* autoplay blocked */ });
  } catch {
    // ignore
  }
}


// Naive "background removal": clears near-white pixels and softens edges.
// Good enough for prototype emoji-style pip art on light backgrounds.
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
          // brightness + low color variance => background
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
