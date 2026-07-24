import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { RESOURCES_QUERY } from "@/sanity/queries";
import { Marker } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { NewsletterForm } from "@/components/modules/NewsletterForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { TOPIC_LABELS, formatDate } from "@/components/modules/postCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free resources",
  description:
    "Guides, comparison sheets and prompt packs pulled from real client work — no fluff, no theory.",
  alternates: { canonical: "/resources" },
};

// Resources library hub (brief: editorial dark page, one resource per
// viewport). Indexable; CTAs route to each resource's gated LP — never a
// direct file download. Category pills activate once the count justifies
// filtering (> 3 resources).
export default async function ResourcesPage() {
  const resources = await sanityFetch(RESOURCES_QUERY);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free HubSpot resources from zippily",
    itemListElement: resources.map((resource, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: resource.title,
      url: `${SITE_URL}/resources#${resource.slug?.current}`,
    })),
  };

  const showPills = resources.length > 3;
  const categories = showPills
    ? [...new Set(resources.map((r) => r.category).filter(Boolean))]
    : [];

  return (
    <div className="bg-deep-blue text-off-white-tan">
      <JsonLd data={itemListJsonLd} />

      {/* Intro / mission statement */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-36 sm:px-6 lg:grid-cols-[0.35fr_0.65fr]">
        <p className="flex items-start gap-3 text-body-lg">
          <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 bg-deep-orange" />
          Free resources
        </p>
        <p className="text-h2 font-normal tracking-body">
          Everything here is pulled from{" "}
          <Marker style="circle" color="deep-orange">
            real client work
          </Marker>{" "}
          — no fluff, no theory. Grab what&apos;s useful, and it&apos;s yours to
          keep.
        </p>
      </section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <hr className="border-off-white-tan/15" />
      </div>

      {/* Category pills — hidden until the count justifies filtering */}
      {showPills && (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 pt-10 sm:px-6">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-off-white-tan/40 px-4 py-1.5 text-caption uppercase tracking-[0.06em]"
            >
              {TOPIC_LABELS[category ?? ""] ?? category}
            </span>
          ))}
        </div>
      )}

      {/* Resource list — one row per viewport */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        {resources.map((resource, index) => (
          <article
            key={resource._id}
            id={resource.slug?.current ?? undefined}
            className="grid min-h-[80vh] scroll-mt-24 content-center gap-8 border-b border-off-white-tan/15 py-20 lg:grid-cols-[0.2fr_0.8fr]"
          >
            <p
              aria-hidden
              className="text-7xl font-normal text-sky-blue/50 lg:text-8xl"
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <div className="lg:text-right">
              <h2 className="text-4xl font-semibold tracking-heading md:text-6xl lg:text-8xl">
                {resource.title}
              </h2>
              <p className="mt-6 text-caption uppercase tracking-[0.08em] text-off-white-tan/60">
                Updated {formatDate(resource.updatedAt)} · PDF ·{" "}
                {resource.readTimeMinutes}-min read
              </p>

              {/* Author strip — people imagery on a type-only page */}
              {resource.author?.name && (
                <div className="mt-5 flex items-center gap-3 lg:justify-end">
                  <SanityImage
                    image={resource.author.photo}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    placeholderLabel=""
                  />
                  <p className="text-body text-off-white-tan/80">
                    Put together by {resource.author.name}
                  </p>
                </div>
              )}

              {/* What's inside */}
              {(resource.summaryBullets?.length ?? 0) > 0 && (
                <ul className="mt-6 flex flex-col gap-2 text-body text-off-white-tan/60 lg:items-end">
                  {resource.summaryBullets?.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5 lg:flex-row-reverse">
                      <span aria-hidden className="text-sky-blue">
                        —
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-9 flex flex-col gap-4 lg:items-end">
                <Link
                  href={resource.landingPageHref ?? "/contact"}
                  className="inline-block rounded-[5px] border border-off-white-tan/40 px-12 py-3.5 text-body font-semibold uppercase tracking-[0.06em] transition-colors hover:border-deep-orange hover:text-deep-orange"
                >
                  Get the guide →
                </Link>
                {resource.relatedPost?.slug?.current && (
                  <p className="text-caption text-off-white-tan/60">
                    Related reading:{" "}
                    <Link
                      href={`/insights/${resource.relatedPost.slug.current}`}
                      className="underline decoration-sky-blue decoration-2 underline-offset-4 hover:text-off-white-tan"
                    >
                      {resource.relatedPost.title}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Newsletter cross-sell strip */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <p className="text-h3">
          New resources land here first. Get them in your inbox.
        </p>
        <div className="max-w-md lg:justify-self-end">
          <NewsletterForm />
        </div>
      </section>

      {/* Tonal decorative wordmark */}
      <p
        aria-hidden
        className="select-none overflow-hidden pl-4 text-[22vw] font-semibold leading-none tracking-heading text-white/5 sm:pl-6"
      >
        zippily
      </p>
    </div>
  );
}
