import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { CustomDieFace } from "@/components/caroline/Dice";
import { useCarolineStore, newPackId, PACK_COLORS, type DicePack } from "@/lib/caroline-store";

export const Route = createFileRoute("/custom/$id")({
  head: () => ({ meta: [{ title: "Edit Pack — Caroline" }] }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = useParams({ from: "/custom/$id" });
  return <Editor id={id} />;
}

export function Editor({ id }: { id: string }) {
  const { packs, savePack } = useCarolineStore();
  const navigate = useNavigate();

  const existing = useMemo(() => packs.find((p) => p.id === id), [packs, id]);
  const [pack, setPack] = useState<DicePack>(
    existing ?? {
      id: id === "new" ? newPackId() : id,
      name: "",
      sides: [
        { text: "Lukas", emoji: "🧑" },
        { text: "Emma", emoji: "👩" },
        { text: "Pizza", emoji: "🍕" },
        { text: "Take a shot", emoji: "🥃" },
        { text: "Truth", emoji: "💭" },
        { text: "Dare", emoji: "🔥" },
      ],
      color: PACK_COLORS[Math.floor(Math.random() * PACK_COLORS.length)],
      createdAt: Date.now(),
    }
  );
  const [error, setError] = useState<string | null>(null);

  function update(i: number, key: "text" | "emoji", val: string) {
    setPack((p) => {
      const sides = p.sides.slice();
      sides[i] = { ...sides[i], [key]: val };
      return { ...p, sides };
    });
  }

  function onSave() {
    if (!pack.name.trim()) return setError("Give your pack a name.");
    if (pack.sides.some((s) => !s.text.trim())) return setError("All six sides need text.");
    savePack({ ...pack, name: pack.name.trim() });
    navigate({ to: "/app/custom" });
  }

  return (
    <div className="mx-auto min-h-screen max-w-[440px] bg-cream pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-cream/90 px-5 pb-3 pt-5 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/app/custom" })}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-base font-bold">
          {existing ? "Edit Pack" : "New Pack"}
        </span>
        <button
          onClick={onSave}
          className="flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-xs font-semibold text-white"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      </div>

      <div className="px-5">
        <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Pack name
        </label>
        <input
          value={pack.name}
          onChange={(e) => setPack({ ...pack, name: e.target.value })}
          placeholder="Date Night, What's for Dinner?, Road Trip…"
          className="mt-2 w-full rounded-2xl border border-ink/15 bg-card px-4 py-3 font-display text-lg font-bold outline-none focus:border-ink"
        />

        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Pack color
          </div>
          <div className="mt-2 flex gap-2">
            {PACK_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPack({ ...pack, color: c })}
                className={`h-9 w-9 rounded-full border-2 ${
                  pack.color === c ? "border-ink" : "border-ink/15"
                }`}
                style={{ background: c }}
                aria-label="Pick color"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-ink/12 p-4" style={{ background: pack.color }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/65">
            Preview
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pack.sides.map((s, i) => (
              <CustomDieFace key={i} text={s.text || "—"} emoji={s.emoji} size={92} bg="var(--cream)" />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Six dice sides
          </div>
          {pack.sides.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl border border-ink/12 bg-card p-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-cream font-display text-sm font-bold text-ink/70">
                {i + 1}
              </div>
              <input
                value={s.emoji ?? ""}
                onChange={(e) => update(i, "emoji", e.target.value.slice(0, 2))}
                placeholder="🎲"
                className="w-12 rounded-xl bg-cream py-2 text-center text-xl outline-none"
              />
              <input
                value={s.text}
                onChange={(e) => update(i, "text", e.target.value)}
                placeholder={`Side ${i + 1}`}
                className="flex-1 rounded-xl bg-cream px-3 py-2 text-sm outline-none"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm text-coral">{error}</div>
        )}
      </div>
    </div>
  );
}
