import { createFileRoute, Link, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { CustomDieFace, Confetti, PhoneShell, AllSidesButton } from "@/components/caroline/Dice";
import { useCarolineStore } from "@/lib/caroline-store";
import { findPack, PRESET_PACKS } from "@/lib/preset-packs";
import { playRollSound } from "@/lib/dice-sound";

export const Route = createFileRoute("/pack/$id")({
  head: () => ({ meta: [{ title: "Roll — Caroline" }] }),
  component: RollPack,
});

function RollPack() {
  const { id } = useParams({ from: "/pack/$id" });
  const navigate = useNavigate();
  const router = useRouter();
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
    playRollSound();
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
    if (!pro || isPreset) {
      navigate({ to: "/app/pro" });
      return;
    }
    const party = createParty(pack!.id);
    navigate({ to: "/share/$code", params: { code: party.code } });
  }

  function back() {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/app/custom" });
  }

  return (
    <PhoneShell>
      <Confetti show={confetti} />
      <div className="px-5 pb-16 pt-12">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
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
                  mode={s.mode}
                  size={count <= 2 ? 165 : count <= 4 ? 128 : 100}
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

        <AllSidesButton sides={pack.sides} packName={pack.name} packColor={pack.color} />
      </div>
    </PhoneShell>
  );
}
