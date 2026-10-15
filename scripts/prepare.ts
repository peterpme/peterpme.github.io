import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { getDocs, formatFull, ogLeaf } from "../src/lib/content.ts";
import { collectImageSrcs } from "../src/lib/markdown.ts";
import { resolveImage, imageMapPath, type ImageMap } from "../src/lib/images.ts";
import { optimizeFile } from "../src/lib/optimize.ts";
import { SITE_URL } from "../src/lib/site.ts";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const REDIRECT_LIMIT = 2000;

function resetPublic(): void {
  fs.rmSync(PUBLIC, { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, "static"), PUBLIC, { recursive: true });
}

function writeManifest(): void {
  const manifest = {
    name: "Peter Piekarczyk",
    short_name: "peterp.me",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  fs.writeFileSync(path.join(PUBLIC, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(
    path.join(PUBLIC, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`,
  );
}

function writeRedirects(): void {
  const reserved = new Set([
    "about",
    "talks",
    "ideas",
    "transcripts",
    "articles",
    "christmas-lights",
    "legend-list-simulator",
    "rss.xml",
    "robots.txt",
    "sitemap-index.xml",
    "sitemap-0.xml",
    "og.png",
    "favicon.ico",
    "site.webmanifest",
  ]);
  const lines = [
    "# Cloudflare Pages redirects. Apex host goes to www. Old post URLs go to /articles/.",
    "https://peterp.me/* https://www.peterp.me/:splat 301",
    "https://peterp.me/ https://www.peterp.me/ 301",
  ];
  for (const doc of getDocs()) {
    if (doc.kind !== "article") continue;
    const leaf = doc.slug.split("/")[0];
    if (reserved.has(leaf) && !doc.slug.includes("/")) continue;
    lines.push(`/${doc.slug} ${doc.href} 301`);
    lines.push(`/${doc.slug}/ ${doc.href} 301`);
  }
  if (lines.length > REDIRECT_LIMIT) {
    throw new Error(`${lines.length} redirect rules exceeds the ${REDIRECT_LIMIT} Cloudflare Pages limit`);
  }
  const file = path.join(PUBLIC, "_redirects");
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
  console.log(`Wrote ${lines.length} redirect rules to public/_redirects`);
}

async function writeImages(): Promise<void> {
  const outDir = path.join(PUBLIC, "_img");
  const map: ImageMap = {};
  const files = new Set<string>();
  for (const doc of getDocs()) {
    for (const src of collectImageSrcs(doc.body)) {
      const resolved = resolveImage(src, doc.dir);
      if (resolved) files.add(resolved);
    }
  }
  let count = 0;
  for (const file of files) {
    map[file] = await optimizeFile(file, outDir);
    count += 1;
  }
  const dest = imageMapPath();
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(map)}\n`);
  console.log(`Optimized ${count} content images`);
}

function writeOgPosts(): void {
  const posts = getDocs().map((doc) => ({
    href: doc.href,
    leaf: ogLeaf(doc.slug),
    title: doc.title,
    date: formatFull(doc.date),
  }));
  const dest = path.join(ROOT, "src/generated/og-posts.json");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(posts)}\n`);
}

function generateOg(): void {
  const result = spawnSync("node", ["scripts/generate-og-images.cjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error("OG image generation failed");
}

async function writeChristmasCss(): Promise<void> {
  const result = await postcss([
    tailwindcss({
      content: ["./src/components/ChristmasLights.tsx"],
      corePlugins: { preflight: false },
    }),
    autoprefixer(),
  ]).process("@tailwind utilities;\n", { from: undefined });
  fs.writeFileSync(path.join(ROOT, "src/styles/christmas.generated.css"), result.css);
  console.log("Wrote Christmas lights utilities");
}

async function main(): Promise<void> {
  resetPublic();
  writeManifest();
  writeRedirects();
  await writeChristmasCss();
  await writeImages();
  writeOgPosts();
  generateOg();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
