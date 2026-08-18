import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { SERVICE_QUERY, SERVICE_SLUGS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { QuoteMark } from "@/components/ui/QuoteMark";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// Stage badge for the hero — the same three custom icons the services
// landing pills and the homepage stage cards use, keyed off the service's
// category. Unknown or missing categories render no badge rather than a
// wrong one.
const STAGE_BADGE: Record<string, { icon: string; label: string }> = {
  discover: { icon: "zl-stage-discover", label: "Discover" },
  build: { icon: "zl-stage-build", label: "Build" },
  scale: { icon: "zl-stage-scale", label: "Scale" },
};

export async function generateStaticParams() {
  const slugs = await client.fetch(SERVICE_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await sanityFetch(SERVICE_QUERY, { slug });
  return {
    title: service?.seo?.metaTitle ?? service?.title ?? "Service",
    description: service?.seo?.metaDescription ?? service?.shortDescription ?? undefined,
    alternates: { canonical: `/services/${slug}` },
    // An unbuilt page still holds placeholder copy, so it is noindexed the
    // same way an unbuilt industry is. follow stays true: the links out of
    // it are real, only the wording is not.
    ...(service?.seo?.noIndex || !service?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await sanityFetch(SERVICE_QUERY, { slug });
  if (!service) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/services/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  // The shared table wins; the inline block is only a fallback for services
  // not yet moved across.
  const pricingSource = service.pricingTable ?? service.pricing;
  const pricingConfirmed = Boolean(pricingSource?.confirmed);
  const tiers = pricingConfirmed ? (pricingSource?.tiers ?? []) : [];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url: `${SITE_URL}/services/${slug}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: ["NZ", "AU"],
    ...(pricingConfirmed && tiers.length > 0
      ? {
          // Only tiers with a real number. An Offer without a price is
          // invalid structured data and Google flags the whole block.
          offers: tiers
            .filter((tier) => !tier.custom && typeof tier.price === "number")
            .map((tier) => ({
              "@type": "Offer",
              name: tier.name,
              price: tier.price,
              priceCurrency: "NZD",
            })),
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Services", url: `${SITE_URL}/services` },
          { name: service.title ?? slug, url: `${SITE_URL}/services/${slug}` },
        ])}
      />
      {/* Hero — dark breadcrumb (H1c) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-24 sm:pb-20 sm:pt-32 text-center">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/services" className="text-sky-blue hover:underline">
              Services
            </Link>{" "}
            › <span className="text-white/80">{service.title}</span>
          </nav>
          {service.category && STAGE_BADGE[service.category] && (
            <p className="mt-6 inline-flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Icon
                  name={STAGE_BADGE[service.category].icon}
                  className="h-8 w-8"
                />
              </span>
              {STAGE_BADGE[service.category].label} stage
            </p>
          )}
          <h1 className="text-pretty mt-5 text-h1-mobile md:text-h1">
            <EmphasisedHeading
              heading={service.hero?.heading ?? service.title ?? ""}
              phrase={service.hero?.emphasisPhrase}
              markerStyle={service.hero?.markerStyle}
              color="deep-orange"
            />
          </h1>
          {(service.hero?.subheading ?? service.shortDescription) && (
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">
              {service.hero?.subheading ?? service.shortDescription}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {service.hero?.primaryCta?.href && (
              <ButtonLink href={service.hero.primaryCta.href} variant="orange">
                {service.hero.primaryCta.label}
              </ButtonLink>
            )}
            {service.hero?.secondaryCta?.href && (
              <ButtonLink
                href={service.hero.secondaryCta.href}
                variant="ghost-light"
              >
                {service.hero.secondaryCta.label}
              </ButtonLink>
            )}
          </div>
          {pricingConfirmed && service.heroMeta && (
            <p className="mt-6 text-caption text-white/55">{service.heroMeta}</p>
          )}
        </div>
      </section>

      {/* "Is this you?" pain points (M20) */}
      {(service.painPoints?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-center text-h2">Sound familiar?</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {service.painPoints?.map((point) => (
                <div
                  key={point._key}
                  className="rounded-xl bg-white p-7 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-deep-blue">
                    <Icon name={point.icon} className="h-5 w-5 text-sky-blue" />
                  </span>
                  <h3 className="mt-4 text-h4">{point.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">{point.text}</p>
                </div>
              ))}
            </div>
            {service.painPointsCloser && (
              <p className="mx-auto mt-10 max-w-xl text-center text-body-lg text-deep-blue-80">
                {service.painPointsCloser}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Process (M19 — Sky Blue top borders on white per D4) */}
      {(service.processSteps?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="max-w-lg text-h2">What&apos;s included, step by step</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {service.processSteps?.map((step, index) => (
                <div
                  key={step._key}
                  className="border-t-[3px] border-sky-blue pt-5"
                >
                  <p className="text-h2 text-sky-blue">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4">{step.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing (M18) — never renders tiers unless confirmed */}
      <section id="pricing" className="scroll-mt-24 bg-off-white-tan">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <h2 className="text-center text-h2">
            {pricingConfirmed ? "Honest, fixed pricing" : "Pricing"}
          </h2>
          {pricingConfirmed && tiers.length > 0 ? (
            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
              {tiers.map((tier) => {
                const featured = Boolean(tier.featured);
                return (
                  <div
                    key={tier._key}
                    className={`relative flex flex-col rounded-2xl p-8 ${
                      featured
                        ? "bg-deep-blue text-white shadow-xl"
                        : "border border-deep-blue-20 bg-white"
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-deep-orange px-4 py-1 text-caption font-semibold text-deep-blue">
                        Most teams pick this
                      </span>
                    )}
                    <h3 className="text-h3">{tier.name}</h3>
                    {tier.description && (
                      <p
                        className={`mt-1 text-body ${featured ? "text-white/70" : "text-deep-blue-80"}`}
                      >
                        {tier.description}
                      </p>
                    )}
                    <p className="mt-5 text-h2">
                      {/* An Enterprise tier is scoped per deal. Showing a
                          floor price here would be read as a list price. */}
                      {tier.custom || typeof tier.price !== "number"
                        ? "Custom"
                        : `$${tier.price.toLocaleString()}`}
                      <span
                        className={`ml-2 text-caption ${featured ? "text-white/60" : "text-deep-blue-80"}`}
                      >
                        {tier.custom ? "scoped per project" : tier.priceSuffix}
                      </span>
                    </p>
                    <ul
                      className={`mt-6 flex flex-1 flex-col gap-2.5 border-t pt-6 ${
                        featured ? "border-white/15" : "border-deep-blue-10"
                      }`}
                    >
                      {tier.features?.map((feature) => (
                        <li key={feature} className="flex gap-2.5 text-body">
                          <span
                            aria-hidden
                            className={featured ? "text-deep-orange" : "text-sky-blue"}
                          >
                            ✓
                          </span>
                          <span className={featured ? "text-white/85" : "text-deep-blue-80"}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <ButtonLink
                      href="/contact"
                      variant={featured ? "orange" : "navy-outline"}
                      className="mt-7 text-center"
                    >
                      {tier.ctaLabel ?? `Start with ${tier.name}`}
                    </ButtonLink>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-xl rounded-2xl border-2 border-dashed border-deep-blue-20 bg-white p-10 text-center">
              <h3 className="text-h3">
                {pricingSource?.fallbackText ?? "This one's scoped individually"}
              </h3>
              <p className="mt-3 text-body text-deep-blue-80">
                Every project gets a fixed, transparent quote up front — scoped
                to what your team actually needs.
              </p>
              <ButtonLink href="/contact" variant="navy" className="mt-6">
                Get a fixed quote
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {/* Proof / case study (M28 dark) */}
      {service.caseStudy && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                Proof it works
              </p>
              {service.proofStat?.value && (
                <p className="mt-4 text-6xl font-semibold tracking-heading text-deep-orange">
                  {service.proofStat.value}
                </p>
              )}
              <h2 className="mt-4 text-h3">
                {service.caseStudy.headline ?? service.caseStudy.client}
              </h2>
              {service.proofStat?.label && (
                <p className="mt-2 text-body text-white/70">
                  {service.proofStat.label}
                </p>
              )}
              {service.caseStudy.status !== "comingSoon" && (
                <Link
                  href={`/our-work/${service.caseStudy.slug?.current}`}
                  className="mt-6 inline-block text-body font-semibold text-deep-orange underline decoration-deep-orange decoration-2 underline-offset-4"
                >
                  Read the {service.caseStudy.client} story →
                </Link>
              )}
            </div>
            <SanityImage
              image={service.caseStudy.photo}
              width={520}
              height={380}
              className="h-64 w-full rounded-2xl object-cover lg:h-95"
              placeholderLabel="Project photo"
            />
          </div>
        </section>
      )}

      {/* Testimonial (M24 single) */}
      {service.testimonial?.quote && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:py-24 text-center">
            <QuoteMark className="mx-auto h-12 w-12" />
            <blockquote className="mt-8 text-h3 font-medium">
              {service.testimonial.quote}
            </blockquote>
            <p className="mt-6 text-body font-semibold">
              {service.testimonial.name}
            </p>
            <p className="text-caption text-deep-blue-80">
              {[service.testimonial.role, service.testimonial.company]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </section>
      )}

      {/* Related services (M17) */}
      {(service.relatedServices?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-h2">Often paired with</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {service.relatedServices?.map((related) => (
                <Link
                  key={related._id}
                  href={`/services/${related.slug?.current}`}
                  className="rounded-xl border border-deep-blue-20 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Icon name={related.icon} className="h-6 w-6 text-deep-blue" />
                  <h3 className="mt-4 text-h4">{related.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">
                    {related.shortDescription}
                  </p>
                  <p className="mt-4 text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4">
                    Learn more →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ (M26) */}
      <FaqAccordion
        heading="Before you book — the honest answers"
        faqs={service.faqs}
        name={`service-faq-${slug}`}
      />

      <CtaBanner data={service.ctaBanner} />
    </>
  );
}
