import { Link, useRouterState } from "@tanstack/react-router";
import { Dices, Sparkles, PartyPopper, Settings } from "lucide-react";

const tabs = [
  { to: "/app/classic", label: "Classic", Icon: Dices },
  { to: "/app/party", label: "Party", Icon: PartyPopper },
  { to: "/app/custom", label: "Custom", Icon: Sparkles },
  { to: "/app/settings", label: "Settings", Icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 z-40 mx-auto w-full max-w-[420px] px-4"
      style={{ bottom: "max(env(safe-area-inset-bottom), 10px)" }}
    >
      <div className="flex items-center justify-between gap-1 rounded-full border border-ink/12 bg-card/95 px-2 py-1.5 shadow-pop backdrop-blur">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-colors ${
                active ? "bg-ink text-cream" : "text-ink/65"
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
