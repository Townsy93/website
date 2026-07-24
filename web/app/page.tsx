import Link from "next/link";
import { client } from "@/sanity/client";
import {
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { IconCards } from "@/components/modules/IconCards";
import { TestimonialCards } from "@/components/modules/TestimonialCards";

export const revalidate = 3600;

export default async function Home() {
  const [page, posts, settings] = await Promise.all([
    client.fetch(HOME_PAGE_QUERY),
    client.fetch(LATEST_POSTS_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);

  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Home page content not found in Sanity.</p>
      </section>
    );
  }

  return (
    <>
      {/* Hero — dark split (H1b) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-caption font-semibold text-sky-blue">
                {page.hero.eyebrow}
              </p>
            )}
            <h1 className="mt-6 text-h1-mobile md:text-h1">
              <EmphasisedHeading
                heading={page.hero?.heading ?? ""}
                phrase={page.hero?.emphasisPhrase}
                markerStyle={page.hero?.markerStyle}
                color="deep-orange"
              />
            </h1>
            {page.hero?.subheading && (
              <p className="mt-6 max-w-xl text-body-lg text-white/70">
                {page.hero.subheading}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {page.hero?.primaryCta?.href && (
                <ButtonLink href={page.hero.primaryCta.href} variant="orange">
                  {page.hero.primaryCta.label}
                </ButtonLink>
              )}
              {page.hero?.secondaryCta?.href && (
                <ButtonLink
                  href={page.hero.secondaryCta.href}
                  variant="ghost-light"
                >
                  {page.hero.secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          </div>
          <SanityImage
            image={page.hero?.image}
            width={560}
            height={420}
            className="h-72 w-full rounded-2xl object-cover lg:h-105"
            placeholderLabel="Hero photo — the team, real people at work"
          />
        </div>
      </section>

      {/* Why Zippily — values (M6) */}
      <IconCards
        eyebrow="Why zippily"
        heading={page.whyHeading}
        cards={page.whyCards}
        columns={4}
      />

      {/* Services teaser (M8, scroll row) */}
      {(page.featuredServices?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Services
                </p>
                <h2 className="mt-3 text-h2">
                  Everything your CRM needs. Nothing it doesn&apos;t.
                </h2>
              </div>
              <Link
                href="/services"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                Explore all services →
              </Link>
            </div>
            <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">
              {page.featuredServices?.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug?.current}`}
                  className="group min-w-72 snap-start rounded-xl border border-deep-blue-20 p-7 transition hover:-translate-y-0.5 hover:bg-deep-blue hover:text-white lg:min-w-0"
                >
                  <Icon
                    name={service.icon}
                    className="h-6 w-6 text-deep-blue group-hover:text-white"
                  />
                  <h3 className="mt-4 text-h4">{service.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80 group-hover:text-white/75">
                    {service.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured case study (M28 dark card) */}
      {page.featuredCaseStudy && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="grid gap-10 rounded-3xl bg-deep-blue p-10 text-white lg:grid-cols-[1.05fr_1fr] lg:p-14">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                  Case study · {page.featuredCaseStudy.client}
                </p>
                <h2 className="mt-4 text-h2">
                  {page.featuredCaseStudy.headline}
                </h2>
                {(page.featuredCaseStudy.stats?.length ?? 0) > 0 && (
                  <div className="mt-8 flex flex-wrap gap-8">
                    {page.featuredCaseStudy.stats?.map((stat) => (
                      <div key={stat._key}>
                        <p className="text-h2 text-deep-orange">{stat.value}</p>
                        <p className="mt-1 max-w-40 text-caption text-white/70">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <ButtonLink
                  href={`/our-work/${page.featuredCaseStudy.slug?.current}`}
                  variant="orange"
                  className="mt-8"
                >
                  Read the full story
                </ButtonLink>
              </div>
              <SanityImage
                image={page.featuredCaseStudy.photo}
                width={520}
                height={400}
                className="h-64 w-full rounded-2xl object-cover lg:h-full"
                placeholderLabel="Case study photo / video still"
              />
            </div>
          </div>
        </section>
      )}

      {/* Testimonials (M24) */}
      <TestimonialCards
        heading="Kind words from people we've un-stressed"
        subheading="Real clients, across New Zealand and Australia."
        testimonials={page.testimonials}
      />

      {/* Industries teaser (M9b) */}
      {(page.featuredIndustries?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Industries
                </p>
                <h2 className="mt-3 text-h2">
                  We speak your industry&apos;s language
                </h2>
              </div>
              <Link
                href="/industries"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                All industries →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {page.featuredIndustries?.map((industry) => (
                <Link
                  key={industry._id}
                  href={
                    industry.pageBuilt
                      ? `/industries/${industry.slug?.current}`
                      : "/services/crm-implementation"
                  }
                  className="group rounded-xl bg-off-white-tan p-6 transition hover:-translate-y-0.5 hover:bg-deep-blue hover:text-white"
                >
                  <Icon
                    name={industry.icon}
                    className="h-6 w-6 text-deep-blue group-hover:text-white"
                  />
                  <h3 className="mt-3 text-h4">{industry.title}</h3>
                  <p className="mt-2 hidden text-body text-deep-blue-80 group-hover:text-white/75 lg:block">
                    {industry.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Insights teaser — latest 3 posts */}
      {(posts?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Insight hub
                </p>
                <h2 className="mt-3 text-h2">Fresh from the blog</h2>
              </div>
              <Link
                href="/insights"
                className="text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                Visit the insight hub →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/insights/${post.slug?.current}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <SanityImage
                    image={post.coverImage}
                    width={400}
                    height={190}
                    className="h-44 w-full object-cover"
                    placeholderLabel="Post image"
                  />
                  <div className="p-6">
                    <h3 className="text-h4">{post.title}</h3>
                    <p className="mt-3 text-caption text-deep-blue-80">
                      {post.publishedAt} · {post.readTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ preview (M26) */}
      <FaqAccordion
        heading="Things people usually ask us"
        faqs={page.faqs}
        name="home-faq"
      />

      {/* CTA banner with meetings embed (M3 + F4) */}
      <CtaBanner data={page.ctaBanner} meetingsUrl={settings?.meetingsUrl} />
    </>
  );
}
