import { Marked, type Tokens } from "marked";

const KEYWORDS = new Set(["workflow", "loop", "if", "for", "in", "break"]);

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
  const html = escapeHtml(code)
    .replace(/\b(workflow|loop|if|for|in|break)\b/g, (word) =>
      KEYWORDS.has(word) ? `<span class="tok-k">${word}</span>` : word,
    )
    .replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\()/g, '<span class="tok-f">$1</span>');
  if (!comment) return html;
  return `${html}<span class="tok-c">${escapeHtml(comment)}</span>`;
}

function renderCode(token: Tokens.Code): string {
  const source = token.text.replace(/\n$/, "");
  const lines = source.split("\n").map((line) => `<span class="line">${highlightLine(line)}</span>`);
  const lang = token.lang ? escapeHtml(token.lang) : "text";
  return `<pre class="codeblock"><code data-lang="${lang}">${lines.join("")}</code></pre>`;
}

const marked = new Marked();
marked.use({
  gfm: true,
  renderer: {
    code(token: Tokens.Code) {
      return renderCode(token);
    },
    link(token: Tokens.Link) {
      const inner = this.parser.parseInline(token.tokens);
      const href = escapeHtml(token.href);
      const external = /^https?:\/\//.test(token.href);
      const extra = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${extra}>${inner}</a>`;
    },
  },
});

function dressHtml(html: string): string {
  const withoutStyle = html.replace(/\sstyle="[^"]*"/g, "");
  const withExternal = withoutStyle.replace(
    /<a href="(https?:\/\/[^"]+)"(?![^>]*\btarget=)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
  return withExternal.replace(/<p>([\s\S]*?)<\/p>/g, (paragraph, inner: string) => {
    if (!inner.includes("youtube.com")) return paragraph;
    return `<aside class="note"><p>${inner}</p></aside>`;
  });
}

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false });
  if (typeof html !== "string") throw new Error("Expected synchronous markdown");
  return dressHtml(html);
}
