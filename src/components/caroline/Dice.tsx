import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { DiceSide } from "@/lib/caroline-store";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_-10%,var(--butter)_0%,transparent_45%),radial-gradient(circle_at_120%_10%,var(--pink)_0%,transparent_40%),var(--cream)]">
      <div className="relative mx-auto min-h-screen w-full max-w-[440px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// Layouts for 1..6 pips on a 3x3 grid.
const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export function Pip({ value }: { value: number }) {
  const dots = PIP_POSITIONS[value] ?? [];
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-3">
      {Array.from({ length: 9 }).map((_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const on = dots.some(([dr, dc]) => dr === r && dc === c);
        return (
          <div key={i} className="flex items-center justify-center">
            {on && <div className="h-2.5 w-2.5 rounded-full bg-ink sm:h-3 sm:w-3" />}
          </div>
        );
      })}
    </div>
  );
}

export function DieFace({
  value,
  size = 144,
  bg = "var(--card)",
  tumbling,
}: {
  value: number;
  size?: number;
  bg?: string;
  tumbling?: boolean;
}) {
  return (
    <div
      className={`shrink-0 rounded-2xl border border-ink/15 shadow-pop ${tumbling ? "animate-tumble" : ""}`}
      style={{ width: size, height: size, background: bg }}
    >
      <Pip value={value} />
    </div>
  );
}

export function CustomDieFace({
  text,
  emoji,
  photo,
  mode,
  pipCount,
  size = 144,
  bg = "var(--pink)",
  tumbling,
}: {
  text: string;
  emoji?: string;
  photo?: string;
  mode?: "side" | "pip";
  /** When in pip mode, repeat the emoji/photo this many times in the dice-pip layout. */
  pipCount?: number;
  size?: number;
  bg?: string;
  tumbling?: boolean;
}) {
  const isPip = mode === "pip";

  if (isPip) {
    const n = Math.max(1, Math.min(6, pipCount ?? 1));
    const dots = PIP_POSITIONS[n];
    // Photo pip uses a black outline silhouette filter.
    const cellSize = Math.round(size * (n <= 2 ? 0.36 : n <= 4 ? 0.3 : 0.26));
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-ink/15 shadow-pop ${tumbling ? "animate-tumble" : ""}`}
        style={{ width: size, height: size, background: bg }}
      >
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-3">
          {Array.from({ length: 9 }).map((_, i) => {
            const r = Math.floor(i / 3);
            const c = i % 3;
            const on = dots.some(([dr, dc]) => dr === r && dc === c);
            return (
              <div key={i} className="flex items-center justify-center">
                {on && (
                  photo ? (
                    <img
                      src={photo}
                      alt=""
                      style={{
                        width: cellSize,
                        height: cellSize,
                        objectFit: "contain",
                        filter:
                          "drop-shadow(1px 0 0 #1a1a1a) drop-shadow(-1px 0 0 #1a1a1a) drop-shadow(0 1px 0 #1a1a1a) drop-shadow(0 -1px 0 #1a1a1a)",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: cellSize, lineHeight: 1 }}>
                      {emoji || "🎲"}
                    </span>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink/15 px-2 text-center shadow-pop ${tumbling ? "animate-tumble" : ""}`}
      style={{ width: size, height: size, background: bg }}
    >
      {photo && (
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {photo && (
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      )}
      <div className="relative flex flex-col items-center">
        {emoji && !photo && (
          <div style={{ fontSize: Math.round(size * 0.3) }} className="leading-none">
            {emoji}
          </div>
        )}
        {text && (
          <div
            className={`mt-1 line-clamp-2 font-display font-bold leading-tight ${
              photo ? "text-white drop-shadow" : "text-ink"
            }`}
            style={{ fontSize: Math.round(size * 0.13) }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

export function AllSidesButton({
  sides,
  packName,
  packColor,
}: {
  sides: DiceSide[];
  packName: string;
  packColor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-full border border-ink/15 bg-card py-3 text-sm font-semibold text-ink/75"
      >
        View all {sides.length} sides
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto w-full max-w-[440px] animate-fade-in rounded-t-[28px] border-t border-ink/15 bg-cream p-5 pb-8 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
                  All sides
                </div>
                <div className="font-display text-xl font-black leading-tight">{packName}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-ink/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-ink/12 bg-card p-3">
              <div className="grid grid-cols-3 gap-2">
                {sides.map((s, i) => (
                  <CustomDieFace
                    key={i}
                    text={s.text}
                    emoji={s.emoji}
                    photo={s.photo}
                    mode={s.mode}
                    pipCount={s.mode === "pip" ? i + 1 : undefined}
                    size={96}
                    bg={packColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["var(--pink)", "var(--butter)", "var(--powder)", "var(--sage)", "var(--lavender)", "var(--coral)"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 block h-2.5 w-2.5 rounded-[2px]"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 8) * 60}ms`,
            transform: `rotate(${(i * 33) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
