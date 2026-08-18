import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { OUR_WORK_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { CaseStudyCards } from "@/components/modules/CaseStudyCards";
import { StatTrio } from "@/components/modules/StatTrio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(OUR_WORK_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Our Work",
    description: page?.seo?.metaDescription ?? "Real businesses, real before-and-afters — case studies and reviews from NZ & AU clients.",
    alternates: { canonical: "/our-work" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function OurWorkPage() {
  const page = await sanityFetch(OUR_WORK_QUERY);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Our Work content not found in Sanity.</p>
      </section>
    );
  }

  const videoTestimonials = (page.videoTestimonials ?? []).filter(
    (t) => t.videoUrl,
  );
  const googleReviews = page.googleReviews ?? [];

  return (
    <>
      {/* Hero — light split (H1d). Marker Sky Blue on light. */}
      <section className="bg-off-white-tan">
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-6 pb-12 pt-24 sm:pb-20 sm:pt-32 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                {page.hero.eyebrow}
              </p>
            )}
            <h1 className="mt-4 text-h1-mobile md:text-h1">
              <EmphasisedHeading
                heading={page.hero?.heading ?? ""}
                phrase={page.hero?.emphasisPhrase}
                markerStyle={page.hero?.markerStyle}
                color="sky-blue"
              />
            </h1>
            {page.hero?.subheading && (
              <p className="mt-6 max-w-lg text-body-lg text-deep-blue-80">
                {page.hero.subheading}
              </p>
            )}
            {page.hero?.primaryCta?.href && (
              <ButtonLink
                href={page.hero.primaryCta.href}
                variant="navy"
                className="mt-8"
              >
                {page.hero.primaryCta.label} →
              </ButtonLink>
            )}
          </div>
          <SanityImage
            image={page.hero?.image}
            width={440}
            height={550}
            className="h-80 w-full rounded-2xl object-cover shadow-lg lg:h-130"
            placeholderLabel="Team photo"
          />
        </div>
      </section>

      {/* Stat bar (M21) */}
      <StatTrio stats={page.stats} />

      {/* Case study grid (M10, tagged by service) */}
      {(page.caseStudies?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Case studies
            </p>
            <h2 className="mt-3 max-w-xl text-h2">
              Real businesses, real before-and-afters
            </h2>
            <div className="mt-10">
              <CaseStudyCards
                items={(page.caseStudies ?? []).map((caseStudy) => ({
                  ...caseStudy,
                  tag: caseStudy.service?.title ?? null,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Video testimonials (M15) — renders once videos exist */}
      {videoTestimonials.length > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
              In their words
            </p>
            <h2 className="mt-3 text-h2">
              Don&apos;t take our word for it — take theirs
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {videoTestimonials.map((t) => (
                <a
                  key={t._id}
                  href={t.videoUrl ?? "#"}
                  className="group rounded-xl border border-white/15 p-6 transition hover:-translate-y-0.5"
                >
                  <div className="relative">
                    <SanityImage
                      image={t.videoStill}
                      width={360}
                      height={200}
                      className="h-44 w-full rounded-lg object-cover"
                      placeholderLabel="Video still"
                    />
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-deep-orange/95 text-white transition group-hover:scale-105"
                    >
                      ▶
                    </span>
                  </div>
                  <p className="mt-4 text-body">“{t.quote}”</p>
                  <p className="mt-3 text-caption text-sky-blue">
                    {t.name} · {t.company}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Google reviews (M14) — renders once review testimonials exist */}
      {googleReviews.length > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-h2">Google reviews</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {googleReviews.map((review) => (
                <figure
                  key={review._id}
                  className="rounded-xl bg-white p-7 shadow-sm"
                >
                  <p className="text-body text-deep-orange">
                    <span aria-hidden>★★★★★</span>
                    {/* The stars carry the rating visually; without this a
                        screen reader gets the quote and no rating at all. */}
                    <span className="sr-only">Rated 5 out of 5</span>
                  </p>
                  <blockquote className="mt-3 text-body text-deep-blue-80">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-blue text-body font-semibold text-white">
                      {review.name?.[0]}
                    </span>
                    <span>
                      <span className="block text-body font-semibold">
                        {review.name}
                      </span>
                      <span className="block text-caption text-deep-blue-80">
                        {review.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {page.googleReviewsUrl && (
              <p className="mt-8">
                <a
                  href={page.googleReviewsUrl}
                  className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
                >
                  Read all reviews on Google →
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
