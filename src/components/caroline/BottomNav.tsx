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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] border-t border-ink/10 bg-card/95 backdrop-blur">
      <div className="flex items-center justify-between px-2 pt-1 pb-[max(env(safe-area-inset-bottom),2px)]">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1 text-[10px] font-semibold transition-colors ${
                active ? "text-coral" : "text-ink/65"
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
