import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft, ChevronRight, Play, Check, Sliders, Volume2, VolumeX,
  Palette, Crown, Info, Gift, RefreshCw, Smartphone,
} from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { SOUND_OPTIONS, playSoundById } from "@/lib/dice-sound";
import { DieFace } from "@/components/caroline/Dice";

type Section = "menu" | "size" | "sound" | "theme" | "premium" | "about";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Caroline" }] }),
  validateSearch: (s: Record<string, unknown>): { section?: Section } => {
    const v = s.section;
    if (v === "size" || v === "sound" || v === "theme" || v === "premium" || v === "about") {
      return { section: v };
    }
    return {};
  },
  component: SettingsPage,
});

function SettingsPage() {
  const search = Route.useSearch();
  const [section, setSection] = useState<Section>(search.section ?? "menu");

  if (section === "menu") return <Menu onOpen={setSection} />;

  return (
    <div className="px-5 pt-5">
      <button
        onClick={() => setSection("menu")}
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink/70"
      >
        <ArrowLeft className="h-4 w-4" /> Settings
      </button>
      {section === "size" && <DiceSizeSection />}
      {section === "sound" && <SoundSection />}
      {section === "theme" && <ThemeSection />}
      {section === "premium" && <PremiumSection />}
      {section === "about" && <AboutSection />}
    </div>
  );
}

