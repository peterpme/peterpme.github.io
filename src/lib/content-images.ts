import path from "node:path";
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { resolveImage } from "./images.ts";

const STEPS = [480, 768, 1024, 1280, 1600, 1920, 2560];
const SIZES = "(min-width: 760px) 68ch, calc(100vw - 2.5rem)";

const loaders = {
  ...import.meta.glob<{ default: ImageMetadata }>("../../content/**/*.{png,jpg,jpeg,gif,webp,avif}"),
  ...import.meta.glob<{ default: ImageMetadata }>(
    "../../static/transcripts/**/*.{png,jpg,jpeg,gif,webp,avif}",
  ),
};

const sourceDir = path.join(process.cwd(), "src/lib");
const byAbsolute = new Map<string, () => Promise<{ default: ImageMetadata }>>();
for (const [key, loader] of Object.entries(loaders)) {
  byAbsolute.set(path.resolve(sourceDir, key), loader);
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function widthsFor(width: number): number[] {
  return [...new Set([...STEPS.filter((step) => step < width), width])].sort((a, b) => a - b);
}

type Prepared =
  | { kind: "gif"; src: string; width: number; height: number }
  | {
      kind: "picture";
      avif: string;
      webp: string;
      src: string;
      srcset: string;
      width: number;
      height: number;
    };

const prepared = new Map<string, Promise<Prepared>>();

async function loadMetadata(file: string): Promise<ImageMetadata> {
  const loader = byAbsolute.get(file);
  if (!loader) throw new Error(`No Astro image import for ${file}`);
  const mod = await loader();
  return mod.default;
}

function prepare(file: string): Promise<Prepared> {
  const existing = prepared.get(file);
  if (existing) return existing;
  const pending = optimize(file);
  prepared.set(file, pending);
  return pending;
}

async function optimize(file: string): Promise<Prepared> {
  const meta = await loadMetadata(file);
  if (meta.format === "gif") {
    return { kind: "gif", src: meta.src, width: meta.width, height: meta.height };
  }

  const widths = widthsFor(meta.width);
  const [avif, webp, jpg] = await Promise.all([
    getImage({ src: meta, format: "avif", width: meta.width, widths, quality: 62, sizes: SIZES }),
    getImage({ src: meta, format: "webp", width: meta.width, widths, quality: 78, sizes: SIZES }),
    getImage({ src: meta, format: "jpg", width: meta.width, widths, quality: 84, sizes: SIZES }),
  ]);
  const width = Number(jpg.attributes.width);
  const height = Number(jpg.attributes.height);
  if (!width || !height) throw new Error(`Missing dimensions for ${file}`);
  return {
    kind: "picture",
    avif: avif.srcSet.attribute,
    webp: webp.srcSet.attribute,
    src: jpg.src,
    srcset: jpg.srcSet.attribute,
    width,
    height,
  };
}

function htmlFor(asset: Prepared, alt: string): string {
  const safeAlt = escapeAttr(alt);
  switch (asset.kind) {
    case "gif":
      return `<img src="${asset.src}" alt="${safeAlt}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async">`;
    case "picture":
      return `<picture><source type="image/avif" srcset="${asset.avif}" sizes="${SIZES}"><source type="image/webp" srcset="${asset.webp}" sizes="${SIZES}"><img src="${asset.src}" srcset="${asset.srcset}" sizes="${SIZES}" alt="${safeAlt}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async"></picture>`;
    default: {
      const exhaustive: never = asset;
      return exhaustive;
    }
  }
}

export async function renderLocalImage(src: string, alt: string, dir: string): Promise<string | null> {
  const resolved = resolveImage(src, dir);
  if (!resolved) return null;
  return htmlFor(await prepare(resolved), alt);
}
