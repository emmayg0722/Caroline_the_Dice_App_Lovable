import { Link } from "@tanstack/react-router";
import { useCarolineStore } from "@/lib/caroline-store";

export function BeerPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-[400px] rounded-3xl border border-ink/15 bg-cream p-6 shadow-pop">
        <div className="text-5xl">🍺</div>
        <h3 className="mt-3 font-display text-2xl font-black leading-tight">Love the party?</h3>
        <p className="mt-2 text-sm text-ink/70">
          Hope you had some nice rounds. Buy us a beer if Caroline made the game more fun.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href="https://buymeacoffee.com/emmayg"
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="rounded-full bg-coral px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Buy us a beer 🍺
          </a>
          <Link
            to="/app/pro"
            onClick={onClose}
            className="rounded-full border border-ink/15 bg-card px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Unlock Pro
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2 text-center text-xs font-medium text-ink/60"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export function useBeerTrigger() {
  const { rolls, pro } = useCarolineStore();
  const show =
    !pro &&
    (rolls === 20 || rolls === 60 || (rolls > 60 && (rolls - 60) % 100 === 0));
  return show;
}
