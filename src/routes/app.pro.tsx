import { createFileRoute } from "@tanstack/react-router";
import { Check, Gift, RefreshCw } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";

export const Route = createFileRoute("/app/pro")({
  head: () => ({ meta: [{ title: "Caroline Pro" }] }),
  component: ProTab,
});

const FEATURES = [
  "Create unlimited custom dice packs",
  "Customize all six sides",
  "Names, emojis, foods, animals, dares, friends",
  "Share Party Links valid for 10 hours",
  "No 'Buy us a beer' popups",
];

function ProTab() {
  const { pro, setPro } = useCarolineStore();

  return (
    <div className="px-5 pt-12">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Membership
      </div>
      <h1 className="mt-1 font-display text-[56px] font-black leading-[0.9]">
        Caroline
        <br />
        <span className="italic text-coral">Pro</span>
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        One-time unlock. No subscription. Forever party-ready.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-ink/15 bg-butter p-5 shadow-pop">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-coral/80" />
        <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-pink" />
        <div className="relative">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/70">
            Lifetime Pass
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl font-black">$4.99</span>
            <span className="text-xs text-ink/65">one time</span>
          </div>
          <ul className="mt-4 space-y-2">
            {FEATURES.map((f) => (
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
        className={`mt-5 w-full rounded-full py-4 font-display text-lg font-black shadow-pop transition ${
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

      <div className="mt-5 rounded-2xl bg-card p-4 text-[11px] leading-snug text-ink/65">
        Have a Pro offer code? Redeem it through Apple's secure system. Pro Codes
        are different from Party Links — Party Links give friends temporary access
        to one of your dice packs.
      </div>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.25em] text-ink/45">
        Caroline · The Dice · by emmayg
      </p>
    </div>
  );
}
