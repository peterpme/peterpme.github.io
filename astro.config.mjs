import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.peterp.me",
  output: "static",
  trailingSlash: "always",
  publicDir: "public",
  integrations: [react()],
  build: {
    format: "directory",
  },
});
