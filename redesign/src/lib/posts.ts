import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ARCHIVE_BEFORE_YEAR, FEATURED_SLUG } from "./site";

export type Post = {
  title: string;
  description: string;
  date: Date;
  year: number;
  slug: string;
  href: string;
  minutes: number;
  categories: string[];
  body: string;
};

const BLOG_DIR = path.resolve(process.cwd(), "../content/blog");

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
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
}

function loadPosts(): Post[] {
  const files: string[] = [];
  walk(BLOG_DIR, files);
  const posts: Post[] = [];
  const seen = new Map<string, string>();

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const title = parsed.data.title;
    const date = asDate(parsed.data.date);
    if (typeof title !== "string" || !title.trim() || !date) continue;

    const slug = path.basename(file, ".md");
    const previous = seen.get(slug);
    if (previous) {
      throw new Error(`Duplicate post slug "${slug}" in ${previous} and ${file}`);
    }
    seen.set(slug, file);

    const description =
      typeof parsed.data.description === "string" ? parsed.data.description.trim() : "";

    posts.push({
      title: title.trim(),
      description,
      date,
      year: date.getUTCFullYear(),
      slug,
      href: `/articles/${slug}/`,
      minutes: readingMinutes(parsed.content),
      categories: asList(parsed.data.categories),
      body: parsed.content,
    });
  }

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return posts;
}

const posts = loadPosts();

export function getPosts(): Post[] {
  return posts;
}

export function getFeatured(): Post {
  const featured = posts.find((post) => post.slug === FEATURED_SLUG);
  if (!featured) throw new Error(`Missing featured post ${FEATURED_SLUG}`);
  return featured;
}

export function getRecent(): Post[] {
  return posts.filter(
    (post) => post.slug !== FEATURED_SLUG && post.year >= ARCHIVE_BEFORE_YEAR,
  );
}

export function getArchive(): Post[] {
  return posts.filter((post) => post.year < ARCHIVE_BEFORE_YEAR);
}

export function groupByYear(list: Post[]): Array<{ year: number; posts: Post[] }> {
  const groups: Array<{ year: number; posts: Post[] }> = [];
  for (const post of list) {
    const last = groups[groups.length - 1];
    if (!last || last.year !== post.year) groups.push({ year: post.year, posts: [post] });
    else last.posts.push(post);
  }
  return groups;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatFull(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatArchive(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
