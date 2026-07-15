import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Hash, Clock, ChevronRight, Trash2 } from "lucide-react";
import { useCarolineStore, type PartyLink } from "@/lib/caroline-store";
import type { SharedPack } from "@/lib/party-api";

export const Route = createFileRoute("/app/party")({
  head: () => ({ meta: [{ title: "Party Pack — Caroline" }] }),
  component: PartyTab,
});

const TEN_HOURS = 10 * 60 * 60 * 1000;

function SwipeRow({
  party,
  pack,
  remaining,
  onDelete,
}: {
  party: PartyLink;
  pack: SharedPack;
  remaining: number;
  onDelete: () => void;
}) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);

  function start(x: number) { startX.current = x; }
  function move(x: number) {
    if (startX.current == null) return;
    const d = Math.min(0, x - startX.current);
    setDx(Math.max(d, -120));
  }
  function end() {
    if (dx < -70) setDx(-96);
    else setDx(0);
    startX.current = null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button
        onClick={onDelete}
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center gap-1 bg-coral text-xs font-semibold text-white"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
      <Link
        to="/party/$code"
        params={{ code: party.code }}
        onTouchStart={(e) => start(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={end}
        onMouseDown={(e) => start(e.clientX)}
        onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
        onMouseUp={end}
        onMouseLeave={end}
        style={{
          transform: `translateX(${dx}px)`,
          transition: startX.current == null ? "transform 0.2s" : "none",
          background: pack.color,
        }}
        className="relative flex items-center justify-between gap-3 rounded-2xl border border-ink/12 p-4 shadow-pop"
      >
        <div className="min-w-0">
          <div className="font-display text-base font-black leading-tight">{pack.name}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-ink/60">
            {party.code} · {h}h {m}m left
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink/55" />
      </Link>
    </div>
  );
}

function PartyTab() {
  const navigate = useNavigate();
  const { parties, deleteParty, saveParty } = useCarolineStore();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  async function join(c: string) {
    const clean = c.trim().toUpperCase();
    if (!clean) return;
    try {
      setJoining(true);
      setJoinError(null);
      const { fetchParty, isExpired } = await import("@/lib/party-api");
      const res = await fetchParty(clean);
      if (!res) { setJoinError("No party found for that code."); return; }
      if (isExpired(res.createdAt)) { setJoinError("This party has expired."); return; }
      saveParty({ code: clean, pack: res.pack, createdAt: res.createdAt });
      navigate({ to: "/party/$code", params: { code: clean } });
    } catch (e) {
      setJoinError((e as Error).message);
    } finally {
      setJoining(false);
    }
  }

  const active = parties
    .map((p) => {
      const pack = p.pack;
      const remaining = TEN_HOURS - (now - p.createdAt);
      return { party: p, pack, remaining };
    })
    .filter((x) => x.pack && x.remaining > 0);

  return (
    <div className="px-5 pt-20">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Party
      </div>
      <h1 className="mt-1 font-display text-4xl font-black leading-[0.95]">
        Party Pack
      </h1>
      <p className="mt-2 max-w-[20rem] text-sm text-ink/70">
        Join a shared dice pack and play for 10 hours.
      </p>

      <div className="mt-4 rounded-3xl border border-ink/15 bg-lavender p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-black leading-tight">
            Got a Party Code?
          </span>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            <Clock className="h-3 w-3" /> 10 hrs
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-cream px-3">
            <Hash className="h-4 w-4 text-ink/50" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Party Code"
              className="w-full bg-transparent py-3 font-display text-base font-bold tracking-[0.2em] outline-none placeholder:text-ink/40 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
            />
            <button
              onClick={() => join(code)}
              disabled={joining}
              className="rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>
          {joinError && <p className="text-xs text-coral">{joinError}</p>}
        </div>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Your Party Packs</h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
            Swipe ← to delete
          </span>
        </div>
        {active.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-ink/20 bg-card p-5 text-center text-sm text-ink/65">
            No active party packs yet. Enter a party code above to join one.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {active.map(({ party, pack, remaining }) => (
              <SwipeRow
                key={party.code}
                party={party}
                pack={pack!}
                remaining={remaining}
                onDelete={() => deleteParty(party.code)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
