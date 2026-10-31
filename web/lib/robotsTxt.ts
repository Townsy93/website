/**
 * The site's robots.txt.
 *
 * Written as text, not through Next's robots.ts, because robots.ts has no way
 * to emit a `Content-Signal` line. Content signals (contentsignals.org) state
 * what the site allows besides plain crawling:
 *
 *   search    - building a search index and returning links or snippets
 *   ai-input  - feeding content into an AI answer, grounding or retrieval
 *   ai-train  - training or fine-tuning a model
 *
 * Zippily wants to be found and cited, so search and ai-input are yes. Training
 * is no. This is a stated preference, honoured by crawlers that choose to, not
 * a technical barrier, and it does not change who may crawl: `Allow: /` stands.
 *
 * Not the live host (staging, previews) gets a flat Disallow and no signal, as
 * it did before: those hosts should stay out of every index.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

export function robotsTxt({
  indexable,
  siteUrl,
}: {
  indexable: boolean;
  siteUrl: string;
}): string {
  if (!indexable) return "User-Agent: *\nDisallow: /\n";
  return [
    "User-Agent: *",
    `Content-Signal: ${CONTENT_SIGNAL}`,
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
