import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { EVENTS_PAGE_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { EventCard } from "@/components/modules/EventCard";
import { EventFilters } from "@/components/modules/EventFilters";
import { NewsletterForm } from "@/components/modules/NewsletterForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { isThisMonth, longDateTime, pastDate } from "@/lib/events";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  // This query returns { page, upcoming, past }, so the singleton's own
  // fields sit under .page rather than at the top level.
  const data = await sanityFetch(EVENTS_PAGE_QUERY);
  const page = data?.page;
  return {
    title: page?.seo?.metaTitle ?? "Events",
    description: page?.seo?.metaDescription ?? "Zippily Sessions — small, free HubSpot workshops in Auckland. Real questions, no pitch.",
    alternates: { canonical: "/events" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function EventsPage() {
  const { page, upcoming, past } = await sanityFetch(EVENTS_PAGE_QUERY);
  const featured = upcoming[0] ?? null;
  const hasUpcoming = upcoming.length > 0;

  // The grid carries upcoming *and* past sessions so the Past filter has
  // something to show; date buckets are resolved here, on the server.
  const gridEvents = [...upcoming, ...past];
  const filterItems = [
    ...upcoming.map((event) => ({
      id: event._id,
      categories: event.categories ?? [],
      isPast: false,
      isThisMonth: event.startDateTime
        ? isThisMonth(event.startDateTime)
        : false,
    })),
    ...past.map((event) => ({
      id: event._id,
      categories: event.categories ?? [],
      isPast: true,
      isThisMonth: false,
    })),
  ];

  const eventListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Zippily Sessions",
    itemListElement: upcoming.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: event.title,
      url: `${SITE_URL}/events/${event.slug?.current}`,
    })),
  };

  return (
    <>
      <JsonLd data={eventListJsonLd} />

      {/* Hero — Off-White Tan */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-36 sm:px-12">
          {page?.hero?.eyebrow && (
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              {page.hero.eyebrow}
            </p>
          )}
          <h1 className="mt-4 max-w-4xl text-pretty text-h1-mobile md:text-6xl md:leading-[1.04]">
            <EmphasisedHeading
              heading={page?.hero?.heading ?? "Zippily Sessions"}
              phrase={page?.hero?.emphasisPhrase}
              markerStyle={page?.hero?.markerStyle}
              color="sky-blue"
            />
          </h1>
          {page?.hero?.subheading && (
            <p className="mt-6 max-w-xl text-h4 font-normal leading-relaxed text-deep-blue-80">
              {page.hero.subheading}
            </p>
          )}
        </div>
      </section>

      {hasUpcoming && featured ? (
        <>
          {/* Featured next session — Deep Blue */}
          <section className="bg-deep-blue text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-18 sm:px-12 lg:grid-cols-[1.05fr_0.95fr]">
              <SanityImage
                image={featured.cardImage}
                width={620}
                height={440}
                className="w-full rounded-[20px] object-cover"
                style={{ height: 440 }}
                placeholderLabel="Real people around a table — last session"
              />
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                  Next session
                </p>
                {(featured.categories?.length ?? 0) > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featured.categories?.map((category) => (
                      <span
                        key={category}
                        className="rounded-full bg-sky-blue/22 px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="mt-4 text-h2">{featured.title}</h2>
                <div className="mt-5 flex flex-col gap-2.5">
                  {featured.startDateTime && (
                    <p className="flex items-center gap-3 text-body-lg text-white/86">
                      <Icon
                        name="calendar"
                        className="h-5 w-5 shrink-0 text-sky-blue"
                      />
                      {longDateTime(
                        featured.startDateTime,
                        featured.endDateTime,
                      )}
                    </p>
                  )}
                  {featured.shortLocation && (
                    <p className="flex items-center gap-3 text-body-lg text-white/86">
                      <Icon
                        name="map-pin"
                        className="h-5 w-5 shrink-0 text-sky-blue"
                      />
                      {featured.shortLocation}
                    </p>
                  )}
                </div>
                {featured.shortDescription && (
                  <p className="mt-5 max-w-lg text-body-lg text-white/72">
                    {featured.shortDescription}
                  </p>
                )}
                {typeof featured.spotsRemaining === "number" &&
                  featured.spotsRemaining > 0 && (
                    <p className="mt-5 flex items-center gap-2.5 text-body font-semibold text-white">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full bg-deep-orange"
                      />
                      {featured.spotsRemaining} of {featured.capacity} spots
                      left
                    </p>
                  )}
                <Link
                  href={`/events/${featured.slug?.current}`}
                  className="mt-7 inline-block rounded-[9px] bg-deep-orange px-8.5 py-4 text-body font-semibold text-deep-blue transition hover:bg-orange-hover"
                >
                  Register →
                </Link>
              </div>
            </div>
          </section>

          {/* Filters + grid — Off-White Tan */}
          <section className="bg-off-white-tan">
            <EventFilters items={filterItems}>
              {gridEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </EventFilters>
          </section>
        </>
      ) : (
        /* No upcoming sessions — Off-White Tan */
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-12">
            <h2 className="text-h2">{page?.emptyHeading}</h2>
            <p className="mx-auto mt-5 max-w-xl text-body-lg text-deep-blue-80">
              {page?.emptyText}
            </p>
            <div className="mx-auto mt-8 max-w-lg [&_button]:bg-deep-blue [&_button]:text-white [&_button:hover]:bg-[#123A5A]">
              <NewsletterForm />
            </div>
          </div>
        </section>
      )}

      {/* Past sessions — Deep Blue, deliberately quieter */}
      {past.length > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
            <h2 className="text-h3">{page?.pastHeading}</h2>
            <p className="mt-2 text-body text-white/55">{page?.pastIntro}</p>
            <div className="mt-8 border-t border-white/14">
              {past.map((event) => (
                <div
                  key={event._id}
                  className="grid gap-3 border-b border-white/14 py-5.5 md:grid-cols-[150px_1fr_auto_auto] md:items-center md:gap-6"
                >
                  <p className="text-body text-white/55">
                    {event.startDateTime ? pastDate(event.startDateTime) : ""}
                  </p>
                  <p className="text-h4">{event.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {event.categories?.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-white/28 px-2.5 py-1 text-[11.5px] font-semibold text-white/75"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-[150px] md:text-right">
                    {event.recap?.slug?.current ? (
                      <Link
                        href={`/insights/${event.recap.slug.current}`}
                        className="text-body font-semibold text-sky-blue hover:text-white"
                      >
                        Read the recap →
                      </Link>
                    ) : (
                      <span className="text-body text-white/30">No recap</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner data={page?.ctaBanner} />
    </>
  );
}
