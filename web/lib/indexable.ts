import { SITE_URL } from "./site.ts";

/**
 * Whether a request arriving on this host should be indexable.
 *
 * One Worker serves both the staging hostname and, after cutover, the live
 * domain, so this is decided per request rather than at build time. A
 * build-time flag would be set correctly today and then be wrong the moment
 * DNS moves without a rebuild — and the expensive direction of that mistake
 * is shipping production with `Disallow: /`.
 *
 * Unknown hosts default to NOT indexable: a new preview alias should be
 * quiet until someone decides otherwise, whereas a staging host that
 * silently competes with the real domain is the problem being fixed.
 */
export function isIndexableHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const bare = host.toLowerCase().trim().split(":")[0];
  if (!bare) return false;
  const canonical = new URL(SITE_URL).host.toLowerCase();
  // The apex 301s to www, but it is still the real domain, so allow both.
  const apex = canonical.replace(/^www\./, "");
  return bare === canonical || bare === apex;
}
