import Image from "next/image";
import type { CSSProperties } from "react";
import { urlFor } from "@/sanity/image";

type ImageValue = {
  asset?: { _ref?: string } | null;
  alt?: string | null;
  // Optional per-image overrides set in Studio. Unset is the normal case and
  // means the layout decides.
  displayWidth?: number | null;
  displayHeight?: number | null;
} | null;

// Renders a Sanity image, or a brand-styled placeholder block while
// photography is still being gathered (people imagery lands in content phase).
export function SanityImage({
  image,
  width,
  height,
  className = "",
  style,
  placeholderLabel = "Photo to come",
  fit = "crop",
}: {
  image?: ImageValue;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  placeholderLabel?: string;
  // "crop" (default) fills the exact width/height box using Studio's hotspot
  // — right for photography. "max" scales down to fit inside the box without
  // cropping — use it for logos and other assets that must show in full
  // (pair with an object-contain className so mismatched aspect ratios
  // letterbox instead of stretching).
  fit?: "crop" | "max";
}) {
  if (image?.asset?._ref) {
    // An editor-set size wins over the layout default. Both are doubled for
    // retina.
    const w = (image?.displayWidth ?? width) * 2;
    const h = (image?.displayHeight ?? height) * 2;
    // urlFor auto-crops to the target aspect ratio — inserting a centred
    // `rect=` — whenever BOTH dimensions are given, and it does that before
    // `fit` is ever considered, so `fit=max` alone cannot prevent it. That
    // silently sliced logos down to a band of themselves (a square logo came
    // through as a 4:1 sliver). Constraining height only leaves the URL
    // rect-free, so the whole asset survives at its own aspect ratio and the
    // caller's object-contain letterboxes it inside the layout box.
    const src =
      fit === "max"
        ? urlFor(image).height(h).fit("max").url()
        : urlFor(image).width(w).height(h).fit(fit).url();
    return (
      <Image
        src={src}
        alt={image.alt ?? ""}
        width={image?.displayWidth ?? width}
        height={image?.displayHeight ?? height}
        className={className}
        style={style}
      />
    );
  }
  return (
    <div
      className={// Opaque, not sky-blue/25: an alpha background lets whatever is behind
      // the card bleed through, which turned the case study gallery — whose
      // cards straddle the white/Deep Blue boundary — into half-toned slices.
      // #E0ECF3 is exactly what sky-blue at 25% renders to over white, so the
      // look is unchanged everywhere else.
      `flex items-center justify-center bg-[#E0ECF3] text-center text-caption text-deep-blue-80 ${className}`}
      style={style}
      role="img"
      aria-label={placeholderLabel}
    >
      {placeholderLabel}
    </div>
  );
}
