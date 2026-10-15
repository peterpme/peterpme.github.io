import { Marked, type Tokens } from "marked";
import { renderLocalImage } from "./content-images.ts";

const KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "false",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "switch",
  "throw",
  "true",
  "try",
  "undefined",
  "while",
  "workflow",
  "yield",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightLine(line: string): string {
  const commentAt = line.indexOf("//");
  const code = commentAt === -1 ? line : line.slice(0, commentAt);
  const comment = commentAt === -1 ? "" : line.slice(commentAt);
  const re =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z_"'`]+)/g;
  let html = "";
  let last = 0;
  for (const match of code.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) html += escapeHtml(code.slice(last, index));
    const word = match[2];
    if (match[1]) html += `<span class="tok-s">${escapeHtml(match[1])}</span>`;
    else if (word && KEYWORDS.has(word)) html += `<span class="tok-k">${word}</span>`;
    else if (word && code[index + word.length] === "(") html += `<span class="tok-f">${word}</span>`;
    else html += escapeHtml(match[0]);
    last = index + match[0].length;
  }
  if (last < code.length) html += escapeHtml(code.slice(last));
  if (!comment) return html;
  return `${html}<span class="tok-c">${escapeHtml(comment)}</span>`;
}

function renderCode(token: Tokens.Code): string {
  const source = token.text.replace(/\n$/, "");
  const lines = source.split("\n").map((line) => `<span class="line">${highlightLine(line)}</span>`);
  const lang = token.lang ? escapeHtml(token.lang) : "text";
  return `<pre class="codeblock"><code data-lang="${lang}">${lines.join("")}</code></pre>`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function dressHtml(html: string, dir: string): Promise<string> {
  const withoutStyle = html.replace(/\sstyle="[^"]*"/g, "");
  const tags = [...withoutStyle.matchAll(/<img\b([^>]*?)>/g)];
  const rendered = new Map<string, string>();
  for (const match of tags) {
    const tag = match[0];
    const attrs = match[1];
    const srcMatch = attrs.match(/\ssrc="([^"]+)"/);
    const altMatch = attrs.match(/\salt="([^"]*)"/);
    if (!srcMatch || rendered.has(tag)) continue;
    const local = await renderLocalImage(srcMatch[1], altMatch?.[1] ?? "", dir);
    if (local) rendered.set(tag, local);
  }
  const withImages = withoutStyle.replace(/<img\b([^>]*?)>/g, (tag) => rendered.get(tag) ?? tag);
  const withExternal = withImages.replace(
    /<a href="(https?:\/\/[^"]+)"(?![^>]*\btarget=)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
  return withExternal.replace(/<p>([\s\S]*?)<\/p>/g, (paragraph, inner: string) => {
    if (!inner.includes("youtube.com") || !/transcript/i.test(inner)) return paragraph;
    return `<aside class="note"><p>${inner}</p></aside>`;
  });
}

export async function renderMarkdown(source: string, dir: string): Promise<string> {
  const images = new Map<string, (alt: string) => string>();
  for (const src of collectImageSrcs(source)) {
    const local = await renderLocalImage(src, "", dir);
    if (!local) continue;
    images.set(src, (alt: string) => local.replace('alt=""', `alt="${escapeHtml(alt)}"`));
  }

  const marked = new Marked();
  marked.use({
    gfm: true,
    renderer: {
      code(token: Tokens.Code) {
        return renderCode(token);
      },
      image(token: Tokens.Image) {
        const alt = token.text ?? "";
        const cached = images.get(token.href);
        if (cached) return cached(alt);
        const href = escapeHtml(token.href);
        return `<img src="${href}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
      },
      link(token: Tokens.Link) {
        const inner = this.parser.parseInline(token.tokens);
        const href = escapeHtml(token.href);
        const external = /^https?:\/\//.test(token.href);
        const extra = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${href}"${extra}>${inner}</a>`;
      },
      heading(token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        const id = slugify(token.text);
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>`;
      },
    },
  });

  const html = marked.parse(source, { async: false });
  if (typeof html !== "string") throw new Error("Expected synchronous markdown");
  return dressHtml(html, dir);
}

export function collectImageSrcs(source: string): string[] {
  const srcs = new Set<string>();
  for (const match of source.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    srcs.add(match[1]);
  }
  for (const match of source.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)) {
    srcs.add(match[1]);
  }
  return [...srcs];
}
