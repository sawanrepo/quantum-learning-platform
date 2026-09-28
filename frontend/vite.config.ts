// Vite config — powered by @lovable.dev/vite-tanstack-config which bundles:
// TanStack Start, viteReact, tailwindcss, tsConfigPaths, nitro, @ path alias,
// React/TanStack dedupe, error logger plugins, and sandbox detection.
// Additional config can be passed via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
