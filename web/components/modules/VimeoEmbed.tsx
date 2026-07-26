"use client";

import { useState } from "react";
import Image from "next/image";
import {
  buildVimeoEmbedUrl,
  parseVimeoUrl,
  VIMEO_ASPECT,
  type VimeoOrientation,
} from "@/lib/vimeo";

/**
 * A Vimeo video, rendered as a facade.
 *
 * The poster and a play button are all that load initially; the iframe is
 * injected on click. The Vimeo player is heavy, and eagerly embedding it
 * would fail the Core Web Vitals gate on any page carrying more than one
 * video — Our Work will carry several.
 *
 * The container is a fixed aspect ratio from the start, so swapping the
 * poster for the iframe never shifts the page.
 */
export function VimeoEmbed({
  url,
  title,
  orientation = "landscape",
  posterUrl,
  caption,
}: {
  url?: string | null;
  title?: string | null;
  orientation?: VimeoOrientation | null;
  posterUrl?: string | null;
  caption?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = url ? parseVimeoUrl(url) : null;

  // An unparseable or missing URL renders nothing at all rather than an
  // empty frame — same rule as a missing video.
  if (!ref) return null;

  const ratio = VIMEO_ASPECT[orientation ?? "landscape"];
  const label = title ?? "Video";

  return (
    <figure className="mx-auto w-full" style={{ maxWidth: orientation === "portrait" ? 420 : undefined }}>
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-deep-blue"
        style={{ aspectRatio: ratio }}
      >
        {playing ? (
          <iframe
            src={buildVimeoEmbedUrl(ref, { autoplay: true })}
            title={label}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${label}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {posterUrl && (
              <Image
                src={posterUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
                {/* Deep Blue glyph on white — orange is only ever used on a
                    Deep Blue fill, and this sits on the poster image. */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 text-deep-blue" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-[13px] text-body">{caption}</figcaption>
      )}
    </figure>
  );
}
