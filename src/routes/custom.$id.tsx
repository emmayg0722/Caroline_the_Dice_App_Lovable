import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Save, X, Loader2 } from "lucide-react";
import { CustomDieFace } from "@/components/caroline/Dice";
import { useCarolineStore, newPackId, PACK_COLORS, type DicePack, type DiceSide } from "@/lib/caroline-store";
import { compressPhoto, cutoutWhiteBackground } from "@/lib/dice-sound";

export const Route = createFileRoute("/custom/$id")({
  head: () => ({ meta: [{ title: "Edit Pack — Caroline" }] }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = useParams({ from: "/custom/$id" });
  return <Editor id={id} />;
}

function defaultPack(id: string): DicePack {
  return {
    id: id === "new" ? newPackId() : id,
    name: "My Pack",
    sides: [
      { text: "Lukas", emoji: "🧑", mode: "side" },
      { text: "Emma", emoji: "👩", mode: "side" },
      { text: "Pizza", emoji: "🍕", mode: "side" },
      { text: "Take a shot", emoji: "🥃", mode: "side" },
      { text: "Truth", emoji: "💭", mode: "side" },
      { text: "Dare", emoji: "🔥", mode: "side" },
    ],
    color: PACK_COLORS[Math.floor(Math.random() * PACK_COLORS.length)],
    createdAt: Date.now(),
  };
}

export function Editor({ id }: { id: string }) {
  const { packs, savePack } = useCarolineStore();
  const navigate = useNavigate();

  const existing = useMemo(() => packs.find((p) => p.id === id), [packs, id]);
  const [pack, setPack] = useState<DicePack>(() => existing ?? defaultPack(id));
  const [loadedExistingId, setLoadedExistingId] = useState<string | null>(existing?.id ?? null);
  // Sync once when existing pack hydrates from the store (avoid clobbering user edits).
  useEffect(() => {
    if (existing && loadedExistingId !== existing.id) {
      setPack(existing);
      setLoadedExistingId(existing.id);
    }
  }, [existing, loadedExistingId]);
  const [error, setError] = useState<string | null>(null);
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);
  // Staged cutout shown in a preview modal so the user can confirm before it
  // commits to the side.
  const [preview, setPreview] = useState<
    | { idx: number; mode: "side" | "pip"; data: string; originalUrl: string; originalFile: File }
    | null
  >(null);

  function update(i: number, patch: Partial<Omit<DiceSide, "photo">> & { photo?: string | null }) {
    setPack((p) => {
      const sides = p.sides.slice();
      const next: DiceSide = { ...sides[i] };
      if (patch.text !== undefined) next.text = patch.text;
      if (patch.emoji !== undefined) next.emoji = patch.emoji;
      if (patch.mode !== undefined) next.mode = patch.mode;
      if (patch.photo !== undefined) {
        if (patch.photo === null) delete next.photo;
        else next.photo = patch.photo;
      }
      sides[i] = next;
      return { ...p, sides };
    });
  }

  async function onPickPhoto(i: number, file: File, mode: "side" | "pip", opts?: { force?: boolean }) {
    setBusyIdx(i);
    try {
      const data =
        mode === "pip"
          ? await cutoutWhiteBackground(file, 320, { force: opts?.force })
          : await compressPhoto(file, 320, { force: opts?.force });
      const originalUrl = URL.createObjectURL(file);
      setPreview({ idx: i, mode, data, originalUrl, originalFile: file });
    } catch {
      setError("Couldn't process that photo.");
    } finally {
      setBusyIdx(null);
    }
  }

  function confirmPreview() {
    if (!preview) return;
    update(preview.idx, { photo: preview.data });
    URL.revokeObjectURL(preview.originalUrl);
    setPreview(null);
  }

  function cancelPreview() {
    if (!preview) return;
    URL.revokeObjectURL(preview.originalUrl);
    setPreview(null);
  }

  const [reprocessing, setReprocessing] = useState(false);
  async function retryPreview() {
    if (!preview || reprocessing) return;
    const { idx, mode, originalFile, originalUrl } = preview;
    setReprocessing(true);
    try {
      // Force-bypass the cache so the user sees a fresh attempt.
      const data =
        mode === "pip"
          ? await cutoutWhiteBackground(originalFile, 320, { force: true })
          : await compressPhoto(originalFile, 320, { force: true });
      setPreview({ idx, mode, data, originalUrl, originalFile });
    } catch {
      setError("Couldn't process that photo.");
    } finally {
      setReprocessing(false);
    }
  }

  function onSave() {
    if (!pack.name.trim()) return setError("Give your pack a name.");
    for (const s of pack.sides) {
      if (s.mode === "pip") {
        if (!s.photo && !s.emoji?.trim()) {
          return setError("Pip sides need an emoji or image.");
        }
      } else {
        if (!s.text.trim() && !s.emoji?.trim() && !s.photo) {
          return setError("Each side needs text, emoji, or a photo.");
        }
      }
    }
    savePack({ ...pack, name: pack.name.trim() });
    navigate({ to: "/app/custom" });
  }

  return (
    <div className="mx-auto min-h-screen max-w-[440px] bg-cream pb-24">
      <div
        className="sticky top-0 z-10 flex items-center justify-between bg-cream/90 px-5 pb-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        <button
          onClick={() => navigate({ to: "/app/custom" })}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-base font-bold">
          {id === "new" ? "New Pack" : "Edit Pack"}
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

        <div className="mt-5 rounded-3xl border border-ink/12 bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/65">
            Preview
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pack.sides.map((s, i) => (
              <CustomDieFace
                key={i}
                text={s.text || (s.mode === "pip" ? "" : "—")}
                emoji={s.emoji}
                photo={s.photo}
                mode={s.mode}
                pipCount={s.mode === "pip" ? i + 1 : undefined}
                size={92}
                bg={pack.color}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
            Six dice sides
          </div>
          {pack.sides.map((s, i) => {
            const mode = s.mode ?? "side";
            const busy = busyIdx === i;
            return (
              <div key={i} className="rounded-2xl border border-ink/12 bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-cream font-display text-sm font-bold text-ink/70">
                      {i + 1}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-ink/55">Side {i + 1}</span>
                  </div>
                  <div className="flex rounded-full bg-cream p-0.5 text-[11px] font-semibold">
                    <button
                      onClick={() => update(i, { mode: "side" })}
                      className={`rounded-full px-3 py-1 ${mode === "side" ? "bg-ink text-cream" : "text-ink/60"}`}
                    >
                      Side
                    </button>
                    <button
                      onClick={() => update(i, { mode: "pip", text: "" })}
                      className={`rounded-full px-3 py-1 ${mode === "pip" ? "bg-ink text-cream" : "text-ink/60"}`}
                    >
                      Pip
                    </button>
                  </div>
                </div>

                {mode === "side" ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={s.emoji ?? ""}
                      onChange={(e) => update(i, { emoji: e.target.value.slice(0, 2) })}
                      placeholder="🎲"
                      className="w-12 rounded-xl bg-cream py-2 text-center text-xl outline-none"
                    />
                    <input
                      value={s.text}
                      onChange={(e) => update(i, { text: e.target.value })}
                      placeholder="Text (optional)"
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
                        disabled={busy}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={s.emoji ?? ""}
                      onChange={(e) => update(i, { emoji: e.target.value.slice(0, 2) })}
                      placeholder="🎲"
                      className="w-14 rounded-xl bg-cream py-2 text-center text-2xl outline-none"
                    />
                    <div className="flex-1 text-[11px] text-ink/55">
                      Emoji <span className="opacity-60">or</span> image (background auto-removed).
                    </div>
                    {s.photo ? (
                      <button
                        onClick={() => update(i, { photo: null })}
                        className="relative h-12 w-12 overflow-hidden rounded-xl border border-ink/15 bg-[conic-gradient(at_50%_50%,#eee_25%,#fff_0_50%,#eee_0_75%,#fff_0)]"
                        aria-label="Remove image"
                      >
                        <img src={s.photo} alt="" className="absolute inset-0 h-full w-full object-contain" />
                        <span className="absolute inset-0 grid place-items-center bg-ink/40 text-white">
                          <X className="h-4 w-4" />
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => fileInputs.current[i]?.click()}
                        className="grid h-12 w-12 place-items-center rounded-xl bg-cream text-ink/60"
                        aria-label="Add image"
                        disabled={busy}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
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
                    if (file) onPickPhoto(i, file, mode);
                    e.target.value = "";
                  }}
                />
              </div>
            );
          })}
          <p className="px-1 pt-1 text-[11px] text-ink/55">
            Photos are stored locally on your device only. Pip images get auto background removal.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm text-coral">{error}</div>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-sm"
          onClick={cancelPreview}
        >
          <div
            className="mx-auto w-full max-w-[440px] animate-fade-in rounded-t-[28px] border-t border-ink/15 bg-cream p-5 pb-8 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
                  Preview
                </div>
                <div className="font-display text-xl font-black leading-tight">
                  {preview.mode === "pip" ? "Background removed" : "Photo side"}
                </div>
                <div className="mt-0.5 text-xs text-ink/60">
                  How it'll look on the die. Confirm to add it.
                </div>
              </div>
              <button
                onClick={cancelPreview}
                className="grid h-9 w-9 place-items-center rounded-full bg-ink/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-ink/12 bg-card p-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/55">
                  Original
                </div>
                <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-cream">
                  <img
                    src={preview.originalUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-ink/12 bg-card p-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/55">
                  On the die
                </div>
                <div className="grid aspect-square place-items-center">
                  <CustomDieFace
                    text={pack.sides[preview.idx]?.text ?? ""}
                    emoji={pack.sides[preview.idx]?.emoji}
                    photo={preview.data}
                    mode={preview.mode}
                    pipCount={preview.mode === "pip" ? preview.idx + 1 : undefined}
                    size={132}
                    bg={pack.color}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={retryPreview}
                disabled={reprocessing}
                className="flex-1 rounded-full border border-ink/20 bg-card py-3 text-sm font-semibold disabled:opacity-60"
              >
                {reprocessing ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                  </span>
                ) : (
                  "Re-process"
                )}
              </button>
              <button
                onClick={cancelPreview}
                className="flex-1 rounded-full border border-ink/20 bg-card py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmPreview}
                className="flex-[1.4] rounded-full bg-ink py-3 text-sm font-semibold text-cream"
              >
                Use photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
