import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { ALL_POSTS_QUERY, INSIGHT_HUB_QUERY } from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { InsightFilters } from "@/components/modules/InsightFilters";
import { PostPills, formatDate } from "@/components/modules/postCard";
import { NewsletterBand } from "@/components/modules/NewsletterBand";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(INSIGHT_HUB_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Insight Hub",
    description: page?.seo?.metaDescription ?? "Practical HubSpot advice from the team that actually uses it every day.",
    alternates: { canonical: "/insights" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function InsightsPage() {
  const [page, posts] = await Promise.all([
    sanityFetch(INSIGHT_HUB_QUERY),
    sanityFetch(ALL_POSTS_QUERY),
  ]);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Insight Hub content not found in Sanity.</p>
      </section>
    );
  }

  const featured = page.featuredPost ?? posts[0] ?? null;
  const gridPosts = featured
    ? posts.filter((post) => post._id !== featured._id)
    : posts;

  return (
    <>
      {/* Hero — light split (H1d) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
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
          </div>
          <SanityImage
            image={page.hero?.image}
            width={520}
            height={420}
            className="h-64 w-full rounded-2xl object-cover shadow-lg lg:h-96"
            placeholderLabel="Real people — the team writing / at a whiteboard"
          />
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Latest
            </p>
            <Link
              href={`/insights/${featured.slug?.current}`}
              className="mt-4 grid overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg lg:grid-cols-[1.1fr_1fr]"
            >
              <SanityImage
                image={featured.coverImage}
                width={560}
                height={400}
                className="h-64 w-full object-cover lg:h-full"
                placeholderLabel="Featured post image"
              />
              <div className="p-9">
                <PostPills post={featured} />
                <h2 className="mt-4 text-h2">{featured.title}</h2>
                <p className="mt-3 text-body-lg text-deep-blue-80">
                  {featured.excerpt}
                </p>
                <p className="mt-5 text-caption text-deep-blue-80">
                  {formatDate(featured.publishedAt)} · {featured.readTime} min
                  read
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Filterable post grid (T10) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-h2">More from the blog</h2>
          <div className="mt-8">
            <InsightFilters posts={gridPosts} />
          </div>
        </div>
      </section>

      {/* Resources teaser (M16) */}
      {(page.resources?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
              Downloadable resources
            </p>
            <h2 className="mt-3 text-h2">{page.resourcesHeading}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {page.resources?.map((resource) => (
                <Link
                  key={resource._key}
                  href={resource.link?.href ?? "/contact"}
                  className="flex items-center gap-4 rounded-xl border border-white/15 p-6 transition hover:-translate-y-0.5 hover:border-white/40"
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-deep-orange/15 text-deep-orange"
                  >
                    ↓
                  </span>
                  <span className="text-body font-semibold">{resource.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterBand
        heading={page.newsletterHeading}
        text={page.newsletterText}
      />
    </>
  );
}
