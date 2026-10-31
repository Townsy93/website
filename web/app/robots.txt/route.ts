import { headers } from "next/headers";
import { isIndexableHost } from "@/lib/indexable";
import { robotsTxt } from "@/lib/robotsTxt";
import { SITE_URL } from "@/lib/site";

/**
 * Host-aware, so the staging Worker does not compete with the live domain.
 *
 * Reading headers() makes this one route dynamic, which is the point: the same
 * Worker serves more than one hostname and the answer differs per request. It
 * is a few hundred bytes of text and nothing else on the site is affected.
 *
 * This replaced app/robots.ts so the file can carry a Content-Signal line; see
 * lib/robotsTxt.ts. To also get already-indexed staging URLs dropped, a
 * Cloudflare Transform Rule can set `X-Robots-Tag: noindex` on *.workers.dev,
 * since robots.txt only asks crawlers not to crawl.
 */
export async function GET() {
  const host = (await headers()).get("host");
  return new Response(
    robotsTxt({ indexable: isIndexableHost(host), siteUrl: SITE_URL }),
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}
