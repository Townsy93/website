/**
 * schema.org Event markup for an event page.
 *
 * Google's Event rich result has two requirements the markup used to miss, and
 * Ahrefs reported all three event pages as "rich results validation error":
 *
 *   - an in-person event's Place needs an `address`. Two past events had a
 *     venue name ("Zippily HQ") and no address, so the Place was just a name.
 *   - an online event's VirtualLocation needs a `url`. Ours had only the
 *     platform's name. The event page is where people register and get the
 *     join details, so that is the URL.
 */
type EventFields = {
  title?: string | null;
  shortDescription?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  venueType?: string | null;
  platform?: string | null;
  venueName?: string | null;
  address?: string | null;
  shortLocation?: string | null;
  price?: number | null;
  spotsRemaining?: number | null;
};

export function eventJsonLd({
  siteUrl,
  slug,
  event,
}: {
  siteUrl: string;
  slug: string;
  event: EventFields;
}): Record<string, unknown> {
  const url = `${siteUrl}/events/${slug}`;
  const isOnline = event.venueType === "online";
  // Prefer the full address; fall back to the short "Newmarket, Auckland" line
  // so a Place is never emitted with no address at all.
  const address = (event.address ?? event.shortLocation)?.replace(/\n/g, ", ");

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url,
    location: isOnline
      ? { "@type": "VirtualLocation", name: event.platform ?? "Online", url }
      : { "@type": "Place", name: event.venueName, address },
    organizer: { "@id": `${siteUrl}/#organization` },
    offers: {
      "@type": "Offer",
      price: event.price ?? 0,
      priceCurrency: "NZD",
      url,
      availability:
        (event.spotsRemaining ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
  };
}
