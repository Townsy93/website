import Image from "next/image";

/**
 * The Platinum credential as a compact panel, for placing inside the Deep
 * Blue service hero beneath the intro copy.
 *
 * It sat in the breadcrumb row until Oct 2026, where it was too small to
 * read and its height pushed the whole hero down. PartnerBand is the
 * full-width light strip with its own heading and copy; this is the same
 * idea sized to sit inside a hero column.
 *
 * The badge asset is the cream variant on transparent, so it carries its
 * own contrast against Deep Blue and needs no plate behind it. The panel is
 * a translucent white wash rather than Sky Blue: Sky Blue at a low alpha
 * over Deep Blue turns muddy, where plain white keeps the badge crisp.
 */
export function PartnerBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex max-w-md items-center gap-4 rounded-2xl bg-white/7 p-4 ring-1 ring-white/12 ${className}`}
    >
      <Image
        src="/hubspot-platinum-badge.png"
        alt="HubSpot Platinum Solutions Partner badge"
        width={120}
        height={120}
        className="h-[67px] w-auto shrink-0 sm:h-[77px]"
      />
      <div className="min-w-0">
        <p className="text-body font-semibold leading-tight text-white">
          HubSpot Platinum Partner
        </p>
        <p className="mt-1 text-caption leading-snug text-white/65">
          Certified and delivering across New Zealand &amp; Australia, from
          Auckland.
        </p>
      </div>
    </div>
  );
}
