import { createFileRoute, Link, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Share2, Check, Clock } from "lucide-react";
import { useCarolineStore } from "@/lib/caroline-store";
import { AllSidesButton } from "@/components/caroline/Dice";

export const Route = createFileRoute("/share/$code")({
  head: () => ({ meta: [{ title: "Party Link Ready — Caroline" }] }),
  component: SharePage,
});

function SharePage() {
  const { code } = useParams({ from: "/share/$code" });
  const navigate = useNavigate();
  const router = useRouter();
  const { parties, packs } = useCarolineStore();
  const party = useMemo(() => parties.find((p) => p.code === code), [parties, code]);
  const pack = useMemo(() => packs.find((p) => p.id === party?.packId), [packs, party]);
  const [copied, setCopied] = useState(false);

  function back() {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/app/custom" });
  }

  const [url, setUrl] = useState(`/party/${code}`);
  useEffect(() => {
    if (typeof window !== "undefined") setUrl(`${window.location.origin}/party/${code}`);
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Caroline — Party Pack",
          text: `Roll my pack "${pack?.name ?? "Party"}" with me — valid 10 hours.`,
          url,
        });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[440px] bg-cream px-5 pb-16 pt-5">
      <button
        onClick={back}
        className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-card"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Party Link
      </div>
      <h1 className="mt-1 font-display text-[44px] font-black leading-[0.95]">
        Your Party Link
        <br />
        <span className="italic text-coral">is ready</span>
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Share this link with friends. They can use this dice pack for 10 hours.
      </p>

      {pack && (
        <div
          className="mt-6 rounded-3xl border border-ink/12 p-4 shadow-pop"
          style={{ background: pack.color }}
        >
          <div className="flex items-center justify-between">
            <div className="font-display text-xl font-black">{pack.name}</div>
            <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              <Clock className="h-3 w-3" /> 10 hrs
            </span>
          </div>
          <AllSidesButton sides={pack.sides} packName={pack.name} packColor={pack.color} />
        </div>
      )}

      <div className="mt-5 rounded-3xl border border-ink/12 bg-card p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Code
        </div>
        <div className="mt-1 font-display text-4xl font-black tracking-[0.25em]">{code}</div>
        <div className="mt-2 truncate rounded-xl bg-cream px-3 py-2 text-xs text-ink/70">
          {url}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={copy}
          className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-cream"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </button>
        <button
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-white"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <Link
        to="/app/custom"
        className="mt-6 block text-center text-sm font-semibold text-ink/60 underline-offset-2 hover:underline"
      >
        Done
      </Link>
    </div>
  );
}
