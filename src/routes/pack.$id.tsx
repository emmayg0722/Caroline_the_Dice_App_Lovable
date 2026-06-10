import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { CustomDieFace, Confetti, PhoneShell } from "@/components/caroline/Dice";
import { useCarolineStore } from "@/lib/caroline-store";
import { findPack, PRESET_PACKS } from "@/lib/preset-packs";

export const Route = createFileRoute("/pack/$id")({
  head: () => ({ meta: [{ title: "Roll — Caroline" }] }),
  component: RollPack,
});

function RollPack() {
  const { id } = useParams({ from: "/pack/$id" });
  const navigate = useNavigate();
  const { packs, pro, createParty } = useCarolineStore();
  const pack = findPack(id, packs);
  const isPreset = PRESET_PACKS.some((p) => p.id === id);

  const [count, setCount] = useState(1);
  const [rolled, setRolled] = useState<number[]>([0]);
  const [tumbling, setTumbling] = useState(false);
  const [confetti, setConfetti] = useState(false);

  if (!pack) {
    return (
      <PhoneShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">🎲</div>
          <h1 className="mt-3 font-display text-3xl font-black">Pack not found</h1>
          <Link
            to="/app/custom"
            className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
          >
            Back to Custom
          </Link>
        </div>
      </PhoneShell>
    );
  }

  function roll() {
    setTumbling(true);
    try {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(420, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.32);
      }
    } catch {}
    setTimeout(() => {
      const next = Array.from({ length: count }, () => Math.floor(Math.random() * pack!.sides.length));
      setRolled(next);
      setTumbling(false);
      if (count >= 2 && next.every((v) => v === next[0])) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2200);
      }
    }, 450);
  }

  function shareParty() {
    if (!pro) {
      navigate({ to: "/app/pro" });
      return;
    }
    if (isPreset) {
      navigate({ to: "/app/pro" });
      return;
    }
    const party = createParty(pack!.id);
    navigate({ to: "/share/$code", params: { code: party.code } });
  }

  return (
    <PhoneShell>
      <Confetti show={confetti} />
      <div className="px-5 pb-16 pt-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/app/custom" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            {isPreset ? "Preset Pack" : "My Pack"}
          </span>
          <button
            onClick={shareParty}
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <h1 className="mt-5 font-display text-4xl font-black leading-[0.95]">{pack.name}</h1>

        <div className="mt-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/55">
            Dice count
          </div>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setCount(n);
                  setRolled(Array.from({ length: n }, () => 0));
                }}
                className={`flex-1 rounded-xl border py-2.5 font-display text-base font-bold ${
                  count === n ? "border-ink bg-ink text-cream" : "border-ink/15 bg-card text-ink/70"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div
          className="relative mt-6 rounded-3xl border border-ink/15 p-5 shadow-pop"
          style={{ background: pack.color }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/65">
            Rolled
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {rolled.map((idx, i) => {
              const s = pack.sides[idx];
              return (
                <CustomDieFace
                  key={i}
                  text={s.text}
                  emoji={s.emoji}
                  photo={s.photo}
                  size={count <= 2 ? 110 : count <= 4 ? 86 : 70}
                  bg="var(--cream)"
                  tumbling={tumbling}
                />
              );
            })}
          </div>
        </div>

        <button
          onClick={roll}
          className="mt-5 w-full rounded-full bg-coral py-4 font-display text-xl font-black text-white shadow-pop active:scale-[0.99]"
        >
          Roll
        </button>

        <div className="mt-6 rounded-3xl border border-ink/12 bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            All sides
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pack.sides.map((s, i) => (
              <CustomDieFace
                key={i}
                text={s.text}
                emoji={s.emoji}
                photo={s.photo}
                size={86}
                bg={pack.color}
              />
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
