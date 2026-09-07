import { parseVimeoUrl, vimeoOembedUrl } from "@/lib/vimeo";
import { urlFor } from "@/sanity/image";

/**
 * The poster for a case study film: the editor-uploaded still when one
 * exists, otherwise the frame Vimeo picked (via oEmbed below). 16:9 to
 * match the player, so the swap from poster to iframe doesn't jump.
 */
export async function resolveVideoPoster(
  still: { asset?: { _ref?: string } | null } | null | undefined,
  url?: string | null,
): Promise<string | null> {
  if (still?.asset?._ref) {
    return urlFor(still).width(1600).height(900).url();
  }
  return fetchVimeoPoster(url);
}

/**
 * The poster frame for a Vimeo video, recovered server-side via oEmbed.
 *
 * None of the case studies carry an uploaded still yet, so without this the
 * click-to-play facade is a bare Deep Blue box. Failure of any kind returns
 * null — the facade degrades to that box rather than the page erroring over
 * a thumbnail.
 */
export async function fetchVimeoPoster(
  url?: string | null,
): Promise<string | null> {
  if (!url) return null;
  const ref = parseVimeoUrl(url);
  if (!ref) return null;
  try {
    // Cached for a day: the thumbnail only changes if someone re-uploads the
    // video, and every ISR revalidation would otherwise hit Vimeo again.
    const response = await fetch(vimeoOembedUrl(ref), {
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { thumbnail_url?: string };
    if (!data.thumbnail_url) return null;
    // oEmbed hands back a small thumb (…-d_295x166, sometimes followed by a
    // query string); the size suffix is a CDN parameter, so ask for a
    // hero-sized frame instead. Not end-anchored — `?region=us` follows it.
    return data.thumbnail_url.replace(/-d_[0-9]+x[0-9]+/, "-d_1280x720");
  } catch {
    return null;
  }
}
