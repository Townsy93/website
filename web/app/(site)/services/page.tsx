import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { SERVICES_LANDING_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { LeafCorners } from "@/components/ui/LeafCorners";
import { QuoteMark } from "@/components/ui/QuoteMark";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { PartnerBand } from "@/components/modules/PartnerBand";
import {
  ServiceFilterGrid,
  type ServiceCardData,
} from "@/components/modules/ServiceFilterGrid";
import { StatTrio } from "@/components/modules/StatTrio";
import { ValuesBand } from "@/components/modules/ValuesBand";

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
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
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
      {/* Hero — dark split like the About page, per the designer's Aug 2026
          pass ("the hero section is really narrow... add a visual of a
          Zippily team member working"). Placeholder renders until the photo
          lands in Sanity. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-6 pb-12 pt-24 sm:pb-20 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                {page.hero.eyebrow}
              </p>
            )}
            <h1 className="text-pretty mt-4 text-h1-mobile md:text-h1">
              <EmphasisedHeading
                heading={page.hero?.heading ?? ""}
                phrase={page.hero?.emphasisPhrase}
                markerStyle={page.hero?.markerStyle}
                color="deep-orange"
              />
            </h1>
            {page.hero?.subheading && (
              <p className="mt-6 max-w-xl text-body-lg text-white/70">
                {page.hero.subheading}
              </p>
            )}
          </div>
          <SanityImage
            image={page.hero?.image}
            width={540}
            height={480}
            className="h-72 w-full rounded-2xl object-cover lg:h-110"
            placeholderLabel="Zippily team member at work"
          />
        </div>
      </section>

      {/* Service grid with filter pills (T2 / M7) — centred head, with the
          per-stage one-liner living inside the filter component. gridIntro is
          no longer rendered: the stage blurbs replaced its job. */}
      <section className="bg-white">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          {page.gridHeading && (
            <h2 className="text-center text-h2">{page.gridHeading}</h2>
          )}
          <div className="mt-10">
            <ServiceFilterGrid cards={cards} />
          </div>
        </div>
      </section>

      {/* Partner credential band — the shared component, added here per the
          designer's pass. */}
      <PartnerBand />

      {/* Why Zippily — the shared numbered values block, on tan per the
          mock so the page breaks up between the white sections. */}
      <ValuesBand
        heading={page.whyHeading}
        cards={page.whyCards}
        background="bg-off-white-tan"
      />

      {/* Case studies teaser (M10) */}
      {(page.caseStudies?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            {/* Centred head with the button under the grid, per the
                designer's pass. Solid orange on white is Sean's standing
                exception (the industries-button ruling, Aug 2026). */}
            <div className="text-center">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                Our work
              </p>
              <h2 className="mt-3 text-h2">These services, out in the wild</h2>
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
            <div className="mt-12 text-center">
              <ButtonLink href="/our-work" variant="orange">
                View all case studies
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* Stats (M21) */}
      <StatTrio stats={page.stats} />

      {/* The quote — brand speech-bubble mark and a decorative sprig, per
          the designer's pass ("this page is sparse with imagery"). The
          attribution is Deep Blue, not the mock's orange: orange text on
          light fails AA (~2.7:1) and this one Sean has not overridden. */}
      {page.testimonial?.quote && (
        // Flat stone colour + the extracted corner leaves (the real brand
        // asset, replacing the hand-drawn sprig) — bg-cover was cropping
        // the texture's saplings to slivers.
        <section className="relative overflow-hidden bg-[#F8F8F2]">
          <LeafCorners />
          <div className="relative mx-auto max-w-3xl px-6 py-14 sm:py-24 text-center">
            <QuoteMark className="mx-auto h-14 w-14" />
            <blockquote className="mt-8 text-body-lg leading-relaxed text-deep-blue md:text-h4 md:font-normal">
              &ldquo;{page.testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-8 text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue">
              {[page.testimonial.name, page.testimonial.company]
                .filter(Boolean)
                .join(" — ")}
            </p>
          </div>
        </section>
      )}

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
