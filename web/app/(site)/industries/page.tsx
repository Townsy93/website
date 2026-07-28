import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { INDUSTRIES_HUB_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { CaseStudyCards } from "@/components/modules/CaseStudyCards";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(INDUSTRIES_HUB_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Industries",
    description: page?.seo?.metaDescription ?? "HubSpot, tailored to how your industry actually works.",
    alternates: { canonical: "/industries" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function IndustriesPage() {
  const page = await sanityFetch(INDUSTRIES_HUB_QUERY);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Industries content not found in Sanity.</p>
      </section>
    );
  }

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

      {/* Industry grid (M9) — 7 cards + "Not on the list?" cell */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
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
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.industries?.map((industry) => (
              <Link
                key={industry._id}
                // Always the industry page. The fallback to CRM Implementation
                // existed when these pages were empty; they now carry their
                // full structure, and pageBuilt still keeps unfinished copy
                // out of the sitemap and marks it noindex. Sending someone to
                // a different service instead is more confusing than useful.
                href={`/industries/${industry.slug?.current}`}
                className="flex flex-col rounded-xl border border-deep-blue-20 bg-white p-7 transition hover:-translate-y-0.5 hover:border-deep-blue hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-off-white-tan">
                  <Icon name={industry.icon} className="h-6 w-6 text-deep-blue" />
                </span>
                <h3 className="mt-4 text-h4">{industry.title}</h3>
                <p className="mt-2 flex-1 text-body text-deep-blue-80">
                  {industry.shortDescription}
                </p>
                <p className="mt-4 text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4">
                  Explore →
                </p>
              </Link>
            ))}
            <div className="flex flex-col justify-center rounded-xl bg-deep-blue p-7 text-center text-white">
              <h3 className="text-h4">Not on the list?</h3>
              <p className="mt-2 text-body text-white/70">
                We work across plenty more industries — these are just the ones
                we&apos;ve gone deepest on.
              </p>
              <Link
                href="/contact"
                className="mt-4 font-semibold text-deep-orange underline decoration-deep-orange decoration-2 underline-offset-4"
              >
                Talk to us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters (M22 — Deep Blue numerals on tan per D4) */}
      {(page.whyItems?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Why it matters
            </p>
            {page.whyHeading && (
              <h2 className="mt-3 max-w-xl text-h2">{page.whyHeading}</h2>
            )}
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {page.whyItems?.map((item, index) => (
                <div key={item._key}>
                  <p className="text-5xl font-semibold tracking-heading text-deep-blue">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-h4">{item.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Case studies (M10, tagged by industry per D11) */}
      {(page.caseStudies?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Our work
                </p>
                <h2 className="mt-3 text-h2">Industry expertise, proven</h2>
              </div>
              <Link
                href="/our-work"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                All case studies →
              </Link>
            </div>
            <div className="mt-10">
              <CaseStudyCards
                items={(page.caseStudies ?? []).map((caseStudy) => ({
                  ...caseStudy,
                  tag: caseStudy.industry?.title ?? null,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
