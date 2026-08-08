import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { EVENT_QUERY, EVENT_SLUGS_QUERY } from "@/sanity/queries";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { AddToCalendar } from "@/components/modules/AddToCalendar";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { EventCard } from "@/components/modules/EventCard";
import { PortableBody } from "@/components/modules/PortableBody";
import { RegistrationPanel } from "@/components/modules/RegistrationPanel";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import {
  calendarLinks,
  derivePanelState,
  longDate,
  longDateTime,
  timeRange,
} from "@/lib/events";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(EVENT_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { event } = await sanityFetch(EVENT_QUERY, { slug });
  return {
    title: event?.seo?.metaTitle ?? event?.title ?? "Session",
    description:
      event?.seo?.metaDescription ?? event?.shortDescription ?? undefined,
    alternates: { canonical: `/events/${slug}` },
    ...(event?.seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, others } = await sanityFetch(EVENT_QUERY, { slug });
  if (!event) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/events/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  const isOnline = event.venueType === "online";
  const panelState = derivePanelState({
    startDateTime: event.startDateTime,
    registrationClosesAt: event.registrationClosesAt,
    spotsRemaining: event.spotsRemaining,
  });

  const locationLabel = isOnline
    ? (event.platform ?? "Online")
    : [event.venueName, event.address?.replace(/\n/g, ", ")]
        .filter(Boolean)
        .join(", ");

  const calendar = calendarLinks({
    title: event.title ?? "Zippily Session",
    start: event.startDateTime ?? "",
    end: event.endDateTime ?? event.startDateTime ?? "",
    details: event.shortDescription ?? undefined,
    location: locationLabel || undefined,
  });

  const directionsUrl = event.geo
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.geo.lat},${event.geo.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`;

  const eventJsonLd = {
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
    url: `${SITE_URL}/events/${slug}`,
    location: isOnline
      ? { "@type": "VirtualLocation", name: event.platform ?? "Online" }
      : {
          "@type": "Place",
          name: event.venueName,
          address: event.address?.replace(/\n/g, ", "),
        },
    organizer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: event.price ?? 0,
      priceCurrency: "NZD",
      url: `${SITE_URL}/events/${slug}`,
      availability:
        (event.spotsRemaining ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
  };

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Events", url: `${SITE_URL}/events` },
          { name: event.title ?? slug, url: `${SITE_URL}/events/${slug}` },
        ])}
      />

      {/* Header image — full bleed */}
      <SanityImage
        image={event.heroImage}
        width={1600}
        height={440}
        className="w-full rounded-b-[18px] object-cover md:rounded-b-3xl"
        style={{ height: 440 }}
        placeholderLabel="Wide session photo"
      />

      {/* Body — two columns on desktop */}
      <section className="bg-off-white-tan">
        <div className="mx-auto grid max-w-[90rem] gap-16 px-6 pb-24 sm:px-12 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="pt-14">
            <Link
              href="/events"
              className="text-caption font-semibold text-deep-blue-80 hover:text-deep-blue"
            >
              ← All sessions
            </Link>

            {(event.categories?.length ?? 0) > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.categories?.map((category, index) => (
                  <span
                    key={category}
                    className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
                      index === 0
                        ? "bg-deep-blue text-white"
                        : "bg-sky-blue/30 text-deep-blue"
                    }`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mt-5 text-pretty text-h1-mobile md:text-h1">
              {event.title}
            </h1>

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-[#DCDACB] pb-8">
              {event.startDateTime && (
                <p className="flex items-center gap-2.5 text-body text-deep-blue-80">
                  <Icon name="calendar" className="h-4.5 w-4.5 text-deep-blue" />
                  {longDateTime(event.startDateTime, event.endDateTime)}
                </p>
              )}
              <p className="flex items-center gap-2.5 text-body text-deep-blue-80">
                <Icon
                  name={isOnline ? "video" : "map-pin"}
                  className="h-4.5 w-4.5 text-deep-blue"
                />
                {isOnline
                  ? (event.platform ?? "Online")
                  : (event.shortLocation ?? event.venueName)}
              </p>
              {event.startDateTime && <AddToCalendar links={calendar} />}
            </div>

            {/* Description */}
            {event.description && (
              <div className="max-w-2xl pb-2 pt-9">
                <PortableBody value={event.description} />
              </div>
            )}

            {/* What to expect — hidden when empty */}
            {(event.whatToExpect?.length ?? 0) > 0 && (
              <div className="max-w-2xl pb-2 pt-8">
                <h2 className="text-h3">What to expect</h2>
                <div className="mt-6 flex flex-col gap-5.5">
                  {event.whatToExpect?.map((item, index) => (
                    <div key={item._key} className="flex gap-4">
                      <span
                        aria-hidden
                        className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-deep-blue text-[15px] font-bold text-white"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-body-lg font-semibold text-deep-blue">
                          {item.heading}
                        </p>
                        <p className="mt-1 text-body text-deep-blue-80">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="max-w-2xl pb-2 pt-8">
              <h2 className="text-h3">
                {isOnline ? "Where it happens" : "Where to find us"}
              </h2>
              {isOnline ? (
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#DCDACB] bg-white px-6.5 py-6">
                  <span className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-xl bg-sky-blue/25">
                    <Icon name="video" className="h-5 w-5 text-deep-blue" />
                  </span>
                  <div>
                    <p className="text-body-lg font-semibold text-deep-blue">
                      {event.platform ?? "Online"}
                    </p>
                    <p className="mt-1 text-body text-deep-blue-80">
                      Join link sent when you register.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {event.address && (
                    <p className="mt-4 whitespace-pre-line text-body-lg leading-relaxed text-deep-blue-80">
                      {event.venueName}
                      {"\n"}
                      {event.address}
                    </p>
                  )}
                  <div
                    className="mt-5 flex items-center justify-center rounded-2xl bg-[#E4E2D6] text-caption text-deep-blue-80"
                    style={{ height: 260 }}
                    role="img"
                    aria-label="Map showing the venue location"
                  >
                    Map — {event.shortLocation ?? event.venueName}
                  </div>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block border-b-2 border-sky-blue pb-0.5 text-body font-semibold text-deep-blue"
                  >
                    Get directions →
                  </a>
                </>
              )}
            </div>

            {/* Hosted by — pulls from the team member used on About Us */}
            {event.host && (
              <div className="mt-11 max-w-2xl rounded-[20px] bg-deep-blue p-11 text-white">
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-sky-blue">
                  Hosted by
                </p>
                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <SanityImage
                    image={event.host.photo}
                    width={132}
                    height={132}
                    className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-33 sm:w-33"
                    placeholderLabel=""
                  />
                  <div>
                    <p className="text-h3">{event.host.name}</p>
                    <p className="mt-1 text-body font-semibold text-sky-blue">
                      {event.host.role}
                    </p>
                    {event.hostIntro && (
                      <p className="mt-3 max-w-md text-body-lg text-white/78">
                        {event.hostIntro}
                      </p>
                    )}
                    {event.host.linkedIn && (
                      <a
                        href={event.host.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-body font-semibold text-white underline decoration-sky-blue decoration-2 underline-offset-4"
                      >
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration panel */}
          <div className="lg:pt-14">
            <RegistrationPanel
              eventTitle={event.title ?? "Zippily Session"}
              state={panelState}
              dateLine={
                event.startDateTime
                  ? longDateTime(event.startDateTime, event.endDateTime)
                  : ""
              }
              spotsRemaining={event.spotsRemaining}
              capacity={event.capacity}
              price={event.price}
              venueCaption={`${
                event.startDateTime && event.endDateTime
                  ? timeRange(event.startDateTime, event.endDateTime)
                  : "Two-hour"
              } session, ${isOnline ? "online" : (event.shortLocation ?? "Auckland")}`}
              calendar={calendar}
              startedAtLabel={
                event.startDateTime ? longDate(event.startDateTime) : ""
              }
            />
          </div>
        </div>
      </section>

      {/* Other sessions — hidden when there are none */}
      {others.length > 0 && (
        <section className="border-t border-[#DCDACB] bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 pb-24 pt-20 sm:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-h2">Other sessions</h2>
              <Link
                href="/events"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                See all sessions →
              </Link>
            </div>
            <div className="mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
              {others.map((other) => (
                <EventCard key={other._id} event={other} imageHeight={200} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner
        data={{
          heading: "Not the workshop type? Let's just talk.",
          text: "A free 30-minute chat about where your HubSpot is at — no pitch deck, no pressure.",
          button: { label: "Let's chat →", href: "/contact" },
        }}
      />

      {/* Space for the fixed mobile registration bar */}
      <div aria-hidden className="h-30 lg:hidden" />
    </>
  );
}
