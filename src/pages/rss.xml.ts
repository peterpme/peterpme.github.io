import type { APIRoute } from "astro";
import { getByKind } from "../lib/content";
import { renderMarkdown } from "../lib/markdown";
import { AUTHOR, DESCRIPTION, SITE_URL } from "../lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteHtml(html: string): string {
  return html
    .replace(/(href|src)="\//g, `$1="${SITE_URL}/`)
    .replace(/srcset="([^"]+)"/g, (_match, srcset: string) => {
      const rewritten = srcset
        .split(",")
        .map((part) => {
          const trimmed = part.trim();
          return trimmed.startsWith("/") ? `${SITE_URL}${trimmed}` : trimmed;
        })
        .join(", ");
      return `srcset="${rewritten}"`;
    });
}

export const GET: APIRoute = () => {
  const items = getByKind("article")
    .map((doc) => {
      const link = `${SITE_URL}${doc.href}`;
      const html = absoluteHtml(renderMarkdown(doc.body, doc.dir));
      return `<item>
        <title>${escapeXml(doc.title)}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${doc.date.toUTCString()}</pubDate>
        <author>peter@peterp.me (${escapeXml(AUTHOR)})</author>
        <description>${escapeXml(doc.description || doc.title)}</description>
        <content:encoded><![CDATA[${html.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>
      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(AUTHOR)}</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
