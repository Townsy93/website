import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { HUB_OFFERINGS_QUERY, SOLUTIONS_PAGE_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { HubCarousel } from "@/components/modules/HubCarousel";

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

      {/* Hub carousel (M12) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <div className="max-w-xl">
            {page.carouselHeading && (
              <h2 className="text-h2">{page.carouselHeading}</h2>
            )}
            {page.carouselIntro && (
              <p className="mt-3 text-body-lg text-deep-blue-80">
                {page.carouselIntro}
              </p>
            )}
          </div>
          <div className="mt-8">
            <HubCarousel hubs={hubs} />
          </div>
          <p className="mt-8 text-center text-body text-deep-blue-80">
            Looking for phone?{" "}
            <Link
              href="/platforms/aircall"
              className="font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
            >
              Aircall has its own page →
            </Link>
          </p>
        </div>
      </section>

      {/* How we optimise */}
      <section id="optimise" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <div className="max-w-xl">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Already have HubSpot?
            </p>
            {page.optimiseHeading && (
              <h2 className="mt-3 text-h2">{page.optimiseHeading}</h2>
            )}
            {page.optimiseIntro && (
              <p className="mt-4 text-body-lg text-deep-blue-80">
                {page.optimiseIntro}
              </p>
            )}
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {page.optimiseCards?.map((card) => (
              <div key={card._key}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-off-white-tan">
                  <Icon name={card.icon} className="h-5 w-5 text-deep-blue" />
                </span>
                <h3 className="mt-4 text-h4">{card.title}</h3>
                <p className="mt-2 text-body text-deep-blue-80">{card.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/services/hubspot-audit"
              className="inline-block rounded-full bg-deep-blue px-6 py-3 text-body font-semibold text-white transition hover:bg-deep-blue/90"
            >
              Start with a HubSpot audit →
            </Link>
          </div>
        </div>
      </section>

      {/* Related case study */}
      {page.relatedCaseStudy && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Hubs, working together
            </p>
            <div className="mt-6 grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-[1fr_1.1fr]">
              <SanityImage
                image={page.relatedCaseStudy.photo}
                width={560}
                height={340}
                className="h-64 w-full object-cover lg:h-full"
                placeholderLabel={`${page.relatedCaseStudy.client} — project photo`}
              />
              <div className="p-10">
                <h3 className="text-h3">{page.relatedCaseStudy.headline}</h3>
                <p className="mt-3 text-body-lg text-deep-blue-80">
                  {page.relatedCaseStudy.resultLine}
                </p>
                {page.relatedCaseStudy.status !== "comingSoon" && (
                  <Link
                    href={`/our-work/${page.relatedCaseStudy.slug?.current}`}
                    className="mt-6 inline-block text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
                  >
                    Read the full story →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
