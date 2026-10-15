import { SanityImage } from "@/components/ui/SanityImage";

type Certification = {
  _key: string;
  title?: string | null;
  text?: string | null;
  image?: {
    asset?: { _ref?: string } | null;
    alt?: string | null;
  } | null;
};

/**
 * The credentials we hold, as small panels for the Deep Blue heroes.
 *
 * The panel is solid off-white rather than the translucent wash PartnerBadge
 * uses, and that is deliberate: this badge art is a very dark green disc,
 * close enough to Deep Blue that on a translucent panel it all but vanishes.
 * A pale ground is what lets it read.
 *
 * Renders nothing when an industry has no certifications, so the callers can
 * drop it in unconditionally.
 */
export function CertificationBadges({
  certifications,
  className = "",
}: {
  certifications?: Certification[] | null;
  className?: string;
}) {
  const items = (certifications ?? []).filter(
    (c) => c.image?.asset?._ref && c.title,
  );
  if (items.length === 0) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((c) => (
        <div
          key={c._key}
          className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-off-white-tan p-4 text-left text-deep-blue"
        >
          <SanityImage
            image={c.image}
            width={80}
            height={80}
            fit="max"
            className="h-[72px] w-auto shrink-0 sm:h-20"
          />
          <div className="min-w-0">
            <p className="text-body font-semibold leading-tight">{c.title}</p>
            {c.text && (
              <p className="mt-1 text-caption leading-snug text-deep-blue-80">
                {c.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
