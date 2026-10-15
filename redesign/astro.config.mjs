import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://www.peterp.me",
  output: "static",
  trailingSlash: "always",
  vite: {
    server: {
      fs: {
        allow: [path.resolve(root, "..")],
      },
    },
  },
});
