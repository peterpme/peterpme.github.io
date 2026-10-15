# peterp.me

Static Astro site. Cloudflare Workers Builds deploys `dist` to the Worker `peterpme` on every push to `master`. There is no adapter and no server.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
```

`pnpm dev` prepares OG cards and `public/_redirects`, then starts Astro. `pnpm build` does the same, then builds the static site. Astro's sharp service optimizes content images into `node_modules/.astro`, and OG cards are copied from `node_modules/.astro/og-cache` when their inputs have not changed. Cloudflare's build cache should keep that directory.

| Setting | Value |
| --- | --- |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production command | `npx wrangler versions upload` |
| Output | `dist` |
| Node | `24.18.0` (`.nvmrc`). `engines.node` is `>=24`, so Node 26 locally does not warn. |
| Package manager | pnpm 11.25.0 (`packageManager`) |

The Worker is `peterpme`. `wrangler.jsonc` serves `./dist` as static assets with the custom 404 page. There is no Worker script.

`pnpm install` skips sharp's install script (`allowBuilds.sharp: false`) and uses the prebuilt `@img/sharp-*` binary.

The Workers Builds image preinstalls Node.js 22.23.2 and 24.18.0. `.nvmrc` selects 24.18.0. If a build log still shows pnpm 10, set the build variable `PNPM_VERSION=11.25.0`.

## URLs

Pages use trailing slashes (`trailingSlash: "always"`, directory format). Path redirects in `dist/_redirects` send old `/<slug>` URLs to `/articles/<slug>/`. Workers static assets apply that `_redirects` file. The apex host redirect belongs in a Cloudflare redirect rule, because Workers does not apply domain-level redirects.
