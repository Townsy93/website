import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { SERVICE_QUERY, TRUST_LOGOS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { LeafCorners } from "@/components/ui/LeafCorners";
import { QuoteMark } from "@/components/ui/QuoteMark";
import { SanityImage } from "@/components/ui/SanityImage";
import { CaseFeature } from "@/components/modules/CaseFeature";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { LogoTicker } from "@/components/modules/LogoTicker";
import { formatDate } from "@/components/modules/postCard";
import { PricingSection } from "@/components/modules/PricingSection";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const SLUG = "revops-retainers";

export async function generateMetadata(): Promise<Metadata> {
  const service = await sanityFetch(SERVICE_QUERY, { slug: SLUG });
  return {
    title: service?.seo?.metaTitle ?? service?.title ?? "RevOps retainers",
    description:
      service?.seo?.metaDescription ?? service?.shortDescription ?? undefined,
    alternates: { canonical: `/services/${SLUG}` },
    ...(service?.seo?.noIndex || !service?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

/** Plain-text paragraphs: blank line = new paragraph. */
function paragraphs(text?: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// The bespoke RevOps retainers page — the designer's Sep 2026 mock. A static
// route, which Next prefers over the [slug] template, so this one service
// gets its own layout ("styled similarly to the homepage... differently from
// the other service pages to drive more interest and traffic to it").
// Differences from the template: homepage-style split hero with the client
// logo ticker, a centred intro with two images, the "Why retainers?" benefits
// band, the process section on stone (the designer's "too many blue
// sections" note), and a retainer-worded case study feature in place of the
// photo CTA.
export default async function RetainersPage() {
  const [service, trustLogos] = await Promise.all([
    sanityFetch(SERVICE_QUERY, { slug: SLUG }),
    sanityFetch(TRUST_LOGOS_QUERY),
  ]);
  if (!service) {
    return (
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Retainer content not found in Sanity.</p>
      </section>
    );
  }

  const pricingSource = service.pricingTable ?? service.pricing;
  const pricingConfirmed = Boolean(pricingSource?.confirmed);
  const tiers = pricingConfirmed ? (pricingSource?.tiers ?? []) : [];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url: `${SITE_URL}/services/${SLUG}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: ["NZ", "AU"],
    ...(pricingConfirmed && tiers.length > 0
      ? {
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
          { name: service.title ?? SLUG, url: `${SITE_URL}/services/${SLUG}` },
        ])}
      />
      {/* Hero — homepage-style dark split, with the client logo ticker
          riding along the bottom of the section. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-[90rem] px-6 pb-2 pt-20 sm:pt-28">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/services" className="text-sky-blue hover:underline">
              Services
            </Link>{" "}
            › <span className="text-white/80">{service.title}</span>
          </nav>
          <div className="grid items-center gap-14 pb-12 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="text-pretty text-h1-mobile md:text-h1">
                {service.hero?.heading ?? service.title}
              </h1>
              {(service.hero?.subheading ?? service.shortDescription) && (
                <p className="mt-6 max-w-xl text-body-lg text-white/70">
                  {service.hero?.subheading ?? service.shortDescription}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {service.hero?.primaryCta?.href && (
                  <ButtonLink
                    href={service.hero.primaryCta.href}
                    variant="orange"
                  >
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
            </div>
            <SanityImage
              image={service.hero?.image}
              width={540}
              height={420}
              className="h-64 w-full rounded-2xl object-cover lg:h-96"
              placeholderLabel="Zippily × client photo"
            />
          </div>
          <div className="flex items-center pb-12">
            <LogoTicker logos={trustLogos} />
          </div>
        </div>
      </section>

      {/* Intro — centred with two images, unlike the template's split. The
          heading is Deep Blue, not the mock's orange (AA, not overridden). */}
      {service.introBody && (
        <section className="relative overflow-hidden bg-white">
          <Image
            src="/leaf-bottom-right.png"
            alt=""
            aria-hidden
            width={510}
            height={404}
            className="pointer-events-none absolute -right-8 top-24 hidden w-48 select-none lg:block"
          />
          <div className="relative mx-auto max-w-4xl px-6 py-14 sm:py-24 text-center">
            {service.introHeading && (
              <h2 className="text-pretty text-h2 text-deep-blue">
                {service.introHeading}
              </h2>
            )}
            <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-4 text-body text-deep-blue-80">
              {paragraphs(service.introBody).map((part) => (
                <p key={part.slice(0, 40)}>{part}</p>
              ))}
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <SanityImage
                image={service.introImage}
                width={520}
                height={340}
                className="h-56 w-full rounded-2xl object-cover sm:h-64"
                placeholderLabel="Zippily at work"
              />
              <SanityImage
                image={service.introImageSecond}
                width={520}
                height={340}
                className="h-56 w-full rounded-2xl object-cover sm:h-64"
                placeholderLabel="Zippily at work"
              />
            </div>
          </div>
        </section>
      )}

      {/* Pain points — same treatment as the template. */}
      {(service.painPoints?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-center text-h2">Sound familiar?</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {service.painPoints?.map((point) => (
                <div key={point._key} className="rounded-xl bg-white p-7 shadow-sm">
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
            <div className="mt-10 text-center">
              <ButtonLink
                href={service.hero?.primaryCta?.href ?? "/contact"}
                variant="orange"
              >
                {service.hero?.primaryCta?.label ?? "Book a free chat"}
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* Why retainers — the designer's benefits band: Deep Blue, split
          head, four numbered columns like the values block. */}
      {(service.benefits?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
                  Why retainers?
                </p>
                {service.benefitsHeading && (
                  <h2 className="mt-3 text-h2">{service.benefitsHeading}</h2>
                )}
              </div>
              {service.benefitsIntro && (
                <p className="text-body-lg text-white/70 lg:self-end">
                  {service.benefitsIntro}
                </p>
              )}
            </div>
            <div className="mt-14 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits?.map((benefit, index) => (
                <div
                  key={benefit._key}
                  className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:px-7 lg:pt-0 lg:first:border-l-0 lg:first:pl-0"
                >
                  <p className="text-h3 font-semibold text-sky-blue">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4">{benefit.heading}</h3>
                  <p className="mt-3 text-body text-white/75">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing — the shared section (white). */}
      <PricingSection
        pricingTable={service.pricingTable}
        pricing={service.pricing}
      />

      {/* Process — on stone for this page only, per the designer: "there
          are too many blue sections". Numerals Deep Blue on the light
          ground (orange here would fail AA and is not overridden). */}
      {(service.processSteps?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <div className="flex items-center gap-6">
              <h2 className="shrink-0 text-h2 text-deep-blue">
                What&apos;s included, step by step
              </h2>
              <div aria-hidden className="h-px flex-1 bg-deep-blue/15" />
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.processSteps?.map((step, index) => (
                <div
                  key={step._key}
                  className="rounded-2xl border border-deep-blue/20 bg-white p-7"
                >
                  <p className="text-h3 font-semibold text-deep-blue">
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

      {/* Testimonial — hidden when none; the designer's rule also says the
          quote must come from a different client than the case study below. */}
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

      {/* Case study feature — retainer-worded, per the designer ("the
          messaging focuses on retainers"). Replaces the template's photo
          CTA as the route onward. */}
      {service.caseStudy && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 pb-14 sm:pb-24">
            <CaseFeature
              eyebrow="Proof in our promise"
              heading={
                service.proofHeading ??
                "What a retainer actually looks like in practice"
              }
              body={service.proofBody}
              stats={service.caseStudy.stats}
              href={
                service.caseStudy.status !== "comingSoon" &&
                service.caseStudy.slug?.current
                  ? `/our-work/${service.caseStudy.slug.current}`
                  : null
              }
              buttonLabel="View case study"
              image={service.caseStudy.photo}
              imageLabel={`${service.caseStudy.client} — project photo`}
            />
          </div>
        </section>
      )}

      {/* Helpful resources — same treatment as the template. */}
      {(service.relatedPosts?.length ?? 0) > 0 && (
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

      {/* FAQ — split layout per the mock, homepage wording. */}
      <FaqAccordion
        heading="Things people usually ask us"
        faqs={service.faqs}
        name={`service-faq-${SLUG}`}
        layout="split"
      />

      <CtaBanner data={service.ctaBanner} />
    </>
  );
}
