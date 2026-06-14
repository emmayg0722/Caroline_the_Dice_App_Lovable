import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.caroline.dice",
  appName: "Caroline",
  // After you run `bun run build`, Capacitor wraps the contents of this folder.
  // TanStack Start emits its client bundle into `dist/client` (adjust if your
  // build output differs — check `dist/` after running `bun run build`).
  webDir: "dist/client",
  ios: {
    contentInset: "always",
  },
  // For quick on-device testing without a static build, uncomment and point
  // at your deployed Lovable URL. Apple discourages shipping with this set.
  // server: {
  //   url: "https://YOUR-PROJECT.lovable.app",
  //   cleartext: false,
  // },
};

export default config;
