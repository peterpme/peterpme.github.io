import fs from "node:fs";
import path from "node:path";

export type PictureAsset = {
  kind: "picture";
  width: number;
  height: number;
  avif: string;
  webp: string;
  jpg: string;
  fallback: string;
};

export type GifAsset = {
  kind: "gif";
  width: number;
  height: number;
  src: string;
};

export type ImageAsset = PictureAsset | GifAsset;

export type ImageMap = Record<string, ImageAsset>;

const SIZES = "(min-width: 760px) 68ch, calc(100vw - 2.5rem)";

let mapCache: ImageMap | null = null;

export function imageMapPath(): string {
  return path.join(process.cwd(), "src/generated/images.json");
}

export function loadImageMap(): ImageMap {
  if (mapCache) return mapCache;
  const file = imageMapPath();
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}. Run npm run prepare:site first.`);
  }
  mapCache = JSON.parse(fs.readFileSync(file, "utf8")) as ImageMap;
  return mapCache;
}

export function resolveImage(src: string, dir: string): string | null {
  if (!src || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return null;
  }
  if (src.startsWith("/")) {
    const fromStatic = path.join(process.cwd(), "static", decodeURIComponent(src));
    if (fs.existsSync(fromStatic)) return fromStatic;
    const fromContent = path.join(process.cwd(), "content", decodeURIComponent(src));
    if (fs.existsSync(fromContent)) return fromContent;
    return null;
  }
  const local = path.resolve(dir, decodeURIComponent(src.split("?")[0]));
  return fs.existsSync(local) ? local : null;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderAsset(asset: ImageAsset, alt: string): string {
  const safeAlt = escapeAttr(alt);
  switch (asset.kind) {
    case "gif":
      return `<img src="${asset.src}" alt="${safeAlt}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async">`;
    case "picture":
      return `<picture><source type="image/avif" srcset="${asset.avif}" sizes="${SIZES}"><source type="image/webp" srcset="${asset.webp}" sizes="${SIZES}"><img src="${asset.fallback}" srcset="${asset.jpg}" sizes="${SIZES}" alt="${safeAlt}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async"></picture>`;
    default: {
      const exhaustive: never = asset;
      return exhaustive;
    }
  }
}

export function renderLocalImage(src: string, alt: string, dir: string): string | null {
  const resolved = resolveImage(src, dir);
  if (!resolved) return null;
  const asset = loadImageMap()[resolved];
  if (!asset) {
    throw new Error(`No optimized image for ${resolved}. Re-run npm run prepare:site.`);
  }
  return renderAsset(asset, alt);
}
