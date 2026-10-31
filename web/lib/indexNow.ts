import { SITE_URL } from "./site.ts";

/**
 * IndexNow: tells Bing (and through it Copilot and ChatGPT search), Yandex,
 * Naver and Seznam that a URL has changed, the moment it does, instead of
 * waiting for them to crawl. Google does not take part; its route is the
 * sitemap and Search Console.
 *
 * The key is not a secret. The protocol proves we own the site by fetching
 * `/<key>.txt` and finding the key inside, so it has to be public. That file
 * lives in public/.
 */
export const INDEXNOW_KEY = "3c34f1f8bc1cc8cf357d5444ca338ba4";

// The shared endpoint passes a submission on to every participating engine,
// so it goes first. It answers 429 to Cloudflare Workers, whose outbound
// addresses are shared with a great many other sites, so each engine's own
// endpoint follows as a fallback. Bing's is the one that matters most: it
// feeds Copilot and ChatGPT search.
export const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

type Doc = {
  _type?: string;
  slug?: { current?: string | null } | null;
  pageBuilt?: boolean | null;
  status?: string | null;
  seo?: { noIndex?: boolean | null } | null;
};

const PREFIX: Record<string, string> = {
  service: "/services",
  partnerIntegration: "/platforms",
  industry: "/industries",
  caseStudy: "/our-work",
  blogPost: "/insights",
  event: "/events",
  landingPage: "/lp",
  vacancy: "/careers",
};

// The list page that grows or changes when one of its documents does.
const LISTING: Record<string, string> = {
  service: "/services",
  partnerIntegration: "/platforms",
  industry: "/industries",
  caseStudy: "/our-work",
  blogPost: "/insights",
  event: "/events",
  vacancy: "/careers",
};

// The sitemap's own gates. A page the sitemap leaves out is one that is not
// ready or not meant to be found, so it must not be announced either.
const NEEDS_BUILT = new Set(["service", "partnerIntegration", "industry", "caseStudy", "landingPage"]);

/** The URLs to announce for a published document; empty when there are none. */
export function indexNowUrls(doc: Doc): string[] {
  const prefix = doc._type ? PREFIX[doc._type] : undefined;
  const slug = doc.slug?.current;
  if (!doc._type || !prefix || !slug) return [];
  if (doc.seo?.noIndex) return [];
  if (NEEDS_BUILT.has(doc._type) && doc.pageBuilt !== true) return [];
  if (doc._type === "caseStudy" && doc.status !== "live") return [];
  if (doc._type === "vacancy" && doc.status !== "open") return [];
  const paths = [`${prefix}/${slug}`];
  if (LISTING[doc._type]) paths.push(LISTING[doc._type]);
  return paths.map((path) => `${SITE_URL}${path}`);
}

/**
 * Sends the URLs, trying each endpoint until one accepts them. Resolves to a
 * short result and never throws: the caller is a publish webhook, and a
 * search-engine hiccup must not turn a successful publish into a failed one.
 */
export async function submitIndexNow(
  urls: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<{ sent: number; status?: number; endpoint?: string; error?: string }> {
  if (urls.length === 0) return { sent: 0 };
  const body = JSON.stringify({
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });
  let last: { status?: number; error?: string } = {};
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
        signal: AbortSignal.timeout(3000),
      });
      if (res.status >= 200 && res.status < 300) {
        return { sent: urls.length, status: res.status, endpoint: new URL(endpoint).host };
      }
      last = { status: res.status };
    } catch (error) {
      last = { error: String(error) };
    }
  }
  return { sent: 0, ...last };
}
