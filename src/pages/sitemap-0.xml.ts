import type { APIRoute } from "astro";
import { getDocs } from "../lib/content";
import { SITE_URL } from "../lib/site";

const STATIC_PATHS = ["/", "/about/", "/ideas/", "/talks/", "/transcripts/", "/christmas-lights/"];

export const GET: APIRoute = () => {
  const paths = [...STATIC_PATHS, ...getDocs().map((doc) => doc.href)];
  const body = paths
    .map((pathname) => `<url><loc>${SITE_URL}${pathname}</loc></url>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
