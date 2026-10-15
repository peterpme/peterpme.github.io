# peterp.me

Static Astro site. Cloudflare Pages publishes `dist` with no adapter and no server.

## Build

```bash
npm install
npm run build
```

| Setting | Value |
| --- | --- |
| Root directory | `/` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22 (`.nvmrc`) |

`npm run build` prepares images, OG cards, and `public/_redirects`, then runs `astro build`. The output is a directory of HTML and assets. `output` is `static`. There is no Cloudflare adapter and no SSR.

`npm install` uses sharp's prebuilt `@img/sharp-*` binary when that package is present (on a Mac, `@img/sharp-darwin-arm64`). sharp's own install script otherwise compiles from source when it finds a Homebrew libvips, or when `build-from-source` is set, and that compile fails the install. `.npmrc` loads `peterpme-sharp-prebuild` so the compile is skipped.

## Cloudflare Pages

1. Create a Pages project from this GitHub repo.
2. Set the production branch after this draft merges. Root directory `/`.
3. Build command: `npm run build`.
4. Build output directory: `dist`.
5. Add custom domains `www.peterp.me` and `peterp.me`.
6. The generated `dist/_redirects` sends `https://peterp.me/*` to `https://www.peterp.me/:splat` and old `/<slug>` URLs to `/articles/<slug>/`.

Pages free plan is enough. The site does not use Workers, KV, or a server runtime.

## URLs

Pages use trailing slashes (`trailingSlash: "always"`, directory format). Every path in the live `https://www.peterp.me/sitemap-index.xml` is checked against `dist` at the end of the build. Internal links are checked the same way.
