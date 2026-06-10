import { createFileRoute } from "@tanstack/react-router";
import { Play, Check, Gift, RefreshCw } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { SOUND_OPTIONS, playSoundById } from "@/lib/dice-sound";
import { DieFace } from "@/components/caroline/Dice";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Caroline" }] }),
  component: SettingsPage,
});

const PRO_FEATURES = [
  "Create unlimited custom dice packs",
  "Customize all six sides",
  "Names, emojis, foods, animals, dares, friends",
  "Share Party Links valid for 10 hours",
  "No 'Buy us a beer' popups",
];

function SettingsPage() {
  const { soundId, setSoundId, dieScale, setDieScale, pro, setPro } = useCarolineStore();
  const previewSize = Math.round(96 * (dieScale || 1));

  return (
    <div className="px-5 pt-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Settings
      </div>
      <h1 className="mt-1 font-display text-4xl font-black leading-[0.95]">
        Settings
      </h1>

      {/* Dice size */}
      <section className="mt-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Dice size
        </div>
        <p className="mt-1 text-sm text-ink/70">
          Scale your dice everywhere in the app.
        </p>

        <div className="mt-4 grid place-items-center rounded-3xl border border-ink/12 bg-card p-5 shadow-pop">
          <DieFace value={5} size={previewSize} bg="var(--butter)" />
          <div className="mt-3 font-display text-sm font-bold text-ink/70">
            {Math.round((dieScale || 1) * 100)}%
          </div>
        </div>

        <input
          type="range"
          min={70}
          max={180}
          step={5}
          value={Math.round((dieScale || 1) * 100)}
          onChange={(e) => setDieScale(Number(e.target.value) / 100)}
          className="mt-4 w-full accent-coral"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink/50">
          <span>Small</span>
          <span>Default</span>
          <span>XL</span>
        </div>
      </section>

      {/* Dice sound */}
      <section className="mt-8">
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
                  <button onClick={() => setSoundId(opt.id)} className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-7 min-w-7 place-items-center rounded-full px-2 font-display text-xs font-black uppercase ${
                          active ? "bg-coral text-white" : "bg-cream text-ink/70"
                        }`}
                      >
                        {opt.id}
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

      {/* Pro */}
      <section className="mt-10">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Membership
        </div>
        <h2 className="mt-1 font-display text-3xl font-black leading-[0.95]">
          Caroline <span className="italic text-coral">Pro</span>
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          One-time unlock. No subscription. Forever party-ready.
        </p>

        <div className="relative mt-4 overflow-hidden rounded-[28px] border border-ink/15 bg-butter p-5 shadow-pop">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-coral/80" />
          <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-pink" />
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              Lifetime Pass
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black">$4.99</span>
              <span className="text-xs text-ink/65">one time</span>
            </div>
            <ul className="mt-3 space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-cream">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => setPro(!pro)}
          className={`mt-4 w-full rounded-full py-4 font-display text-lg font-black shadow-pop transition ${
            pro ? "bg-sage text-ink" : "bg-coral text-white"
          }`}
        >
          {pro ? "Pro is active ✓" : "Unlock Pro · $4.99"}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-card py-3 text-xs font-semibold text-ink/80">
            <Gift className="h-3.5 w-3.5" /> Redeem Pro Code
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-card py-3 text-xs font-semibold text-ink/80">
            <RefreshCw className="h-3.5 w-3.5" /> Restore Purchase
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] text-ink/45">
        Caroline · The Dice · by emmayg
      </p>
    </div>
  );
}
