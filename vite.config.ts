// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Set CAP_BUILD=1 to produce a static SPA bundle for the Capacitor iOS/Android
// wrapper (emits a client-side index.html shell into dist/client). Normal
// Lovable dev/deploy builds leave this unset and keep SSR behaviour unchanged.
const isCapacitorBuild = process.env.CAP_BUILD === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Emit a static SPA shell so Capacitor's WebView has an offline index.html.
    // outputPath "/index" makes the shell land at dist/client/index.html.
    ...(isCapacitorBuild ? { spa: { enabled: true, prerender: { outputPath: "/index" } } } : {}),
  },
});
