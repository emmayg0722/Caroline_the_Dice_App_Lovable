import { useEffect, useRef } from "react";

type Options = {
  enabled?: boolean;
  threshold?: number;
  cooldownMs?: number;
};

/**
 * Calls `onShake` when the device experiences a sharp motion.
 * Works on iOS (after permission) and Android. No-ops on desktop.
 */
export function useShakeToRoll(onShake: () => void, opts: Options = {}) {
  const { enabled = true, threshold = 28, cooldownMs = 900 } = opts;
  const cbRef = useRef(onShake);
  cbRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (typeof window.DeviceMotionEvent === "undefined") return;

    let last = 0;
    let lx = 0, ly = 0, lz = 0;
    let primed = false;

    function onMotion(e: DeviceMotionEvent) {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      if (!primed) {
        lx = a.x; ly = a.y; lz = a.z;
        primed = true;
        return;
      }
      const dx = Math.abs(a.x - lx);
      const dy = Math.abs(a.y - ly);
      const dz = Math.abs(a.z - lz);
      lx = a.x; ly = a.y; lz = a.z;
      const now = Date.now();
      if (dx + dy + dz > threshold && now - last > cooldownMs) {
        last = now;
        cbRef.current();
      }
    }

    // iOS 13+ requires explicit permission. Request lazily on first user tap.
    const Ctor = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    let granted = typeof Ctor.requestPermission !== "function";

    async function requestPerm() {
      if (granted) return;
      try {
        const res = await Ctor.requestPermission?.();
        if (res === "granted") {
          granted = true;
          window.addEventListener("devicemotion", onMotion);
        }
      } catch {
        /* user dismissed */
      } finally {
        window.removeEventListener("touchend", requestPerm);
        window.removeEventListener("click", requestPerm);
      }
    }

    if (granted) {
      window.addEventListener("devicemotion", onMotion);
    } else {
      window.addEventListener("touchend", requestPerm, { once: false });
      window.addEventListener("click", requestPerm, { once: false });
    }

    return () => {
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("touchend", requestPerm);
      window.removeEventListener("click", requestPerm);
    };
  }, [enabled, threshold, cooldownMs]);
}
