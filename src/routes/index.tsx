import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PhoneShell, DieFace, CustomDieFace } from "@/components/caroline/Dice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caroline — The Dice" },
      { name: "description", content: "Create custom dice packs. Share them with friends. Let the party roll." },
      { property: "og:title", content: "Caroline — The Dice" },
      { property: "og:description", content: "Create custom dice packs. Share them with friends. Let the party roll." },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <PhoneShell>
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-14">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-ink/15 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/70">
            by emmayg
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink/50">
            issue n°01
          </span>
        </div>

        <header className="mt-8">
          <h1 className="font-display text-[68px] font-black leading-[0.88] tracking-tight">
            Caroline
            <br />
            <span className="italic text-coral">The Dice</span>
          </h1>
          <p className="mt-3 max-w-[18rem] text-[15px] leading-snug text-ink/70">
            A stylish party tool. Roll classic dice or build your own pack —
            then let the party roll.
          </p>
        </header>

        <div className="mt-8 grid gap-3">
          <ModeCard
            n="01"
            title="Classic Dice"
            sub="Roll standard dice from 1 to 6."
            bg="var(--butter)"
            preview={<DieFace value={5} size={64} />}
          />
          <ModeCard
            n="02"
            title="Pip Dice"
            sub="Create your own pip-style dice."
            bg="var(--powder)"
            preview={<DieFace value={3} size={64} bg="var(--cream)" />}
          />
          <ModeCard
            n="03"
            title="Side Dice"
            sub="Six sides: names, emojis, dares, friends."
            bg="var(--pink)"
            preview={<CustomDieFace text="Emma" emoji="✨" size={64} bg="var(--cream)" />}
          />
        </div>

        <div className="mt-auto pt-8">
          <Link
            to="/app/classic"
            className="flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-cream shadow-pop"
          >
            <span className="font-display text-lg font-bold">Start Rolling</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-center text-[11px] uppercase tracking-[0.25em] text-ink/50">
            No accounts · No ads · Just dice
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}

function ModeCard({
  n,
  title,
  sub,
  bg,
  preview,
}: {
  n: string;
  title: string;
  sub: string;
  bg: string;
  preview: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-3xl border border-ink/12 p-4 shadow-pop"
      style={{ background: bg }}
    >
      <div className="grid h-16 w-16 place-items-center">{preview}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
          {n} · Mode
        </div>
        <div className="font-display text-xl font-black leading-tight">{title}</div>
        <div className="mt-0.5 text-[12px] leading-snug text-ink/70">{sub}</div>
      </div>
    </div>
  );
}
