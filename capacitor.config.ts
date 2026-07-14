import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.caroline.dice",
  appName: "Caroline",
  // After you run `bun run build`, Capacitor wraps the contents of this folder.
  // TanStack Start emits its client bundle into `dist/client` (adjust if your
  // build output differs — check `dist/` after running `bun run build`).
  webDir: "dist/client",
  // App base color (#FFF8E8). Without this Capacitor uses the white system
  // background, which shows as a white bar in the safe-area / overscroll region.
  backgroundColor: "#FFF8E8",
  ios: {
    // Edge-to-edge web view (no safe-area inset strip that would show as a bar
    // at the top). Content clears the status bar via CSS padding.
    contentInset: "never",
    backgroundColor: "#FFF8E8",
  },
  plugins: {
    // Hold the (cream) splash until the web app has rendered, then the app
    // calls SplashScreen.hide() — this removes the blank/white flash on launch.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FFF8E8",
      showSpinner: false,
    },
  },
  // For quick on-device testing without a static build, uncomment and point
  // at your deployed Lovable URL. Apple discourages shipping with this set.
  // server: {
  //   url: "https://YOUR-PROJECT.lovable.app",
  //   cleartext: false,
  // },
};

export default config;
