import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Play, Check } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { SOUND_OPTIONS, playSoundById } from "@/lib/dice-sound";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Caroline" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { soundId, setSoundId } = useCarolineStore();

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/app/classic" })}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Settings
        </span>
        <span className="h-10 w-10" />
      </div>

      <h1 className="mt-5 font-display text-4xl font-black leading-[0.95]">
        Settings
      </h1>

      <section className="mt-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Dice sound
        </div>
        <p className="mt-1 text-sm text-ink/70">
          Pick the clatter you want to hear on every roll.
        </p>

        <div className="mt-4 space-y-3">
          {SOUND_OPTIONS.map((opt) => {
            const active = opt.id === soundId;
            return (
              <div
                key={opt.id}
                className={`rounded-3xl border p-4 shadow-pop transition ${
                  active ? "border-ink bg-ink text-cream" : "border-ink/12 bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setSoundId(opt.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full font-display text-sm font-black ${
                          active ? "bg-coral text-white" : "bg-cream text-ink/70"
                        }`}
                      >
                        {opt.id.toUpperCase()}
                      </span>
                      <span className="font-display text-base font-black leading-tight">
                        {opt.label}
                      </span>
                      {active && <Check className="ml-auto h-4 w-4" />}
                    </div>
                    <div className={`mt-1 text-xs ${active ? "opacity-80" : "text-ink/65"}`}>
                      {opt.description}
                    </div>
                  </button>
                  <button
                    onClick={() => playSoundById(opt.id)}
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      active ? "bg-coral text-white" : "bg-ink text-cream"
                    }`}
                    aria-label="Preview"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
