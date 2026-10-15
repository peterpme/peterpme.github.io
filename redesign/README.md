# Redesign prototype

Static Astro 5 mock of peterp.me. The Gatsby site at the repo root is separate.

```bash
cd redesign
npm install
npm run build
```

The build writes a fully static site to `redesign/dist`. Cloudflare Pages can publish that folder as-is. There is no adapter and no server rendering.
