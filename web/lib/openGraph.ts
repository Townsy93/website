import type { Metadata } from "next";
import { SITE_NAME } from "./site.ts";

// The generated card in app/opengraph-image.tsx. It used to reach pages by
// inheritance from the root metadata; a page-level `openGraph` replaces that,
// so a page with no image of its own has to name it.
const DEFAULT_IMAGE = "/opengraph-image";
const DEFAULT_IMAGE_ALT = "zippily — HubSpot implementation & RevOps";

type ShareOptions = {
  type?: "website" | "article";
  imageUrl?: string | null;
};

/**
 * Canonical URL plus the Open Graph block for one page, built from the same
 * path so the two cannot disagree.
 *
 * Next replaces `openGraph` wholesale rather than merging it. The root layout
 * used to hold the site-wide fields, so any page that set its own image lost
 * og:type, og:url, the site name and the locale, and every page that did not
 * inherited `og:url` pointing at the homepage. Ahrefs flagged 37 pages as
 * incomplete; the homepage URL on every other page was the quieter half of
 * the same fault, and tells a social crawler the page is the homepage.
 *
 * `path` is relative; metadataBase makes it absolute.
 */
export function shareMeta(
  path: string,
  { type = "website", imageUrl }: ShareOptions = {},
): Metadata {
  const url = imageUrl ?? DEFAULT_IMAGE;
  const alt = imageUrl ? undefined : DEFAULT_IMAGE_ALT;
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type,
    siteName: SITE_NAME,
    locale: "en_NZ",
    url: path,
    images: [{ url, width: 1200, height: 630, ...(alt ? { alt } : {}) }],
  };
  return {
    alternates: { canonical: path },
    openGraph,
    twitter: { images: [url] },
  };
}
