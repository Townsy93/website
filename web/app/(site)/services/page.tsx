import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { SERVICES_LANDING_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { IconCards } from "@/components/modules/IconCards";
import {
  ServiceFilterGrid,
  type ServiceCardData,
} from "@/components/modules/ServiceFilterGrid";
import { StatTrio } from "@/components/modules/StatTrio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(SERVICES_LANDING_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Services",
    description: page?.seo?.metaDescription ?? "Ten ways we help you get more out of HubSpot — pick where you're starting from.",
    alternates: { canonical: "/services" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ServicesPage() {
  const page = await sanityFetch(SERVICES_LANDING_QUERY);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">
          Services landing content not found in Sanity.
        </p>
      </section>
    );
  }

  const cards: ServiceCardData[] = (page.serviceCards ?? [])
    .filter((card) => card.service?.slug?.current)
    .map((card) => ({
      key: card._key,
      title: card.titleOverride ?? card.service?.title ?? "",
      description:
        card.descriptionOverride ?? card.service?.shortDescription ?? "",
      whoItsFor: card.service?.whoItsFor,
      icon: card.service?.icon,
      category: card.categoryOverride ?? card.service?.category ?? "build",
      href: `/services/${card.service?.slug?.current}${
        card.anchor ? `#${card.anchor}` : ""
      }`,
    }));

  return (
    <>
      {/* Hero — dark centred (H1a) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 text-center sm:px-6">
          {page.hero?.eyebrow && (
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
              {page.hero.eyebrow}
            </p>
          )}
          <h1 className="mt-4 text-h1-mobile md:text-h1">
            <EmphasisedHeading
              heading={page.hero?.heading ?? ""}
              phrase={page.hero?.emphasisPhrase}
              markerStyle={page.hero?.markerStyle}
              color="deep-orange"
            />
          </h1>
          {page.hero?.subheading && (
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">
              {page.hero.subheading}
            </p>
          )}
        </div>
      </section>

      {/* Service grid with filter pills (T2 / M7) */}
      <section className="bg-white">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            {page.gridHeading && (
              <h2 className="max-w-md text-h2">{page.gridHeading}</h2>
            )}
            {page.gridIntro && (
              <p className="max-w-sm text-body text-deep-blue-80">
                {page.gridIntro}
              </p>
            )}
          </div>
          <div className="mt-10">
            <ServiceFilterGrid cards={cards} />
          </div>
        </div>
      </section>

      {/* Why Zippily (M6) */}
      <IconCards
        eyebrow="Why zippily"
        heading={page.whyHeading}
        cards={page.whyCards}
        columns={4}
      />

      {/* Case studies teaser (M10) */}
      {(page.caseStudies?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Our work
                </p>
                <h2 className="mt-3 text-h2">
                  These services, out in the wild
                </h2>
              </div>
              <Link
                href="/our-work"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                All case studies →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {page.caseStudies?.map((caseStudy) => {
                const comingSoon = caseStudy.status === "comingSoon";
                const inner = (
                  <>
                    <div className="relative">
                      <SanityImage
                        image={caseStudy.photo}
                        width={400}
                        height={210}
                        className="h-48 w-full object-cover"
                        placeholderLabel={
                          comingSoon ? "Story coming soon" : "Project photo"
                        }
                      />
                      {caseStudy.service?.title && (
                        <span
                          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-caption font-semibold ${
                            comingSoon
                              ? "bg-deep-blue/10 text-deep-blue"
                              : "bg-deep-blue text-white"
                          }`}
                        >
                          {caseStudy.service.title}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-h4">{caseStudy.client}</h3>
                      <p className="mt-2 text-body text-deep-blue-80">
                        {caseStudy.resultLine}
                      </p>
                      <p className="mt-4 text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                        {comingSoon ? "Story coming soon" : "Read the story →"}
                      </p>
                    </div>
                  </>
                );
                const cardClass =
                  "overflow-hidden rounded-xl border border-deep-blue-10 bg-white shadow-sm";
                return comingSoon ? (
                  <div key={caseStudy._id} className={`${cardClass} opacity-90`}>
                    {inner}
                  </div>
                ) : (
                  <Link
                    key={caseStudy._id}
                    href={`/our-work/${caseStudy.slug?.current}`}
                    className={`${cardClass} transition hover:-translate-y-0.5 hover:shadow-lg`}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats (M21) */}
      <StatTrio stats={page.stats} />

      {/* FAQ (M26) */}
      <FaqAccordion
        heading="Questions people ask before working with us"
        faqs={page.faqs}
        name="services-faq"
      />

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
