import { Link, useRouterState } from "@tanstack/react-router";
import { Dices, Sparkles, PartyPopper, Crown } from "lucide-react";

const tabs = [
  { to: "/app/classic", label: "Classic", Icon: Dices },
  { to: "/app/party", label: "Party", Icon: PartyPopper },
  { to: "/app/custom", label: "Custom", Icon: Sparkles },
  { to: "/app/pro", label: "Pro", Icon: Crown },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="flex items-center justify-between rounded-full border border-ink/10 bg-card/90 px-2 py-2 shadow-pop backdrop-blur">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors ${
                active ? "bg-ink text-cream" : "text-ink/70"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
