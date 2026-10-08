import type { Metadata } from "next";
import { urlFor } from "@/sanity/image";

type SeoWithOgImage = {
  ogImage?: { asset?: { _ref?: string } | null } | null;
} | null | undefined;

/**
 * Turns a Sanity `seo.ogImage` into the `openGraph`/`twitter` image metadata.
 *
 * The field has existed on the `seo` object since launch and editors have been
 * filling it in, but nothing read it — every page fell through to the generic
 * /opengraph-image route. Spread the result into a page's Metadata and the
 * route-level default still applies whenever the field is empty, so a page
 * without one is unchanged.
 *
 * 1200x630 is the Open Graph standard; `fit("crop")` honours the hotspot set
 * in Studio rather than centre-cropping a subject out of frame.
 */
export function ogImageMeta(seo: SeoWithOgImage): Metadata {
  const ref = seo?.ogImage?.asset?._ref;
  if (!ref) return {};
  const url = urlFor(seo!.ogImage!).width(1200).height(630).fit("crop").url();
  return {
    openGraph: { images: [{ url, width: 1200, height: 630 }] },
    twitter: { images: [url] },
  };
}