function Menu({ onOpen }: { onOpen: (s: Section) => void }) {
  const { shakeEnabled, setShakeEnabled } = useCarolineStore();
  const items: { id: Section; label: string; desc: string; Icon: typeof Sliders }[] = [
    { id: "size", label: "Dice size", desc: "Make dice bigger or smaller", Icon: Sliders },
    { id: "sound", label: "Sound", desc: "Choose your dice clatter", Icon: Volume2 },
    { id: "theme", label: "Theme", desc: "Minimal, Dark, Pastel, Meme & more", Icon: Palette },
    { id: "premium", label: "Premium", desc: "Unlock Caroline Pro", Icon: Crown },
    { id: "about", label: "About", desc: "Terms, Privacy, Support", Icon: Info },
  ];
  return (
    <div className="px-5 pt-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Settings
      </div>
      <h1 className="mt-1 font-display text-4xl font-black leading-[0.95]">Settings</h1>
      <div className="mt-6 space-y-2">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-ink/12 bg-card p-4 text-left shadow-pop">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-ink">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-base font-black">Shake to roll</span>
            <span className="block text-xs text-ink/60">
              Give your phone a shake to roll the dice.
            </span>
          </span>
          <button
            role="switch"
            aria-checked={shakeEnabled}
            onClick={() => setShakeEnabled(!shakeEnabled)}
            className={`relative h-7 w-12 rounded-full transition ${
              shakeEnabled ? "bg-coral" : "bg-ink/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                shakeEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        {items.map(({ id, label, desc, Icon }) => (
          <button
            key={id}
            onClick={() => onOpen(id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-ink/12 bg-card p-4 text-left shadow-pop"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-ink">
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-base font-black">{label}</span>
              <span className="block text-xs text-ink/60">{desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink/40" />
          </button>
        ))}
      </div>
      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] text-ink/45">
        Caroline · The Dice · by emmayg
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1 className="font-display text-3xl font-black leading-[0.95]">{title}</h1>
      <div className="mt-5">{children}</div>
    </>
  );
}

function DiceSizeSection() {
  const { dieScale, setDieScale } = useCarolineStore();
  const previewSize = Math.round(96 * (dieScale || 1));
  return (
    <Section title="Dice size">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="grid place-items-center rounded-3xl border border-ink/12 bg-card p-6 shadow-pop">
          <DieFace value={5} size={previewSize} bg="var(--butter)" />
          <div className="mt-3 font-display text-sm font-bold text-ink/70">
            {Math.round((dieScale || 1) * 100)}%
          </div>
        </div>
        <input
          type="range" min={70} max={180} step={5}
          value={Math.round((dieScale || 1) * 100)}
          onChange={(e) => setDieScale(Number(e.target.value) / 100)}
          className="mt-6 w-full accent-coral"
        />
        <div className="mt-1 flex w-full justify-between text-[10px] uppercase tracking-wider text-ink/50">
          <span>Small</span><span>Default</span><span>XL</span>
        </div>
      </div>
    </Section>
  );
}

function SoundSection() {
  const { soundId, setSoundId } = useCarolineStore();
  return (
    <Section title="Dice sound">
      <div className="space-y-3">
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
                    <span className="font-display text-base font-black">{opt.label}</span>
                    {active && <Check className="ml-1 h-4 w-4" />}
                  </div>
                  <div className={`mt-1 text-xs ${active ? "opacity-80" : "text-ink/65"}`}>
                    {opt.description}
                  </div>
                </button>
                {opt.id === "off" ? (
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      active ? "bg-coral text-white" : "bg-ink/10 text-ink/60"
                    }`}
                    aria-hidden
                  >
                    <VolumeX className="h-4 w-4" />
                  </div>
                ) : (
                  <button
                    onClick={() => playSoundById(opt.id)}
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      active ? "bg-coral text-white" : "bg-ink text-cream"
                    }`}
                    aria-label="Preview"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ThemeSection() {
  const { theme, setTheme } = useCarolineStore();
  type ThemeId = "default" | "minimal" | "dark" | "pastel" | "meme";
  const options: {
    id: ThemeId;
    label: string;
    desc: string;
    bg: string;
    fg: string;
    accent: string;
  }[] = [
    {
      id: "default",
      label: "Caroline",
      desc: "Warm cream & ink — the original look.",
      bg: "linear-gradient(135deg, #fdf6e3 0%, #fce4ec 100%)",
      fg: "#222",
      accent: "#e85d75",
    },
    {
      id: "minimal",
      label: "Minimal Float",
      desc: "Clean lavender mist, indigo accent.",
      bg: "linear-gradient(160deg, #f8f9ff 0%, #eef0ff 100%)",
      fg: "#333",
      accent: "#6C63FF",
    },
    {
      id: "dark",
      label: "Dark Drama",
      desc: "Deep navy with a red-pink glow.",
      bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      fg: "#fff",
      accent: "#e94560",
    },
    {
      id: "pastel",
      label: "Pastel Party",
      desc: "Soft pink, lilac & mint candy.",
      bg: "linear-gradient(135deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)",
      fg: "#333",
      accent: "#e91e8c",
    },
    {
      id: "meme",
      label: "Meme Stamp",
      desc: "Cream yellow, red Impact stamps.",
      bg: "#fffde7",
      fg: "#555",
      accent: "#f44336",
    },
  ];
  return (
    <Section title="Theme">
      <div className="space-y-3">
        {options.map((o) => {
          const active = theme === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setTheme(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left shadow-pop ${
                active ? "border-ink" : "border-ink/12"
              }`}
              style={{ background: o.bg, color: o.fg }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: o.accent, color: "#fff" }}
              >
                <Palette className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span
                  className="block font-display text-base font-black"
                  style={
                    o.id === "meme"
                      ? { fontFamily: "Impact, 'Arial Black', sans-serif", letterSpacing: 0 }
                      : undefined
                  }
                >
                  {o.label}
                </span>
                <span className="block text-xs opacity-80">{o.desc}</span>
              </span>
              {active && <Check className="h-5 w-5" />}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

const PRO_FEATURES = [
  "Create unlimited custom dice packs",
  "Customize all six sides",
  "Names, emojis, foods, animals, dares, friends",
  "Share Party Links valid for 10 hours",
  "No 'Buy us a beer' popups",
];

function PremiumSection() {
  const { pro, setPro } = useCarolineStore();
  return (
    <Section title="Premium">
      <p className="text-sm text-ink/70">
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
    </Section>
  );
}

function AboutSection() {
  const items = [
    { label: "Terms of Use", desc: "Coming soon" },
    { label: "Privacy Policy", desc: "Coming soon" },
    { label: "Support", desc: "Contact us at hello@caroline.app" },
  ];
  return (
    <Section title="About">
      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center justify-between rounded-2xl border border-ink/12 bg-card p-4 shadow-pop"
          >
            <span>
              <span className="block font-display text-base font-black">{it.label}</span>
              <span className="block text-xs text-ink/60">{it.desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink/40" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] text-ink/45">
        Caroline · The Dice · v1.0
      </p>
    </Section>
  );
}
