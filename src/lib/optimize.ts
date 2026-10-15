import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { ImageAsset } from "./images.ts";

const STEPS = [480, 768, 1024, 1280, 1600, 1920, 2560];

function hashFile(file: string): string {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha1").update(data).digest("hex").slice(0, 10);
}

export async function optimizeFile(file: string, outDir: string): Promise<ImageAsset> {
  fs.mkdirSync(outDir, { recursive: true });
  const ext = path.extname(file).toLowerCase();
  const stem = path.basename(file, ext).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  const hash = hashFile(file);

  if (ext === ".gif") {
    const name = `${stem}.${hash}.gif`;
    fs.copyFileSync(file, path.join(outDir, name));
    const meta = await sharp(file, { animated: false }).metadata();
    return {
      kind: "gif",
      src: `/_img/${name}`,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  const meta = await sharp(file).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error(`Could not read dimensions of ${file}`);

  const widths = [...new Set([...STEPS.filter((step) => step < width), width])].sort((a, b) => a - b);
  const avif: string[] = [];
  const webp: string[] = [];
  const jpg: string[] = [];

  for (const target of widths) {
    const base = sharp(file).rotate().resize({ width: target, withoutEnlargement: true });
    const avifName = `${stem}.${hash}.${target}.avif`;
    const webpName = `${stem}.${hash}.${target}.webp`;
    const jpgName = `${stem}.${hash}.${target}.jpg`;
    await base.clone().avif({ quality: 62 }).toFile(path.join(outDir, avifName));
    await base.clone().webp({ quality: 78 }).toFile(path.join(outDir, webpName));
    await base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, jpgName));
    avif.push(`/_img/${avifName} ${target}w`);
    webp.push(`/_img/${webpName} ${target}w`);
    jpg.push(`/_img/${jpgName} ${target}w`);
  }

  const fallback = `/_img/${stem}.${hash}.${width}.jpg`;
  return {
    kind: "picture",
    width,
    height,
    avif: avif.join(", "),
    webp: webp.join(", "),
    jpg: jpg.join(", "),
    fallback,
  };
}
