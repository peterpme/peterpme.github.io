import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.peterp.me",
  output: "static",
  // Astro 7 defaults to JSX whitespace collapsing. Keep the HTML-aware
  // compression this site was written for.
  compressHTML: true,
  trailingSlash: "always",
  publicDir: "public",
  integrations: [react()],
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  build: {
    format: "directory",
  },
});
