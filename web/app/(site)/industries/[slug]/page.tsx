import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { INDUSTRY_QUERY, INDUSTRY_SLUGS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { PortableBody } from "@/components/modules/PortableBody";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(INDUSTRY_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await sanityFetch(INDUSTRY_QUERY, { slug });
  return {
    title: industry?.seo?.metaTitle ?? industry?.title ?? "Industry",
    description:
      industry?.seo?.metaDescription ?? industry?.shortDescription ?? undefined,
    alternates: { canonical: `/industries/${slug}` },
    ...(industry?.seo?.noIndex || !industry?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

// T7 — proof and testimonial sections drop entirely when their
// references are empty (designed-in droppable blocks).
export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await sanityFetch(INDUSTRY_QUERY, { slug });
  if (!industry) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/industries/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  return (
    <>
      {/* Hero — dark breadcrumb with industry badge (H1c) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/industries" className="text-sky-blue hover:underline">
              Industries
            </Link>{" "}
            › <span className="text-white/80">{industry.title}</span>
          </nav>
          <p className="mt-5 inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
            <Icon name={industry.icon} className="h-4 w-4" />
            {industry.title}
          </p>
          <h1 className="mt-5 max-w-3xl text-h1-mobile md:text-h1">
            <EmphasisedHeading
              heading={industry.hero?.heading ?? `HubSpot for ${industry.title}`}
              phrase={industry.hero?.emphasisPhrase}
              markerStyle={industry.hero?.markerStyle}
              color="deep-orange"
            />
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-white/70">
            {industry.hero?.subheading ?? industry.shortDescription}
          </p>
          <ButtonLink
            href={industry.hero?.primaryCta?.href ?? "/contact"}
            variant="orange"
            className="mt-8"
          >
            {industry.hero?.primaryCta?.label ?? "Book a free chat"}
          </ButtonLink>
        </div>
      </section>

      {/* Pain points (M20 — Sky Blue top borders on white per D4) */}
      {(industry.painPoints?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Sound familiar?
            </p>
            <h2 className="mt-3 max-w-xl text-h2">
              The problems {industry.title?.toLowerCase()} teams keep running
              into
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {industry.painPoints?.map((point) => (
                <div
                  key={point._key}
                  className="border-t-[3px] border-sky-blue pt-5"
                >
                  <h3 className="text-h4">{point.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How we fix it */}
      {(industry.howWeFixHeading || industry.howWeFixBody) && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              How we fix it
            </p>
            {industry.howWeFixHeading && (
              <h2 className="mt-3 text-h2">{industry.howWeFixHeading}</h2>
            )}
            <div className="mt-6">
              <PortableBody value={industry.howWeFixBody} />
            </div>
            {(industry.checklist?.length ?? 0) > 0 && (
              <ul className="mt-10 grid gap-4 md:grid-cols-3">
                {industry.checklist?.map((item) => (
                  <li key={item} className="flex gap-2.5 text-body font-medium">
                    <span aria-hidden className="text-deep-blue">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Proof (droppable) */}
      {industry.caseStudy && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="grid gap-10 overflow-hidden rounded-3xl bg-deep-blue text-white lg:grid-cols-[1.1fr_1fr]">
              <div className="p-10 lg:p-14">
                <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
                  {industry.title}
                </p>
                {industry.proofStat?.value && (
                  <p className="mt-6 text-6xl font-semibold tracking-heading text-deep-orange">
                    {industry.proofStat.value}
                  </p>
                )}
                <h2 className="mt-4 text-h3">
                  {industry.caseStudy.headline ?? industry.caseStudy.client}
                </h2>
                {industry.proofStat?.label && (
                  <p className="mt-2 text-body text-white/70">
                    {industry.proofStat.label}
                  </p>
                )}
                {industry.caseStudy.status !== "comingSoon" && (
                  <Link
                    href={`/our-work/${industry.caseStudy.slug?.current}`}
                    className="mt-6 inline-block text-body font-semibold text-deep-orange underline decoration-deep-orange decoration-2 underline-offset-4"
                  >
                    Read the {industry.caseStudy.client} story →
                  </Link>
                )}
              </div>
              <SanityImage
                image={industry.caseStudy.photo}
                width={520}
                height={400}
                className="h-64 w-full object-cover lg:h-full"
                placeholderLabel="Project photo"
              />
            </div>
          </div>
        </section>
      )}

      {/* Testimonial (droppable) */}
      {industry.testimonial?.quote && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <p aria-hidden className="text-6xl text-sky-blue">
              “
            </p>
            <blockquote className="text-h3 font-medium">
              {industry.testimonial.quote}
            </blockquote>
            <p className="mt-6 text-body font-semibold">
              {industry.testimonial.name}
            </p>
            <p className="text-caption text-deep-blue-80">
              {[industry.testimonial.role, industry.testimonial.company]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </section>
      )}

      {/* FAQ (M26) */}
      <FaqAccordion
        heading={`${industry.title}, answered`}
        faqs={industry.faqs}
        name={`industry-faq-${slug}`}
      />

      <CtaBanner data={industry.ctaBanner} />
    </>
  );
}
