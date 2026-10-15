# peterp.me

Static Astro site. GitHub Actions deploys `dist` to the Cloudflare Worker `peterpme` on every push to `master`. There is no adapter and no server.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
```

`pnpm dev` prepares images, OG cards, and `public/_redirects`, then starts Astro. `pnpm build` does the same, builds the static site, and checks the live sitemap, internal links, and redirects.

| Setting | Value |
| --- | --- |
| Workflow | `.github/workflows/deploy.yml` |
| Push to `master` | `wrangler deploy` |
| Pull requests | `wrangler versions upload` |
| Output | `dist` |
| Node | 26 (`.nvmrc`), `engines.node` is `>=24` |
| Package manager | pnpm 11.25.0 (`packageManager`) |

The Worker is `peterpme`. `wrangler.jsonc` serves `./dist` as static assets with the custom 404 page. There is no Worker script.

`pnpm install` skips sharp's install script (`allowBuilds.sharp: false`) and uses the prebuilt `@img/sharp-*` binary.

## Deploy

The workflow needs two repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Disconnect Cloudflare dashboard Git builds (Workers Builds) for this Worker. Leaving them connected deploys the same push twice.

## URLs

Pages use trailing slashes (`trailingSlash: "always"`, directory format). Path redirects in `dist/_redirects` send old `/<slug>` URLs to `/articles/<slug>/`. Workers static assets apply that `_redirects` file. Domain-level lines such as `https://peterp.me/*` are not applied by Workers; the apex host redirect belongs in a Cloudflare redirect rule.
