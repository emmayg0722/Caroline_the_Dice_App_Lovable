import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Share2, Trash2, Lock, Dices } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { PRESET_PACKS } from "@/lib/preset-packs";
import { CustomDieFace } from "@/components/caroline/Dice";

export const Route = createFileRoute("/app/custom")({
  head: () => ({ meta: [{ title: "Custom Dice — Caroline" }] }),
  component: CustomTab,
});

function CustomTab() {
  const { pro, packs, deletePack, createParty } = useCarolineStore();

  return (
    <div className="px-5 pt-12">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Custom
      </div>
      <div className="flex items-end justify-between">
        <h1 className="mt-1 font-display text-5xl font-black leading-[0.95]">
          Dice <span className="italic text-coral">Packs</span>
        </h1>
        {pro && (
          <Link
            to="/custom/new"
            className="flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-pop"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        )}
      </div>

      {/* My Packs — Pro only */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">My Packs</h2>
          {!pro && (
            <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink/65">
              <Lock className="h-3 w-3" /> Pro
            </span>
          )}
        </div>

        {!pro && (
          <div className="mt-3 rounded-3xl border border-ink/15 bg-ink p-5 text-cream shadow-pop">
            <h3 className="font-display text-2xl font-black leading-tight">
              Build your party
            </h3>
            <p className="mt-1 text-sm opacity-80">
              Unlock Pro to create unlimited custom packs, add photos of friends,
              and share Party Links.
            </p>
            <Link
              to="/app/pro"
              className="mt-4 inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            >
              Unlock Pro · $4.99
            </Link>
          </div>
        )}

        {pro && packs.length === 0 && (
          <div className="mt-3 rounded-3xl border border-dashed border-ink/25 bg-card p-6 text-center">
            <div className="text-4xl">🎲</div>
            <p className="mt-2 text-sm text-ink/70">
              No packs yet. Create your first custom pack — add names, emojis, or photos.
            </p>
            <Link
              to="/custom/new"
              className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream"
            >
              + New Pack
            </Link>
          </div>
        )}

        {pro && packs.length > 0 && (
          <div className="mt-3 space-y-3">
            {packs.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-ink/12 p-4 shadow-pop"
                style={{ background: p.color }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-xl font-black leading-tight">{p.name}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-ink/65">
                      {p.sides.map((s) => `${s.emoji ?? ""}${s.text}`.trim()).join(" · ")}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePack(p.id)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-ink/10 text-ink/70"
                    aria-label="Delete pack"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link
                    to="/pack/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-center gap-1 rounded-full bg-ink py-2 text-xs font-semibold text-cream"
                  >
                    <Dices className="h-3.5 w-3.5" /> Roll
                  </Link>
                  <Link
                    to="/custom/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-center gap-1 rounded-full bg-cream py-2 text-xs font-semibold"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => {
                      const party = createParty(p.id);
                      window.location.href = `/share/${party.code}`;
                    }}
                    className="flex items-center justify-center gap-1 rounded-full border border-ink/20 bg-card py-2 text-xs font-semibold"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preset Packs — available to everyone */}
      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Preset Packs</h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
            Free · Tap to roll
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {PRESET_PACKS.map((p, i) => (
            <Link
              key={p.id}
              to="/pack/$id"
              params={{ id: p.id }}
              className="block rounded-3xl border border-ink/12 p-4 shadow-pop"
              style={{ background: p.color, transform: `rotate(${i % 2 === 0 ? -0.4 : 0.4}deg)` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                    Preset
                  </div>
                  <div className="mt-0.5 font-display text-xl font-black leading-tight">
                    {p.name}
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-cream">
                  <Dices className="h-3.5 w-3.5" /> Roll
                </span>
              </div>
              <div className="mt-3 flex gap-2 overflow-hidden">
                {p.sides.slice(0, 4).map((s, j) => (
                  <CustomDieFace
                    key={j}
                    text={s.text}
                    emoji={s.emoji}
                    size={64}
                    bg="var(--cream)"
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
