import Link from "next/link";
import { SanityImage } from "@/components/ui/SanityImage";
import { cardMeta } from "@/lib/events";

export type EventCardData = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  categories?: string[] | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  shortLocation?: string | null;
  cardImage?: { asset?: { _ref?: string } | null; alt?: string | null } | null;
  capacity?: number | null;
  spotsRemaining?: number | null;
};

function spotsLine(spotsRemaining?: number | null, capacity?: number | null) {
  if (typeof spotsRemaining !== "number") return null;
  if (spotsRemaining <= 0) return "Waitlist only";
  if (spotsRemaining <= 3) return `Only ${spotsRemaining} spots left`;
  return capacity
    ? `${spotsRemaining} of ${capacity} spots left`
    : `${spotsRemaining} spots left`;
}

// Shared event card — hub grid and the detail page's "Other sessions".
// The whole card is the link; "View session →" is not a separate target.
export function EventCard({
  event,
  imageHeight = 210,
}: {
  event: EventCardData;
  imageHeight?: number;
}) {
  const spots = spotsLine(event.spotsRemaining, event.capacity);
  return (
    <Link
      href={`/events/${event.slug?.current}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(14,47,74,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(14,47,74,0.15)]"
    >
      <div className="relative">
        <SanityImage
          image={event.cardImage}
          width={420}
          height={imageHeight}
          className="w-full object-cover"
          style={{ height: imageHeight }}
          placeholderLabel="Session photo"
        />
        {(event.categories?.length ?? 0) > 0 && (
          <div className="pointer-events-none absolute inset-x-3.5 bottom-3.5 flex flex-wrap gap-1.5">
            {event.categories?.map((category) => (
              <span
                key={category}
                className="rounded-full bg-deep-blue/92 px-2.5 py-1 text-[11.5px] font-semibold text-white"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-6 pb-5.5 pt-6">
        <h3 className="text-h4 leading-tight">{event.title}</h3>
        {event.startDateTime && (
          <p className="mt-2 text-[13.5px] text-[#767666]">
            {cardMeta(
              event.startDateTime,
              event.endDateTime,
              event.shortLocation,
            )}
          </p>
        )}
        {spots && (
          <p className="mt-3 flex flex-1 items-start gap-2 text-[13.5px] font-semibold text-deep-blue">
            <span
              aria-hidden
              className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-deep-orange"
            />
            {spots}
          </p>
        )}
        <span className="mt-4 self-start border-b-2 border-sky-blue pb-0.5 text-body font-semibold text-deep-blue">
          View session →
        </span>
      </div>
    </Link>
  );
}
