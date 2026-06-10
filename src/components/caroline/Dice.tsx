import type { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_-10%,var(--butter)_0%,transparent_45%),radial-gradient(circle_at_120%_10%,var(--pink)_0%,transparent_40%),var(--cream)]">
      <div className="relative mx-auto min-h-screen w-full max-w-[440px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function Pip({ value }: { value: number }) {
  const positions: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  const dots = positions[value] ?? [];
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
  size = 96,
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
  size = 96,
  bg = "var(--pink)",
  tumbling,
}: {
  text: string;
  emoji?: string;
  size?: number;
  bg?: string;
  tumbling?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl border border-ink/15 px-2 text-center shadow-pop ${tumbling ? "animate-tumble" : ""}`}
      style={{ width: size, height: size, background: bg }}
    >
      {emoji && <div className="text-3xl leading-none">{emoji}</div>}
      <div className="mt-1 line-clamp-2 font-display text-[13px] font-bold leading-tight text-ink">
        {text}
      </div>
    </div>
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
