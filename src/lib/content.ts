import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ARCHIVE_BEFORE_YEAR, FEATURED_SLUG, SITE_URL } from "./site.ts";

export type ContentKind = "article" | "idea" | "transcript";

export type Doc = {
  kind: ContentKind;
  title: string;
  description: string;
  date: Date;
  year: number;
  slug: string;
  href: string;
  minutes: number;
  categories: string[];
  keywords: string[];
  body: string;
  file: string;
  dir: string;
};

const ROOT = process.cwd();

const ROOTS: Record<ContentKind, string> = {
  article: path.join(ROOT, "content/blog"),
  idea: path.join(ROOT, "content/ideas"),
  transcript: path.join(ROOT, "content/transcripts"),
};

function prefix(kind: ContentKind): string {
  switch (kind) {
    case "article":
      return "/articles";
    case "idea":
      return "/ideas";
    case "transcript":
      return "/transcripts";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function slugFor(file: string, root: string): string {
  let rel = path.relative(root, file).split(path.sep).join("/");
  rel = rel.replace(/\.mdx?$/i, "");
  if (rel.endsWith("/index")) rel = rel.slice(0, -"/index".length);
  if (rel === "index") return "";
  return rel;
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function readingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function walk(dir: string, files: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
}

function loadKind(kind: ContentKind): Doc[] {
  const root = ROOTS[kind];
  const files: string[] = [];
  walk(root, files);
  const docs: Doc[] = [];
  const seen = new Map<string, string>();

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const title = parsed.data.title;
    const date = asDate(parsed.data.date);
    if (typeof title !== "string" || !title.trim() || !date) {
      throw new Error(`Missing title or date in ${file}`);
    }
    const slug = slugFor(file, root);
    if (!slug) throw new Error(`Empty slug for ${file}`);
    const previous = seen.get(slug);
    if (previous) throw new Error(`Duplicate ${kind} slug "${slug}" in ${previous} and ${file}`);
    seen.set(slug, file);

    const description =
      typeof parsed.data.description === "string" ? parsed.data.description.trim() : "";

    docs.push({
      kind,
      title: title.trim(),
      description,
      date,
      year: date.getUTCFullYear(),
      slug,
      href: `${prefix(kind)}/${slug}/`,
      minutes: readingMinutes(parsed.content),
      categories: asList(parsed.data.categories ?? parsed.data.category),
      keywords: asList(parsed.data.keywords),
      body: parsed.content,
      file,
      dir: path.dirname(file),
    });
  }

  docs.sort((a, b) => b.date.getTime() - a.date.getTime());
  return docs;
}

let cache: Doc[] | null = null;

export function getDocs(): Doc[] {
  if (!cache) {
    cache = [...loadKind("article"), ...loadKind("idea"), ...loadKind("transcript")];
  }
  return cache;
}

export function getByKind(kind: ContentKind): Doc[] {
  return getDocs().filter((doc) => doc.kind === kind);
}

export function getDoc(kind: ContentKind, slug: string): Doc {
  const doc = getByKind(kind).find((item) => item.slug === slug);
  if (!doc) throw new Error(`Missing ${kind} ${slug}`);
  return doc;
}

export function getFeatured(): Doc {
  const doc = getByKind("article").find((item) => item.slug === FEATURED_SLUG);
  if (!doc) throw new Error(`Missing featured article ${FEATURED_SLUG}`);
  return doc;
}

export function getRecent(): Doc[] {
  return getByKind("article").filter(
    (doc) => doc.slug !== FEATURED_SLUG && doc.year >= ARCHIVE_BEFORE_YEAR,
  );
}

export function getArchive(): Doc[] {
  return getByKind("article").filter((doc) => doc.year < ARCHIVE_BEFORE_YEAR);
}

export function groupByYear(docs: Doc[]): { year: number; posts: Doc[] }[] {
  const groups: { year: number; posts: Doc[] }[] = [];
  for (const doc of docs) {
    const last = groups[groups.length - 1];
    if (!last || last.year !== doc.year) groups.push({ year: doc.year, posts: [doc] });
    else last.posts.push(doc);
  }
  return groups;
}

export function neighbors(doc: Doc): { previous: Doc | null; next: Doc | null } {
  const list = getByKind(doc.kind);
  const index = list.findIndex((item) => item.slug === doc.slug);
  return {
    next: index > 0 ? list[index - 1] : null,
    previous: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
}

const DATE_FULL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatFull(date: Date): string {
  return DATE_FULL.format(date);
}

export function formatShort(date: Date): string {
  return DATE_SHORT.format(date);
}

export function formatArchive(date: Date): string {
  return formatShort(date);
}

export function absoluteUrl(pathname: string): string {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) return pathname;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path}`;
}

export function ogLeaf(slug: string): string {
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? slug;
}
