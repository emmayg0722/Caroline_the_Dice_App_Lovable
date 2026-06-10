// Shared dice-roll sound + simple white-background cutout helper.

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const AC =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    sharedCtx = new AC();
  } catch {
    return null;
  }
  return sharedCtx;
}

export function playRollSound() {
  const ctx = getCtx();
  if (!ctx) return;
  // iOS/Safari starts suspended until a user gesture. Resume on each call.
  if (ctx.state === "suspended") {
    try { ctx.resume(); } catch { /* noop */ }
  }
  try {
    const t0 = ctx.currentTime;
    // Two quick clacks for a "tumbling dice" feel.
    [0, 0.09, 0.18].forEach((delay, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const t = t0 + delay;
      const f = idx === 0 ? 520 : idx === 1 ? 400 : 320;
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.22);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.28);
    });
    // Small noise burst at the end for "settle"
    const noiseDur = 0.18;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const ng = ctx.createGain();
    ng.gain.value = 0.12;
    src.buffer = buffer;
    src.connect(ng).connect(ctx.destination);
    src.start(t0 + 0.25);
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
