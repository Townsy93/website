import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import {
  SERVICE_QUERY,
  SERVICE_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { QuoteMark } from "@/components/ui/QuoteMark";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { formatDate } from "@/components/modules/postCard";
import { LeafCorners } from "@/components/ui/LeafCorners";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

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
  const [service, settings] = await Promise.all([
    sanityFetch(SERVICE_QUERY, { slug }),
    sanityFetch(SITE_SETTINGS_QUERY),
  ]);
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
      {/* Hero — breadcrumb left-aligned like the case study page (the
          designer's consistency note), stage badge removed ("the category
          becomes confusing"), content centred. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-[90rem] px-6 pb-12 pt-20 sm:pb-20 sm:pt-28">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/services" className="text-sky-blue hover:underline">
              Services
            </Link>{" "}
            › <span className="text-white/80">{service.title}</span>
          </nav>
          <div className="mx-auto max-w-4xl pt-6 text-center">
            <h1 className="text-pretty text-h1-mobile md:text-h1">
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
              <p className="mt-6 text-caption text-white/55">
                {service.heroMeta}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Service intro — image beside text, per the designer's pass ("a
          small intro into the service before jumping into pain points").
          The eyebrow is Deep Blue caps, not the mock's orange: orange text
          on white fails AA and Sean has not overridden this spot. */}
      {service.introBody && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
            <SanityImage
              image={service.introImage}
              width={520}
              height={440}
              className="h-72 w-full rounded-2xl object-cover lg:h-100"
              placeholderLabel="Client + Zippily photo"
            />
            <div>
              {service.introEyebrow && (
                <p className="text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue-80">
                  {service.introEyebrow}
                </p>
              )}
              {service.introHeading && (
                <h2 className="mt-3 text-h2 text-deep-blue">
                  {service.introHeading}
                </h2>
              )}
              <div className="mt-6 flex max-w-xl flex-col gap-4 text-body text-deep-blue-80">
                {service.introBody
                  .split(/\n\s*\n/)
                  .map((part) => part.trim())
                  .filter(Boolean)
                  .map((part) => (
                    <p key={part.slice(0, 40)}>{part}</p>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
            {/* Straight to the scoping chat while the pain is fresh — the
                designer's pass puts a solid CTA under the cards. */}
            <div className="mt-10 text-center">
              <ButtonLink
                href={service.hero?.primaryCta?.href ?? "/contact"}
                variant="orange"
              >
                {service.hero?.primaryCta?.label ?? "Book a free scoping chat"}
              </ButtonLink>
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
            // Two tiers in a three-column grid leave an empty third column
            // and the pair sits left of the centred heading — so the column
            // count follows the tier count, capped at three.
            <div
              className={`mx-auto mt-12 grid items-stretch gap-6 ${
                tiers.length >= 3
                  ? "md:grid-cols-3"
                  : tiers.length === 2
                    ? "max-w-4xl md:grid-cols-2"
                    : "max-w-md"
              }`}
            >
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

      {/* Process — Deep Blue with outlined step cards and orange numerals,
          per the designer's pass; orange on Deep Blue is the permitted
          pairing. */}
      {(service.processSteps?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <div className="flex items-center gap-6">
              <h2 className="shrink-0 text-h2">
                What&apos;s included, step by step
              </h2>
              <div aria-hidden className="h-px flex-1 bg-white/20" />
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.processSteps?.map((step, index) => (
                <div
                  key={step._key}
                  className="rounded-2xl border border-white/25 p-7"
                >
                  <p className="text-h3 font-semibold text-deep-orange">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4">{step.title}</h3>
                  <p className="mt-2 text-body text-white/75">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial — the case-study quote treatment; hidden when no
          testimonial exists (the designer's rule). Attribution Deep Blue,
          not the mock's orange (AA, not overridden here). */}
      {service.testimonial?.quote && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:py-24 text-center">
            <QuoteMark className="mx-auto h-14 w-14" />
            <blockquote className="mt-8 text-body-lg leading-relaxed text-deep-blue md:text-h4 md:font-normal">
              &ldquo;{service.testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-8 text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue">
              {[service.testimonial.name, service.testimonial.company]
                .filter(Boolean)
                .join(" — ")}
            </p>
          </div>
        </section>
      )}

      {/* Photo CTA — the route back out to the catalogue, over the shared
          photo from Site settings (plain Deep Blue until it lands). The
          designer's pass: "a way to link to the services main page again...
          more personalised and less AI vibes". */}
      <section className="relative overflow-hidden bg-deep-blue text-white">
        {settings?.serviceCtaImage && (
          <>
            <SanityImage
              image={settings.serviceCtaImage}
              width={1920}
              height={560}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-deep-blue/70" />
          </>
        )}
        <div className="relative mx-auto max-w-[90rem] px-6 py-20 sm:py-28">
          <h2 className="max-w-xl text-h2">
            One of ten ways we get teams more from HubSpot.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/services" variant="orange">
              View more services
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost-light">
              Work with us
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Helpful resources — related posts picked in Studio; hidden when
          none are set. Cards match the homepage blog teaser. */}
      {(service.relatedPosts?.length ?? 0) > 0 && (
        // Flat stone colour + the extracted corner leaves instead of the
        // full texture — bg-cover was cropping the saplings to slivers.
        <section className="relative overflow-hidden bg-[#F8F8F2]">
          <LeafCorners />
          <div className="relative mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-center text-h2">Helpful resources</h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {service.relatedPosts?.map((post) => (
                <Link
                  key={post._id}
                  href={`/insights/${post.slug?.current}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <SanityImage
                    image={post.coverImage}
                    width={560}
                    height={245}
                    className="h-52 w-full object-cover"
                    placeholderLabel="Post image"
                  />
                  <div className="p-7">
                    <p className="text-caption text-deep-blue-80">
                      {formatDate(post.publishedAt)} · {post.readTime} min read
                    </p>
                    <h3 className="mt-2 text-h4">{post.title}</h3>
                    {post.excerpt && (
                      <p className="mt-3 text-body text-deep-blue-80">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
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
