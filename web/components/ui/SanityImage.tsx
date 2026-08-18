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
}: {
  image?: ImageValue;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  placeholderLabel?: string;
}) {
  if (image?.asset?._ref) {
    return (
      <Image
        // An editor-set size wins over the layout default. Both are doubled
        // for retina. Hotspot and crop from Studio are applied automatically
        // by urlFor once both dimensions are given.
        src={urlFor(image)
          .width((image?.displayWidth ?? width) * 2)
          .height((image?.displayHeight ?? height) * 2)
          .url()}
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
