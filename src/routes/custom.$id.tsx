import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Save, X } from "lucide-react";
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
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  function update(i: number, patch: { text?: string; emoji?: string; photo?: string | null }) {
    setPack((p) => {
      const sides = p.sides.slice();
      const next = { ...sides[i] };
      if (patch.text !== undefined) next.text = patch.text;
      if (patch.emoji !== undefined) next.emoji = patch.emoji;
      if (patch.photo !== undefined) {
        if (patch.photo === null) delete next.photo;
        else next.photo = patch.photo;
      }
      sides[i] = next;
      return { ...p, sides };
    });
  }

  function onPickPhoto(i: number, file: File) {
    // Compress to keep localStorage small
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 320;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
        update(i, { photo: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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
              <CustomDieFace
                key={i}
                text={s.text || "—"}
                emoji={s.emoji}
                photo={s.photo}
                size={92}
                bg="var(--cream)"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Six dice sides
          </div>
          {pack.sides.map((s, i) => (
            <div key={i} className="rounded-2xl border border-ink/12 bg-card p-2">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-cream font-display text-sm font-bold text-ink/70">
                  {i + 1}
                </div>
                <input
                  value={s.emoji ?? ""}
                  onChange={(e) => update(i, { emoji: e.target.value.slice(0, 2) })}
                  placeholder="🎲"
                  className="w-12 rounded-xl bg-cream py-2 text-center text-xl outline-none"
                />
                <input
                  value={s.text}
                  onChange={(e) => update(i, { text: e.target.value })}
                  placeholder={`Side ${i + 1}`}
                  className="flex-1 rounded-xl bg-cream px-3 py-2 text-sm outline-none"
                />
                {s.photo ? (
                  <button
                    onClick={() => update(i, { photo: null })}
                    className="relative h-9 w-9 overflow-hidden rounded-xl border border-ink/15"
                    aria-label="Remove photo"
                  >
                    <img src={s.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-ink/40 text-white">
                      <X className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => fileInputs.current[i]?.click()}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-cream text-ink/60"
                    aria-label="Add photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input
                  ref={(el) => {
                    fileInputs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPickPhoto(i, file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          ))}
          <p className="px-1 pt-1 text-[11px] text-ink/55">
            Photos are stored locally on your device only.
          </p>
        </div>


        {error && (
          <div className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm text-coral">{error}</div>
        )}
      </div>
    </div>
  );
}
