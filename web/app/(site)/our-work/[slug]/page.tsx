import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SanityImage } from "@/components/ui/SanityImage";
import { PortableBody } from "@/components/modules/PortableBody";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(CASE_STUDY_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await sanityFetch(CASE_STUDY_QUERY, { slug });
  return {
    title: caseStudy?.seo?.metaTitle ?? caseStudy?.client ?? "Case study",
    description: caseStudy?.seo?.metaDescription ?? caseStudy?.resultLine ?? undefined,
    alternates: { canonical: `/our-work/${slug}` },
    // follow stays true: these pages are redirect targets for the old
    // Squarespace case study URLs, and a nofollow would strand the equity
    // arriving from them rather than passing it on.
    ...(caseStudy?.seo?.noIndex || !caseStudy?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

// T9 — case study detail, derived from the module library (ruling D5):
// breadcrumb hero + stats, photo, story body, testimonial, CTA.
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await sanityFetch(CASE_STUDY_QUERY, { slug });
  if (!caseStudy || caseStudy.status === "comingSoon") {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/our-work/${slug}`);
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Our work", url: `${SITE_URL}/our-work` },
          {
            name: caseStudy.client ?? slug,
            url: `${SITE_URL}/our-work/${slug}`,
          },
        ])}
      />
      {/* Hero — dark breadcrumb (H1c) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-[90rem] px-4 pb-20 pt-32 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/our-work" className="text-sky-blue hover:underline">
              Our work
            </Link>{" "}
            › <span className="text-white/80">{caseStudy.client}</span>
          </nav>
          <div className="mt-5 flex flex-wrap gap-2">
            {caseStudy.service?.title && (
              <Link
                href={`/services/${caseStudy.service.slug?.current}`}
                className="rounded-full bg-sky-blue/15 px-4 py-1.5 text-caption font-semibold text-sky-blue"
              >
                {caseStudy.service.title}
              </Link>
            )}
            {caseStudy.industry?.title && (
              <span className="rounded-full border border-white/20 px-4 py-1.5 text-caption font-semibold text-white/80">
                {caseStudy.industry.title}
              </span>
            )}
          </div>
          <h1 className="mt-5 max-w-3xl text-h1-mobile md:text-h1">
            {caseStudy.headline ?? caseStudy.client}
          </h1>
          {caseStudy.resultLine && (
            <p className="mt-6 max-w-xl text-body-lg text-white/70">
              {caseStudy.resultLine}
            </p>
          )}
          {(caseStudy.stats?.length ?? 0) > 0 && (
            <div className="mt-10 flex flex-wrap gap-10">
              {caseStudy.stats?.map((stat) => (
                <div key={stat._key}>
                  <p className="text-h2 text-deep-orange">{stat.value}</p>
                  <p className="mt-1 max-w-44 text-caption text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lead image */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-5xl px-4 pt-16 sm:px-6">
          <SanityImage
            image={caseStudy.photo}
            width={1040}
            height={480}
            className="h-72 w-full rounded-2xl object-cover shadow-lg md:h-120"
            placeholderLabel={`${caseStudy.client} — project photo`}
          />
        </div>
      </section>

      {/* Story body */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          {caseStudy.body ? (
            <PortableBody value={caseStudy.body} />
          ) : (
            <p className="text-body-lg text-deep-blue-80">
              The full {caseStudy.client} story is being written up — in the
              meantime, the numbers above tell most of it.
            </p>
          )}
        </div>
      </section>

      {/* Testimonial */}
      {caseStudy.testimonial?.quote && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <p aria-hidden className="text-6xl text-sky-blue">
              “
            </p>
            <blockquote className="text-h3 font-medium">
              {caseStudy.testimonial.quote}
            </blockquote>
            <p className="mt-6 text-body font-semibold">
              {caseStudy.testimonial.name}
            </p>
            <p className="text-caption text-deep-blue-80">
              {[caseStudy.testimonial.role, caseStudy.testimonial.company]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-h2">Want a story like this one?</h2>
          <div className="mx-auto mt-6 h-0.5 w-14 bg-sky-blue" aria-hidden />
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/65">
            A free 30-minute chat about where your HubSpot is at — no pitch
            deck, no pressure.
          </p>
          <ButtonLink href="/contact" variant="orange-outline" className="mt-10">
            Book your free chat
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
