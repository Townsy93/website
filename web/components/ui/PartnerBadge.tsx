import Image from "next/image";

// The bare Platinum badge, for placing on Deep Blue. PartnerBand is the
// light-background credential strip with its own heading and copy; this is
// just the mark, for heroes where the wording would be noise.
//
// The asset is the cream variant on transparent, so it carries its own
// contrast against Deep Blue and needs no plate behind it. Shared rather
// than inlined for the same reason PartnerBand is: the tier wording and the
// file it points at should only ever be changed in one place.
export function PartnerBadge({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/hubspot-platinum-badge.png"
      alt="HubSpot Platinum Solutions Partner badge"
      width={88}
      height={88}
      className={`h-16 w-auto shrink-0 sm:h-[72px] ${className}`}
    />
  );
}
