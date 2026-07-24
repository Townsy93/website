import Image from "next/image";
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
  placeholderLabel = "Photo to come",
}: {
  image?: ImageValue;
  width: number;
  height: number;
  className?: string;
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
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-sky-blue/25 text-caption text-deep-blue-80 ${className}`}
      role="img"
      aria-label={placeholderLabel}
    >
      {placeholderLabel}
    </div>
  );
}
