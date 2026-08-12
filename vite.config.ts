import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Production is undercover.oudard.org (site root → base `/`).
// Absolute asset URLs cannot simultaneously work on both `/` and
// `/undercover-mpj/`; CI forces BASE_PATH="" for the custom domain.
const rawBase = process.env.BASE_PATH?.trim() ?? "";
const base =
  !rawBase || rawBase === "/"
    ? "/"
    : `${rawBase.replace(/\/$/, "")}/`;

export default defineConfig({
  vite: {
    base,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Node server used only at build time to SSR static HTML for GitHub Pages.
  // The Pages workflow deploys `.output/public` only.
  nitro: {
    preset: "node-server",
  },
});
