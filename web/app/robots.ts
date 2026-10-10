import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isIndexableHost } from "@/lib/indexable";
import { SITE_URL } from "@/lib/site";

/**
 * Host-aware, so the staging Worker does not compete with the live domain.
 *
 * Reading headers() makes this one route dynamic — which is the point, since
 * the same Worker serves both hostnames and the answer differs per request.
 * It is a few hundred bytes of text and nothing else on the site is affected.
 *
 * This was originally written as a proxy (middleware), which would also have
 * set `X-Robots-Tag` on every page. Next 16 pins Proxy to the Node.js runtime
 * and forbids the `runtime` option, and the OpenNext Cloudflare adapter only
 * supports edge middleware, so that route is closed. robots.txt asks crawlers
 * not to crawl; to also get already-indexed staging URLs dropped, add a
 * Cloudflare Transform Rule setting `X-Robots-Tag: noindex` on the
 * *.workers.dev hostname.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");

  if (!isIndexableHost(host)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
