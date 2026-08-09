/**
 * Vimeo URL parsing and embed construction.
 *
 * Editors paste whatever the browser gave them, so the raw URL is what gets
 * stored in Sanity and this is the only place that understands its shapes.
 *
 * The shape that matters most here is the unlisted one —
 * `vimeo.com/123456789/a1b2c3d4e5`. That second segment is a privacy hash,
 * and without carrying it into the embed as `?h=…` the iframe returns a
 * privacy error rather than the video. Most Zippily videos are expected to
 * be unlisted rather than public, so that path is the common case, not the
 * exception.
 */
export type VimeoRef = { videoId: string; hash: string | null };

export type VimeoOrientation = "landscape" | "portrait" | "square";

/** Aspect ratios, as CSS `aspect-ratio` values. Drives a fixed-size
 *  container so embedding a video never shifts the layout. */
export const VIMEO_ASPECT: Record<VimeoOrientation, string> = {
  landscape: "16 / 9",
  portrait: "9 / 16",
  square: "1 / 1",
};

const DIGITS = /^\d+$/;
// Vimeo privacy hashes are lowercase hex, ~10 characters.
const HASH = /^[0-9a-f]{6,16}$/i;

/**
 * Pulls the video id and privacy hash out of any Vimeo URL we accept.
 * Returns null for anything that is not a Vimeo video URL, so callers can
 * refuse it rather than rendering a broken frame.
 */
export function parseVimeoUrl(input: string): VimeoRef | null {
  if (!input) return null;

  let url: URL;
  try {
    // Tolerate a pasted URL with no protocol.
    url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  // player.vimeo.com/video/123456789?h=abc
  if (host === "player.vimeo.com") {
    const index = parts.indexOf("video");
    const id = index >= 0 ? parts[index + 1] : undefined;
    if (!id || !DIGITS.test(id)) return null;
    return { videoId: id, hash: readHash(url.searchParams.get("h")) };
  }

  // channels/{channel}/123456789 and groups/{group}/videos/123456789 — the
  // id is the last numeric segment either way, so find it rather than
  // pattern-matching each container type separately.
  if (parts[0] === "channels" || parts[0] === "groups") {
    const id = [...parts].reverse().find((part) => DIGITS.test(part));
    if (!id) return null;
    return { videoId: id, hash: readHash(url.searchParams.get("h")) };
  }

  // vimeo.com/123456789 and vimeo.com/123456789/a1b2c3d4e5
  if (!DIGITS.test(parts[0])) return null;
  const hashSegment = parts[1] && HASH.test(parts[1]) ? parts[1] : null;
  return {
    videoId: parts[0],
    hash: hashSegment ?? readHash(url.searchParams.get("h")),
  };
}

function readHash(value: string | null): string | null {
  return value && HASH.test(value) ? value : null;
}

/**
 * The iframe src.
 *
 * dnt=1 keeps Vimeo from setting tracking cookies, which keeps the consent
 * story simple. The rest strip Vimeo's own chrome so the frame matches the
 * site rather than advertising the host.
 */
export function buildVimeoEmbedUrl(
  ref: VimeoRef,
  options: { autoplay?: boolean; background?: boolean } = {},
): string {
  const url = new URL(`https://player.vimeo.com/video/${ref.videoId}`);
  if (ref.hash) url.searchParams.set("h", ref.hash);
  url.searchParams.set("dnt", "1");
  url.searchParams.set("title", "0");
  url.searchParams.set("byline", "0");
  url.searchParams.set("portrait", "0");
  // Set only when the user has clicked the facade — never on page load.
  if (options.autoplay) url.searchParams.set("autoplay", "1");
  // Background mode: the hero brand video. Muted, looping, chrome-less —
  // it behaves as a moving image, which is why autoplay is acceptable here
  // and only here: no sound plays without the user asking for it.
  if (options.background) {
    url.searchParams.set("background", "1");
    url.searchParams.set("muted", "1");
    url.searchParams.set("loop", "1");
    url.searchParams.set("autopause", "0");
  }
  return url.toString();
}

/** The oEmbed endpoint used server-side to recover a poster image when the
 *  editor did not upload one. Never called from the browser. */
export function vimeoOembedUrl(ref: VimeoRef): string {
  const video = ref.hash
    ? `https://vimeo.com/${ref.videoId}/${ref.hash}`
    : `https://vimeo.com/${ref.videoId}`;
  return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(video)}`;
}
