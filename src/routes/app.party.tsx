import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, Hash, QrCode, Clock } from "lucide-react";

export const Route = createFileRoute("/app/party")({
  head: () => ({ meta: [{ title: "Party Pack — Caroline" }] }),
  component: PartyTab,
});

function PartyTab() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");

  function join(c: string) {
    if (!c) return;
    navigate({ to: "/party/$code", params: { code: c.toUpperCase() } });
  }

  return (
    <div className="px-5 pt-12">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        Party
      </div>
      <h1 className="mt-1 font-display text-5xl font-black leading-[0.95]">
        Party Pack
      </h1>
      <p className="mt-2 max-w-[20rem] text-sm text-ink/70">
        Join a shared dice pack and play for 10 hours.
      </p>

      <div className="mt-6 rounded-3xl border border-ink/15 bg-lavender p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-black leading-tight">
            Got a Party Link?
          </span>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            <Clock className="h-3 w-3" /> 10 hrs
          </span>
        </div>
        <p className="mt-1 text-sm text-ink/75">
          Open a shared custom dice pack and use it temporarily.
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-cream px-3">
            <Link2 className="h-4 w-4 text-ink/50" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste Party Link"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink/40"
            />
          </div>
          <button
            onClick={() => {
              const m = link.match(/party\/([A-Z0-9]+)/i);
              if (m) join(m[1]);
              else if (link.trim()) join(link.trim());
            }}
            className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream"
          >
            Open Party Link
          </button>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-ink/15" />
            <span className="text-[10px] uppercase tracking-widest text-ink/50">or</span>
            <div className="h-px flex-1 bg-ink/15" />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-cream px-3">
            <Hash className="h-4 w-4 text-ink/50" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Party Code"
              className="w-full bg-transparent py-3 font-display text-base font-bold tracking-[0.2em] outline-none placeholder:text-ink/40 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
            />
            <button
              onClick={() => join(code)}
              className="rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white"
            >
              Join
            </button>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 bg-card py-3 text-sm font-semibold text-ink/70">
            <QrCode className="h-4 w-4" /> Scan QR Code
            <span className="ml-1 rounded-full bg-ink/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink/60">
              soon
            </span>
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-ink/12 bg-card p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
          How it works
        </div>
        <ol className="mt-3 space-y-2 text-sm text-ink/75">
          <li><span className="mr-1.5 font-display font-bold text-coral">1.</span>A Pro friend creates a custom dice pack.</li>
          <li><span className="mr-1.5 font-display font-bold text-coral">2.</span>They share a Party Link with you.</li>
          <li><span className="mr-1.5 font-display font-bold text-coral">3.</span>You roll for free for 10 hours.</li>
        </ol>
        <Link
          to="/app/pro"
          className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream"
        >
          Want to host? Unlock Pro
        </Link>
      </div>
    </div>
  );
}
