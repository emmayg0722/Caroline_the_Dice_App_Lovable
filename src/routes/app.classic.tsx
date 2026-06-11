import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { DieFace, Confetti } from "@/components/caroline/Dice";
import { useCarolineStore, DIE_PALETTE } from "@/lib/caroline-store";
import { BeerPopup, useBeerTrigger } from "@/components/caroline/BeerPopup";
import { playRollSound, getRollDurationMs } from "@/lib/dice-sound";
import { useShakeToRoll } from "@/hooks/use-shake";

export const Route = createFileRoute("/app/classic")({
  head: () => ({ meta: [{ title: "Classic Dice — Caroline" }] }),
  component: ClassicPage,
});

function ClassicPage() {
  const { recentScores, recordRoll, dieScale, shakeEnabled, dieColorMode } = useCarolineStore();
  const [count, setCount] = useState(2);
  const [dice, setDice] = useState<number[]>([3, 5]);
  const [tumbling, setTumbling] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [beer, setBeer] = useState(false);
  const showBeer = useBeerTrigger();

  useEffect(() => {
    setDice((d) => {
      const next = [...d];
      while (next.length < count) next.push(1 + Math.floor(Math.random() * 6));
      return next.slice(0, count);
    });
  }, [count]);

  const total = dice.reduce((a, b) => a + b, 0);

  function roll() {
    setTumbling(true);
    playRollSound();
    const ms = getRollDurationMs();
    document.documentElement.style.setProperty("--tumble-ms", `${ms}ms`);

    setTimeout(() => {
      const next = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));
      setDice(next);
      const t = next.reduce((a, b) => a + b, 0);
      recordRoll(t);
      setTumbling(false);
      if (count >= 2 && next.every((v) => v === next[0])) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2400);
      }
      setTimeout(() => {
        if (showBeer) setBeer(true);
      }, 600);
    }, ms);
  }

  useShakeToRoll(() => {
    if (!tumbling) roll();
  }, { enabled: shakeEnabled });

  const baseSize = count <= 2 ? 120 : count <= 4 ? 92 : 72;
  const dieSize = Math.round(baseSize * (dieScale || 1));

  return (
    <div className="px-5 pt-5">
      <Confetti show={confetti} />
      <BeerPopup open={beer} onClose={() => setBeer(false)} />

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Classic
        </div>
        <h1 className="mt-1 font-display text-4xl font-black leading-none">
          Caroline
        </h1>
        <div className="mt-0.5 font-display text-xl italic text-coral">the dice</div>
      </div>

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
            Dice count
          </span>
          <span className="text-[11px] text-ink/50">tap or shake to roll</span>
        </div>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 rounded-xl border px-0 py-2 font-display text-base font-bold transition ${
                count === n
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/15 bg-card text-ink/70"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="relative mt-4">
        <div className="absolute inset-x-6 top-4 -z-10 h-44 rounded-[36px] bg-pink/60 blur-2xl" />
        <div className="relative grid min-h-[220px] place-items-center rounded-3xl border border-ink/12 bg-card p-4 shadow-pop">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {dice.map((v, i) => (
              <DieFace
                key={i}
                value={v}
                size={dieSize}
                bg={dieColorMode === "white" ? "#ffffff" : DIE_PALETTE[i % DIE_PALETTE.length]}
                tumbling={tumbling}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-5 gap-3">
        <div className="col-span-2 rounded-2xl border border-ink/12 bg-ink p-3 text-cream shadow-pop">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
            Total
          </div>
          <div className="mt-0.5 font-display text-3xl font-black leading-none">
            {total}
          </div>
        </div>
        <div className="col-span-3 rounded-2xl border border-ink/12 bg-card p-3 shadow-pop">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Recent
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {recentScores.length === 0 ? (
              <span className="text-xs text-ink/40">No rolls yet — go!</span>
            ) : (
              recentScores.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-butter px-2 py-0.5 font-display text-xs font-bold"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <button
        onClick={roll}
        className="mt-3 w-full rounded-full bg-coral py-3.5 font-display text-xl font-black text-white shadow-pop active:scale-[0.99]"
      >
        Roll
      </button>
    </div>
  );
}
