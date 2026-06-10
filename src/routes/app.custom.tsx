import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Share2, Trash2, Lock } from "lucide-react";
import { useCarolineStore, PACK_COLORS } from "@/lib/caroline-store";

export const Route = createFileRoute("/app/custom")({
  head: () => ({ meta: [{ title: "Custom Dice — Caroline" }] }),
  component: CustomTab,
});

const PRESETS = [
  { title: "Friends", emoji: "👯", bg: "var(--pink)" },
  { title: "Foods", emoji: "🍕", bg: "var(--butter)" },
  { title: "Animals", emoji: "🐼", bg: "var(--sage)" },
  { title: "Dares", emoji: "🔥", bg: "var(--coral)" },
];

function CustomTab() {
  const { pro, packs, deletePack, createParty } = useCarolineStore();

  if (!pro) return <FreeState />;

  return (
    <div className="px-5 pt-12">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Custom
      </div>
      <div className="flex items-end justify-between">
        <h1 className="mt-1 font-display text-5xl font-black leading-[0.95]">
          My Dice
          <br />
          Packs
        </h1>
        <Link
          to="/custom/new"
          className="flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-pop"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {packs.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink/25 bg-card p-6 text-center">
            <div className="text-4xl">🎲</div>
            <p className="mt-2 text-sm text-ink/70">
              No packs yet. Create your first custom dice pack.
            </p>
            <Link
              to="/custom/new"
              className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream"
            >
              + New Pack
            </Link>
          </div>
        )}
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
                className="flex items-center justify-center gap-1 rounded-full bg-ink py-2 text-xs font-semibold text-cream"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <Link
                to="/custom/$id"
                params={{ id: p.id }}
                className="flex items-center justify-center rounded-full border border-ink/20 bg-card py-2 text-xs font-semibold"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreeState() {
  return (
    <div className="px-5 pt-12">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Custom · Pro
      </div>
      <h1 className="mt-1 font-display text-5xl font-black leading-[0.95]">
        Custom <span className="italic text-coral">Dice</span>
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Create your own dice packs for any party.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {PRESETS.map((p, i) => (
          <div
            key={p.title}
            className="rounded-3xl border border-ink/12 p-4 shadow-pop"
            style={{ background: p.bg, transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
          >
            <div className="text-3xl">{p.emoji}</div>
            <div className="mt-2 font-display text-xl font-black leading-tight">{p.title}</div>
            <div className="mt-0.5 text-[11px] text-ink/65">Preset pack</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-ink/15 bg-ink p-5 text-cream shadow-pop">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
          <Lock className="h-3 w-3" /> Pro feature
        </div>
        <h3 className="mt-1 font-display text-2xl font-black leading-tight">
          Build your party
        </h3>
        <p className="mt-1 text-sm opacity-80">
          Unlock to create unlimited custom dice packs and share Party Links.
        </p>
        <Link
          to="/app/pro"
          className="mt-4 inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
        >
          Unlock Pro · $4.99
        </Link>
      </div>

      <div className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-ink/50">
        {PACK_COLORS.length} palettes · 6 sides · 1 party
      </div>
    </div>
  );
}
