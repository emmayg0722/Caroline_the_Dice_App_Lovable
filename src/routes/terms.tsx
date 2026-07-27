import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Caroline" },
      {
        name: "description",
        content: "The simple rules for using Caroline — the dice app for parties.",
      },
      { property: "og:title", content: "Terms of Use — Caroline" },
      {
        property: "og:description",
        content: "The simple rules for using Caroline — the dice app for parties.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-cream px-5 pb-24 pt-5 text-ink">
      <Link
        to="/app/settings"
        search={{ section: "about" }}
        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/70"
      >
        <ArrowLeft className="h-4 w-4" /> About
      </Link>
      <h1 className="font-display text-4xl font-black leading-[0.95]">Terms of Use</h1>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/55">
        Last updated · June 14, 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none space-y-5 text-ink/85">
        <p>
          By using Caroline, you agree to these terms. They are written in plain English on purpose.
        </p>

        <h2 className="font-display text-xl font-black">The app</h2>
        <p>
          Caroline is provided as-is, for personal, non-commercial entertainment. You are
          responsible for how you use it — including any dares, questions, or party games you choose
          to play. Please be safe, be kind, and respect everyone at the table.
        </p>

        <h2 className="font-display text-xl font-black">Caroline Pro</h2>
        <p>
          Caroline Pro is a one-time, non-consumable in-app purchase. Once unlocked on your Apple
          ID, you can restore it on any device signed into the same Apple ID via Settings → Premium
          → Restore Purchase. Refunds are handled by Apple under their standard policies.
        </p>

        <h2 className="font-display text-xl font-black">Your content</h2>
        <p>
          Anything you type into a custom dice pack stays on your device unless you share a Party
          Link. You are responsible for the content you create and share.
        </p>

        <h2 className="font-display text-xl font-black">Acceptable use</h2>
        <p>
          Don't use Caroline to harass anyone or to encourage illegal activity. Don't try to
          reverse-engineer the app or interfere with its operation.
        </p>

        <h2 className="font-display text-xl font-black">No warranty</h2>
        <p>
          Caroline is provided without warranty of any kind. To the maximum extent allowed by law,
          the developer is not liable for any damages arising from your use of the app.
        </p>

        <h2 className="font-display text-xl font-black">Changes</h2>
        <p>
          These terms may be updated as the app evolves. Continued use after an update means you
          accept the new terms.
        </p>

        <h2 className="font-display text-xl font-black">Contact</h2>
        <p>
          Questions? Email{" "}
          <a className="underline" href="mailto:emmagao0722@gmail.com">
            emmagao0722@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
