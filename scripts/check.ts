import fs from "node:fs";
import path from "node:path";

const DIST = path.join(process.cwd(), "dist");
const SITEMAP = "https://www.peterp.me/sitemap-index.xml";

function walk(dir: string, files: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function fileFor(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname.split("?")[0].split("#")[0]);
  const rel = decoded.replace(/^\/+/, "");
  if (!rel) return fs.existsSync(path.join(DIST, "index.html")) ? path.join(DIST, "index.html") : null;
  const direct = path.join(DIST, rel);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(DIST, rel.replace(/\/$/, ""), "index.html");
  if (fs.existsSync(index)) return index;
  const html = path.join(DIST, `${rel.replace(/\/$/, "")}.html`);
  if (fs.existsSync(html)) return html;
  return null;
}

async function sitemapPaths(): Promise<string[]> {
  const index = await fetch(SITEMAP);
  if (!index.ok) throw new Error(`Failed to fetch ${SITEMAP}: ${index.status}`);
  const indexXml = await index.text();
  const maps = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (maps.length === 0) throw new Error("Live sitemap index has no children");
  const paths: string[] = [];
  for (const map of maps) {
    const response = await fetch(map);
    if (!response.ok) throw new Error(`Failed to fetch ${map}: ${response.status}`);
    const xml = await response.text();
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = new URL(match[1]);
      const pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
      paths.push(pathname);
    }
  }
  return paths;
}

function htmlFiles(): string[] {
  const files: string[] = [];
  walk(DIST, files);
  return files.filter((file) => file.endsWith(".html"));
}

function extractUrls(html: string): string[] {
  const urls: string[] = [];
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) urls.push(match[1]);
  for (const match of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of match[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls;
}

function isInternal(url: string): string | null {
  if (!url || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("data:")) {
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.hostname !== "www.peterp.me" && parsed.hostname !== "peterp.me") return null;
    return `${parsed.pathname}${parsed.hash}`;
  }
  if (url.startsWith("//")) return null;
  return url;
}

function checkLinks(): string[] {
  const broken: string[] = [];
  for (const file of htmlFiles()) {
    const html = fs.readFileSync(file, "utf8");
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const raw of extractUrls(html)) {
      const internal = isInternal(raw);
      if (!internal) continue;
      const hashIndex = internal.indexOf("#");
      const pathname = hashIndex === -1 ? internal : internal.slice(0, hashIndex);
      const hash = hashIndex === -1 ? "" : internal.slice(hashIndex + 1);
      const target = pathname ? fileFor(pathname.startsWith("/") ? pathname : new URL(pathname, `https://www.peterp.me/${path.relative(DIST, file)}`).pathname) : file;
      if (!target) {
        broken.push(`${path.relative(DIST, file)} -> ${raw}`);
        continue;
      }
      if (!hash) continue;
      const targetHtml = target === file ? html : fs.readFileSync(target, "utf8");
      const targetIds = target === file ? ids : new Set([...targetHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      if (!targetIds.has(hash)) broken.push(`${path.relative(DIST, file)} -> ${raw} (missing #${hash})`);
    }
  }
  return broken;
}

async function main(): Promise<void> {
  if (!fs.existsSync(DIST)) throw new Error("dist/ is missing. Run astro build first.");
  const paths = await sitemapPaths();
  const missing = paths.filter((pathname) => !fileFor(pathname));
  if (missing.length > 0) {
    console.error("Live sitemap URLs missing from dist:");
    for (const pathname of missing) console.error(`  ${pathname}`);
    throw new Error(`${missing.length} sitemap URLs missing`);
  }
  console.log(`Sitemap parity ok (${paths.length} live URLs)`);

  const broken = checkLinks();
  if (broken.length > 0) {
    console.error("Broken internal links:");
    for (const line of broken) console.error(`  ${line}`);
    throw new Error(`${broken.length} broken internal links`);
  }
  console.log("Internal link check ok");

  const redirects = fs.readFileSync(path.join(DIST, "_redirects"), "utf8").trim().split("\n").filter((line) => line && !line.startsWith("#"));
  if (redirects.length >= 2000) throw new Error("Redirect file has 2000 or more rules");
  if (!redirects.some((line) => line.includes("https://peterp.me/"))) {
    throw new Error("Missing peterp.me host redirect");
  }
  console.log(`Redirects ok (${redirects.length} rules)`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
