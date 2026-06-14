import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Caroline" },
      {
        name: "description",
        content:
          "How Caroline handles your data. Short answer: everything stays on your device.",
      },
      { property: "og:title", content: "Privacy Policy — Caroline" },
      {
        property: "og:description",
        content:
          "How Caroline handles your data. Short answer: everything stays on your device.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream px-5 pb-24 pt-5 text-ink">
      <Link
        to="/app/settings"
        search={{ section: "about" }}
        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/70"
      >
        <ArrowLeft className="h-4 w-4" /> About
      </Link>
      <h1 className="font-display text-4xl font-black leading-[0.95]">
        Privacy Policy
      </h1>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/55">
        Last updated · June 14, 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none space-y-5 text-ink/85">
        <p>
          Caroline is a dice app for parties. It is designed to collect as
          little information about you as possible. This page explains what we
          do — and mostly don't — collect.
        </p>

        <h2 className="font-display text-xl font-black">What stays on your device</h2>
        <p>
          Your dice packs, custom packs, theme, sound, and dice-size preferences
          are stored locally on your device. They never leave it unless you
          choose to share a Party Link.
        </p>

        <h2 className="font-display text-xl font-black">Purchases</h2>
        <p>
          When you buy Caroline Pro, the purchase is processed by Apple. We
          receive a receipt from Apple confirming the purchase status via
          RevenueCat, our purchase-management provider. We do not see your
          payment details. RevenueCat assigns an anonymous app-user ID so we
          can restore your purchase across devices signed into the same Apple
          ID.
        </p>

        <h2 className="font-display text-xl font-black">Party Links</h2>
        <p>
          A Party Link encodes the pack you chose into the URL itself. Opening
          a Party Link does not create an account and does not send your name
          or device info to us.
        </p>

        <h2 className="font-display text-xl font-black">Analytics & tracking</h2>
        <p>
          Caroline does not include third-party analytics, advertising SDKs, or
          cross-app tracking. We do not build a profile of you.
        </p>

        <h2 className="font-display text-xl font-black">Children</h2>
        <p>
          Caroline is not directed at children under 13. Do not use the app if
          you are under the age required by your local law to consent to use
          mobile apps.
        </p>

        <h2 className="font-display text-xl font-black">Contact</h2>
        <p>
          Questions, requests, or feedback? Email{" "}
          <a
            className="underline"
            href="mailto:emmagao0722@gmail.com"
          >
            emmagao0722@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
