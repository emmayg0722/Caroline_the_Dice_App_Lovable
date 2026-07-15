import { createFileRoute, Link, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { CustomDieFace, PhoneShell, AllSidesButton } from "@/components/caroline/Dice";
import { playRollSound, getRollDurationMs } from "@/lib/dice-sound";

export const Route = createFileRoute("/party/$code")({
  head: () => ({ meta: [{ title: "Party Pack — Caroline" }] }),
  component: PartyActive,
});

const TEN_HOURS = 10 * 60 * 60 * 1000;

function PartyActive() {
  const { code } = useParams({ from: "/party/$code" });
  const navigate = useNavigate();
  const router = useRouter();
  const { parties, saveParty } = useCarolineStore();
  const party = useMemo(() => parties.find((p) => p.code === code), [parties, code]);
  const pack = party?.pack;

  const [hydrating, setHydrating] = useState(false);
  const attemptedRef = useRef<string | null>(null);
  useEffect(() => {
    const c = code.toUpperCase();
    if (party || attemptedRef.current === c) return;
    attemptedRef.current = c;
    setHydrating(true);
    import("@/lib/party-api").then(async ({ fetchParty }) => {
      try {
        const res = await fetchParty(c);
        if (res) saveParty({ code: c, pack: res.pack, createdAt: res.createdAt });
      } catch {
        /* fall through to the expired screen */
      } finally {
        setHydrating(false);
      }
    });
  }, [party, code, saveParty]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [count, setCount] = useState(2);
  const [rolled, setRolled] = useState<number[]>([0, 0]);
  const [tumbling, setTumbling] = useState(false);

  const expired = !party || now - party.createdAt > TEN_HOURS;
  const remaining = party ? Math.max(0, TEN_HOURS - (now - party.createdAt)) : 0;
  const hoursLeft = Math.floor(remaining / 3_600_000);
  const minsLeft = Math.floor((remaining % 3_600_000) / 60_000);

  function back() {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/app/party" });
  }

  function roll() {
    if (!pack) return;
    setTumbling(true);
    playRollSound();
    const ms = getRollDurationMs();
    document.documentElement.style.setProperty("--tumble-ms", `${ms}ms`);
    setTimeout(() => {
      setRolled(Array.from({ length: count }, () => Math.floor(Math.random() * pack.sides.length)));
      setTumbling(false);
    }, ms);
  }

  if (!party || !pack) {
    if (hydrating) return null; // waiting on fetch
    return (
      <PhoneShell>
        <div className="px-5 pt-5">
          <button
            onClick={back}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">⌛</div>
          <h1 className="mt-3 font-display text-3xl font-black">This Party Link expired.</h1>
          <p className="mt-2 text-sm text-ink/65">
            Party packs are valid for 10 hours. Ask your friend for a fresh link.
          </p>
          <Link
            to="/app/pro"
            className="mt-6 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
          >
            Unlock Pro to host your own
          </Link>
        </div>
      </PhoneShell>
    );
  }

  if (expired) {
    return (
      <PhoneShell>
        <div className="px-5 pt-5">
          <button
            onClick={back}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
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
      <div className="px-5 pb-16 pt-5">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            <Clock className="h-3 w-3" /> {hoursLeft}h {minsLeft}m
          </span>
        </div>

        <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Party Pack · {code}
        </div>
        <h1 className="mt-1 font-display text-4xl font-black leading-[0.95]">{pack.name}</h1>

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
          className="mt-5 rounded-3xl border border-ink/12 p-5 shadow-pop"
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
                  mode={s.mode}
                  size={count <= 2 ? 144 : count <= 4 ? 112 : 88}
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

        <Link
          to="/app/pro"
          className="mt-6 block rounded-2xl bg-ink p-4 text-cream"
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
