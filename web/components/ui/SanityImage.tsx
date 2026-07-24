import Image from "next/image";
import type { CSSProperties } from "react";
import { urlFor } from "@/sanity/image";

type ImageValue = {
  asset?: { _ref?: string } | null;
  alt?: string | null;
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
        src={urlFor(image).width(width * 2).height(height * 2).url()}
        alt={image.alt ?? ""}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-sky-blue/25 text-center text-caption text-deep-blue-80 ${className}`}
      style={style}
      role="img"
      aria-label={placeholderLabel}
    >
      {placeholderLabel}
    </div>
  );
}
