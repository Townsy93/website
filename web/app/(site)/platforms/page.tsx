import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { HUB_OFFERINGS_QUERY, SOLUTIONS_PAGE_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { LeafCorners } from "@/components/ui/LeafCorners";
import { SanityImage } from "@/components/ui/SanityImage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CaseFeature } from "@/components/modules/CaseFeature";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { PartnerBand } from "@/components/modules/PartnerBand";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(SOLUTIONS_PAGE_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Platforms",
    description: page?.seo?.metaDescription ?? "Not sure which HubSpot Hub fits your team? Here's what each one actually does.",
    alternates: { canonical: "/platforms" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Plain-text paragraphs: blank line = new paragraph. */
function paragraphs(text?: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// Platforms v2 — the designer's Sep 2026 mock: the hub carousel becomes a
// static four-column grid, plus new Why-HubSpot and partner-band sections
// and an Aircall feature. Headings the mock set orange-on-white are Deep
// Blue (the standing AA ruling).
export default async function PlatformsPage() {
  const [page, hubs] = await Promise.all([
    sanityFetch(SOLUTIONS_PAGE_QUERY),
    sanityFetch(HUB_OFFERINGS_QUERY),
  ]);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Platforms content not found in Sanity.</p>
      </section>
    );
  }

  return (
    <>
      {/* Hero — dark centred (H1a) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-24 sm:pb-20 sm:pt-32 text-center">
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
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">
              {page.hero.subheading}
            </p>
          )}
          <p className="mt-4 text-body text-white/60">
            Already have HubSpot?{" "}
            <a
              href="#optimise"
              className="font-semibold text-sky-blue underline underline-offset-4"
            >
              How we optimise Hubs you already own
            </a>
          </p>
        </div>
      </section>

      {/* Hub grid — the carousel became a static four-column grid per the
          mock. Cards keep their service links: the hero promises "each
          linked to the Zippily service that puts it to work", which is the
          thing a plain description page (the designer's reference) lacks.
          The featured card (Claude) inverts to Deep Blue with the orange
          tile — orange on Deep Blue is the permitted pairing. */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            {page.carouselHeading && (
              <h2 className="text-h2">{page.carouselHeading}</h2>
            )}
            {page.carouselIntro && (
              <p className="mt-3 text-body-lg text-deep-blue-80">
                {page.carouselIntro}
              </p>
            )}
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((hub) => {
              const featured = Boolean(hub.isFeatured);
              return (
                <div
                  key={hub._id}
                  className={`flex flex-col rounded-2xl p-7 ${
                    featured
                      ? "bg-deep-blue text-white shadow-xl"
                      : "bg-white shadow-sm"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      featured ? "bg-deep-orange" : "bg-deep-blue"
                    }`}
                  >
                    <Icon
                      name={hub.icon}
                      className={`h-5 w-5 ${featured ? "text-deep-blue" : "text-sky-blue"}`}
                    />
                  </span>
                  <p
                    className={`mt-5 text-caption font-semibold uppercase tracking-[0.14em] ${
                      featured ? "text-deep-orange" : "text-deep-blue-80"
                    }`}
                  >
                    {hub.eyebrow}
                  </p>
                  <h3 className="mt-2 text-h4">{hub.name}</h3>
                  <p
                    className={`mt-2 flex-1 text-body ${
                      featured ? "text-white/75" : "text-deep-blue-80"
                    }`}
                  >
                    {hub.description}
                  </p>
                  {hub.linkedService?.slug?.current && (
                    <Link
                      href={`/services/${hub.linkedService.slug.current}`}
                      className={`mt-5 text-body font-semibold underline decoration-2 underline-offset-4 ${
                        featured
                          ? "text-deep-orange decoration-deep-orange"
                          : "decoration-sky-blue"
                      }`}
                    >
                      {hub.linkedService.title} →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-10 text-center text-body text-deep-blue-80">
            Looking for phone? Aircall has its own section below — or{" "}
            <Link
              href="/platforms/aircall"
              className="font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
            >
              jump straight to it →
            </Link>
          </p>
        </div>
      </section>

      {/* Already have HubSpot — heading and audit CTA up top, then the
          three numbered steps as outlined cards per the mock. Numerals are
          Sky Blue like every numbered block on light ground (the mock's
          orange fails AA and is not overridden). */}
      <section id="optimise" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-h2">Already have HubSpot</h2>
              {page.optimiseHeading && (
                <p className="mt-3 max-w-xl text-body-lg text-deep-blue-80">
                  {page.optimiseHeading}
                </p>
              )}
            </div>
            <ButtonLink href="/services/hubspot-audit" variant="orange">
              Get a HubSpot audit
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {page.optimiseCards?.map((card, index) => (
              <div
                key={card._key}
                className="rounded-2xl border border-deep-blue/20 p-7"
              >
                <p className="text-h3 font-semibold text-sky-blue">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-h4">{card.title}</h3>
                <p className="mt-2 text-body text-deep-blue-80">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HubSpot CRM — new per the designer ("based on the Concentrate
          website", copy in the Zippily voice). Deep Blue split: prose left,
          the platform-is points as outlined rows right. */}
      {(page.whyPoints?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-h2">{page.whyHeading ?? "Why HubSpot CRM"}</h2>
              <div className="mt-6 flex max-w-xl flex-col gap-4 text-body text-white/75">
                {paragraphs(page.whyBody).map((part) => (
                  <p key={part.slice(0, 40)}>{part}</p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-h4">HubSpot&apos;s CRM platform is:</h3>
              <div className="mt-5 flex flex-col gap-4">
                {page.whyPoints?.map((point) => (
                  <div
                    key={point._key}
                    className="rounded-xl border border-white/25 px-6 py-5"
                  >
                    <p className="text-body-lg font-semibold">{point.title}</p>
                    <p className="mt-1 text-body text-white/70">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why work with a HubSpot partner — the large partner band, copy in
          the Zippily voice per the designer's note. */}
      <PartnerBand
        heading="Why work with a HubSpot partner?"
        text="A good partner shortens the road. We don't just switch HubSpot on — we set it up around how your team actually works, train the people who'll live in it, and stick around to make sure it keeps earning its keep."
        button={{ label: "Book a free chat", href: "/contact" }}
      />

      {/* Related case study — the shared feature card, on stone with the
          corner saplings. */}
      {page.relatedCaseStudy && (
        <section className="relative overflow-hidden bg-[#F8F8F2]">
          <LeafCorners />
          <div className="relative mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <CaseFeature
              eyebrow={`Case study · ${page.relatedCaseStudy.client}`}
              heading={page.relatedCaseStudy.headline}
              stats={page.relatedCaseStudy.stats}
              href={
                page.relatedCaseStudy.status !== "comingSoon" &&
                page.relatedCaseStudy.slug?.current
                  ? `/our-work/${page.relatedCaseStudy.slug.current}`
                  : null
              }
              image={page.relatedCaseStudy.photo}
              imageLabel={`${page.relatedCaseStudy.client} — project photo`}
            />
          </div>
        </section>
      )}

      {/* Aircall — image beside text; heading Deep Blue, not the mock's
          orange (AA, not overridden). */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <SanityImage
            image={page.aircall?.image}
            width={520}
            height={440}
            className="h-72 w-full rounded-2xl object-cover lg:h-100"
            placeholderLabel="Aircall platform image"
          />
          <div>
            <h2 className="text-pretty text-h2 text-deep-blue">
              Aircall and HubSpot, properly connected.
            </h2>
            <p className="mt-5 max-w-xl text-body-lg font-medium text-deep-blue">
              Every call logged, routed, and reported automatically — set up by
              your APAC Aircall implementation partner.
            </p>
            {page.aircall?.shortDescription && (
              <p className="mt-4 max-w-xl text-body text-deep-blue-80">
                {page.aircall.shortDescription}
              </p>
            )}
            <ButtonLink
              href="/platforms/aircall"
              variant="orange"
              className="mt-8"
            >
              View details
            </ButtonLink>
          </div>
        </div>
      </section>

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
