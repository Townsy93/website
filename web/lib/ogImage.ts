import type { Metadata } from "next";
import { urlFor } from "@/sanity/image";
import { shareMeta } from "./openGraph.ts";

type SeoWithOgImage = {
  ogImage?: { asset?: { _ref?: string } | null } | null;
} | null | undefined;

/**
 * Canonical + Open Graph metadata for a page, with the Sanity `seo.ogImage`
 * as the share image when the editor has set one.
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
export function pageMeta(
  path: string,
  seo?: SeoWithOgImage,
  type?: "website" | "article",
): Metadata {
  const ref = seo?.ogImage?.asset?._ref;
  const imageUrl = ref
    ? urlFor(seo!.ogImage!).width(1200).height(630).fit("crop").url()
    : undefined;
  return shareMeta(path, { type, imageUrl });
}
