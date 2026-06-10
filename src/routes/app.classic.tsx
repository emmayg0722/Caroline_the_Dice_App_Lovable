import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { DieFace, Confetti } from "@/components/caroline/Dice";
import { useCarolineStore } from "@/lib/caroline-store";
import { BeerPopup, useBeerTrigger } from "@/components/caroline/BeerPopup";
import { playRollSound } from "@/lib/dice-sound";

export const Route = createFileRoute("/app/classic")({
  head: () => ({ meta: [{ title: "Classic Dice — Caroline" }] }),
  component: ClassicPage,
});

const DIE_BG = ["var(--butter)", "var(--pink)", "var(--powder)", "var(--sage)", "var(--lavender)", "var(--cream)"];

function ClassicPage() {
  const { recentScores, recordRoll } = useCarolineStore();
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
      // delay beer popup so it doesn't interrupt the roll animation
      setTimeout(() => {
        if (showBeer) setBeer(true);
      }, 600);
    }, 450);
  }

  // shake to roll
  useEffect(() => {
    let last = 0;
    let lx = 0, ly = 0, lz = 0;
    function onMotion(e: DeviceMotionEvent) {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const dx = Math.abs(a.x - lx);
      const dy = Math.abs(a.y - ly);
      const dz = Math.abs(a.z - lz);
      lx = a.x; ly = a.y; lz = a.z;
      const now = Date.now();
      if (dx + dy + dz > 28 && now - last > 900) {
        last = now;
        roll();
      }
    }
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, showBeer]);

  return (
    <div className="px-5 pt-12">
      <Confetti show={confetti} />
      <BeerPopup open={beer} onClose={() => setBeer(false)} />

      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Classic
          </div>
          <h1 className="mt-1 font-display text-5xl font-black leading-none">
            Caroline
          </h1>
          <div className="mt-1 font-display text-2xl italic text-coral">the dice</div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <section className="mt-6">
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
              className={`flex-1 rounded-xl border px-0 py-3 font-display text-lg font-bold transition ${
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

      <section className="relative mt-8">
        <div className="absolute inset-x-6 top-6 -z-10 h-56 rounded-[36px] bg-pink/60 blur-2xl" />
        <div className="relative grid min-h-[280px] place-items-center rounded-3xl border border-ink/12 bg-card p-5 shadow-pop">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {dice.map((v, i) => (
              <DieFace
                key={i}
                value={v}
                size={count <= 2 ? 144 : count <= 4 ? 112 : 88}
                bg={DIE_BG[i % DIE_BG.length]}
                tumbling={tumbling}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-5 gap-3">
        <div className="col-span-2 rounded-3xl border border-ink/12 bg-ink p-4 text-cream shadow-pop">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
            Total Score
          </div>
          <div className="mt-1 font-display text-5xl font-black leading-none">
            {total}
          </div>
        </div>
        <div className="col-span-3 rounded-3xl border border-ink/12 bg-card p-4 shadow-pop">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Recent Scores
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recentScores.length === 0 && (
              <span className="text-xs text-ink/40">No rolls yet — go!</span>
            )}
            {recentScores.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-butter px-2.5 py-1 font-display text-sm font-bold"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <button
        onClick={roll}
        className="mt-5 w-full rounded-full bg-coral py-4 font-display text-xl font-black text-white shadow-pop active:scale-[0.99]"
      >
        Roll
      </button>
    </div>
  );
}
