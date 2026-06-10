import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { CustomDieFace, PhoneShell } from "@/components/caroline/Dice";

export const Route = createFileRoute("/party/$code")({
  head: () => ({ meta: [{ title: "Party Pack — Caroline" }] }),
  component: PartyActive,
});

const TEN_HOURS = 10 * 60 * 60 * 1000;

function PartyActive() {
  const { code } = useParams({ from: "/party/$code" });
  const { parties, packs } = useCarolineStore();
  const party = useMemo(() => parties.find((p) => p.code === code), [parties, code]);
  const pack = useMemo(() => packs.find((p) => p.id === party?.packId), [packs, party]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [rolled, setRolled] = useState<number[]>([]);
  const [tumbling, setTumbling] = useState(false);

  // No matching party in local store, or expired
  const expired = !party || now - party.createdAt > TEN_HOURS;
  const remaining = party ? Math.max(0, TEN_HOURS - (now - party.createdAt)) : 0;
  const hoursLeft = Math.floor(remaining / 3_600_000);
  const minsLeft = Math.floor((remaining % 3_600_000) / 60_000);

  function roll() {
    if (!pack) return;
    setTumbling(true);
    setTimeout(() => {
      setRolled([0, 1, 2].map(() => Math.floor(Math.random() * pack.sides.length)));
      setTumbling(false);
    }, 450);
  }

  if (!party || !pack) {
    return (
      <PhoneShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">⌛</div>
          <h1 className="mt-3 font-display text-3xl font-black">This Party Link expired.</h1>
          <p className="mt-2 text-sm text-ink/65">
            Party packs are valid for 10 hours. Ask your friend for a fresh link.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/app/party"
              className="rounded-full border border-ink/20 bg-card px-5 py-3 text-sm font-semibold"
            >
              Back to Party
            </Link>
            <Link
              to="/app/pro"
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            >
              Unlock Pro to host your own
            </Link>
          </div>
        </div>
      </PhoneShell>
    );
  }

  if (expired) {
    return (
      <PhoneShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-3xl font-black">This Party Link expired.</h1>
          <Link
            to="/app/pro"
            className="mt-6 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
          >
            Unlock Pro to create your own dice packs
          </Link>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="px-5 pb-16 pt-12">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Party Pack · {code}
        </div>
        <div className="mt-1 flex items-end justify-between">
          <h1 className="font-display text-4xl font-black leading-[0.95]">{pack.name}</h1>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            <Clock className="h-3 w-3" /> {hoursLeft}h {minsLeft}m
          </span>
        </div>

        <div
          className="mt-6 rounded-3xl border border-ink/15 p-4 shadow-pop"
          style={{ background: pack.color }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/65">
            All sides
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pack.sides.map((s, i) => (
              <CustomDieFace key={i} text={s.text} emoji={s.emoji} photo={s.photo} size={86} bg="var(--cream)" />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-ink/12 bg-card p-5 shadow-pop">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Rolled
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {(rolled.length ? rolled : [0, 0, 0]).map((idx, i) => {
              const s = pack.sides[idx];
              return (
                <CustomDieFace
                  key={i}
                  text={s.text}
                  emoji={s.emoji}
                  photo={s.photo}
                  size={96}
                  bg={pack.color}
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

        <Link
          to="/app/pro"
          className="mt-4 block rounded-2xl bg-ink p-4 text-cream"
        >
          <div className="font-display text-base font-bold">Love this pack?</div>
          <div className="text-xs opacity-75">
            Unlock Pro to save, edit, and host your own Party Links.
          </div>
        </Link>
      </div>
    </PhoneShell>
  );
}
