import fs from "node:fs";
import path from "node:path";

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
