import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import {
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading, Marker } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { HeroVideo } from "@/components/modules/HeroVideo";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { NewsletterBand } from "@/components/modules/NewsletterBand";
import { TestimonialCards } from "@/components/modules/TestimonialCards";

export const revalidate = 3600;

// The three service stages, from the v2 design. Copy is designer-final and
// mirrors the locked service catalogue (11 services), so it changes when the
// catalogue changes — which is a code change anyway. Move to Sanity only if
// the stages themselves become editable content.
const SERVICE_STAGES = [
  {
    title: "Discover",
    icon: "search",
    text: "HubSpot Audit, Customer Journey Mapping, Marketing Automation (Strategy)",
  },
  {
    title: "Build",
    icon: "build",
    text: "CRM Implementation, Websites, Landing Pages, Post-Sales, Automation",
  },
  {
    title: "Scale",
    icon: "growth",
    text: "RevOps Retainers, AI Solutions, HubSpot Training",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(HOME_PAGE_QUERY);
  return {
    title:
      page?.seo?.metaTitle ?? "zippily — HubSpot implementation & RevOps",
    description:
      page?.seo?.metaDescription ??
      "Auckland-based HubSpot implementation and RevOps agency. HubSpot Gold Partner.",
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [page, posts, settings] = await Promise.all([
    sanityFetch(HOME_PAGE_QUERY),
    sanityFetch(LATEST_POSTS_QUERY),
    sanityFetch(SITE_SETTINGS_QUERY),
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
      {/* Hero — dark split (H1b). Unchanged in the v2 pass: the orange marker
          circle on the emphasis phrase is correct. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
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
          {page.hero?.videoUrl ? (
            <HeroVideo url={page.hero.videoUrl} />
          ) : (
            <SanityImage
              image={page.hero?.image}
              width={560}
              height={420}
              className="h-72 w-full rounded-2xl object-cover lg:h-105"
              placeholderLabel="Hero photo — the team, real people at work"
            />
          )}
        </div>
      </section>

      {/* Trust strip — "HubSpot Gold Partner" as real, indexable text beside
          the logo row. An image-only badge is invisible to search. Client
          logos are placeholders until we have permission to show real ones. */}
      <section className="bg-deep-blue">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-7 gap-y-4 px-4 pb-14 pt-2 sm:px-6">
          <p className="text-body font-semibold text-white">
            HubSpot Gold Partner
          </p>
          <div className="flex flex-1 flex-wrap items-center gap-5">
            {(page.trustLogos?.length ?? 0) > 0
              ? page.trustLogos?.map((logo) => (
                  <SanityImage
                    key={logo._key}
                    image={logo}
                    width={112}
                    height={28}
                    className="h-7 w-auto opacity-80"
                  />
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="h-7 w-28 rounded bg-white/15"
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Intro — v2 pass: headline Deep Blue (was orange-on-white, banned),
          Sky Blue hand-drawn underline on "HubSpot implementation", copy
          rewritten. The three slots are for real people imagery — team or
          client photography, not stock, not product screenshots. */}
      <section className="bg-white">
        <div className="mx-auto max-w-[90rem] px-4 py-24 text-center sm:px-6">
          <h2 className="mx-auto max-w-3xl text-h2">
            <Marker style="underline" color="sky-blue">
              HubSpot implementation
            </Marker>{" "}
            for NZ and Australian businesses
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-deep-blue-80">
            At Zippily, we get B2B teams more out of HubSpot and the GTM tools
            around it. Our HubSpot implementation service is built around how
            your business actually works, not a generic setup.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <SanityImage
                key={i}
                image={page.introImages?.[i]}
                width={400}
                height={300}
                className="aspect-4/3 w-full rounded-2xl object-cover"
                placeholderLabel="Team / client photo — real people, not stock"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services overview — v2 pass: three Sky Blue stage cards plus a
          fourth in solid Deep Blue (was orange). Orange appears only on the
          button inside the Deep Blue card, which is the permitted pairing. */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
          <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
            Our services
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-h2">
            Everything your CRM needs. Nothing it doesn&apos;t.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_STAGES.map((stage) => (
              <div
                key={stage.title}
                className="rounded-2xl bg-sky-blue p-8 text-center"
              >
                <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-white">
                  <Icon name={stage.icon} className="h-6 w-6 text-deep-blue" />
                </span>
                <h3 className="mt-5 text-h4">{stage.title}</h3>
                <p className="mt-3 text-body text-deep-blue/80">{stage.text}</p>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-deep-blue p-8 text-center text-white">
              <p className="text-body-lg font-semibold">
                Eleven services across three stages. Find the one that matches
                where you&apos;re actually at.
              </p>
              <ButtonLink href="/services" variant="orange">
                View all services
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Featured case study — v2 pass: eyebrow removed, the stat pair is the
          dominant element (roughly double) with a full-height Sky Blue
          divider, and the button reads "View case study". */}
      {page.featuredCaseStudy && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
            <div className="grid gap-0 overflow-hidden rounded-3xl bg-deep-blue text-white lg:grid-cols-[1.05fr_1fr]">
              <div className="p-10 lg:p-14">
                <h2 className="max-w-md text-h2">
                  {page.featuredCaseStudy.headline}
                </h2>
                {(page.featuredCaseStudy.stats?.length ?? 0) > 0 && (
                  <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-stretch sm:gap-9">
                    {page.featuredCaseStudy.stats?.map((stat, index) => (
                      <div key={stat._key} className="contents">
                        {index > 0 && (
                          <span
                            aria-hidden
                            className="h-px w-full bg-sky-blue/40 sm:h-auto sm:w-px sm:self-stretch"
                          />
                        )}
                        <div>
                          {/* Orange on Deep Blue — the permitted pairing */}
                          <p className="text-[clamp(3rem,4.8vw,4.25rem)] font-semibold leading-none tracking-[-0.06em] text-deep-orange">
                            {stat.value}
                          </p>
                          <p className="mt-3 max-w-40 text-caption text-white/65">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <ButtonLink
                  href={`/our-work/${page.featuredCaseStudy.slug?.current}`}
                  variant="orange"
                  className="mt-10"
                >
                  View case study
                </ButtonLink>
              </div>
              <SanityImage
                image={page.featuredCaseStudy.photo}
                width={640}
                height={520}
                className="order-first h-64 w-full object-cover lg:order-none lg:h-full"
                placeholderLabel="Case study photo / video still"
              />
            </div>
          </div>
        </section>
      )}

      {/* Why Zippily — v2 pass: split head with the designer's framing copy;
          the aside is Deep Blue italic (orange is banned on white, Sky Blue
          fails contrast on it). Values come from Sanity, numbered 01–04. */}
      <section className="bg-white">
        <div className="mx-auto max-w-[90rem] px-4 pb-24 pt-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-h2">The name isn&apos;t just for fun.</h2>
              <p className="mt-2 text-body-lg font-medium italic text-deep-blue">
                Okay, it&apos;s a little bit for fun
              </p>
            </div>
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                Why zippily
              </p>
              <p className="mt-3 max-w-xl text-body-lg text-deep-blue-80">
                These four decide what we build, what we don&apos;t, and how we
                talk to you while we do it. They&apos;re the difference between
                a portal that gets used and one that gets abandoned.
              </p>
            </div>
          </div>
          <div className="mt-14 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {page.whyCards?.map((card, index) => (
              <div
                key={card._key}
                className="border-t border-deep-blue/15 pt-6 lg:border-l lg:border-t-0 lg:px-7 lg:pt-0 lg:first:border-l-0 lg:first:pl-0"
              >
                <p className="text-body-lg font-semibold text-sky-blue">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-h4">{card.title}</h3>
                <p className="mt-2 text-body text-deep-blue-80">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — v2 pass: white cards, "See our work" beside the
          heading, and the CLIENT FEEDBACK watermark finished rather than
          accidentally clipped. */}
      <TestimonialCards
        heading="Kind words from people we've un-stressed"
        testimonials={page.testimonials}
        action={{ label: "See our work", href: "/our-work" }}
        watermark="Client feedback"
      />

      {/* Industries — v2 pass: outline cards with Deep Blue icon chips that
          flip to Sky Blue on hover; card hover fill is Sky Blue at 12% (a
          token, not an arbitrary grey); pill button instead of a text link. */}
      {(page.featuredIndustries?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-h2">We speak your industry&apos;s language</h2>
              <ButtonLink href="/industries" variant="navy">
                Find out more
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.featuredIndustries?.map((industry) => (
                <Link
                  key={industry._id}
                  href={
                    industry.pageBuilt
                      ? `/industries/${industry.slug?.current}`
                      : "/services/crm-implementation"
                  }
                  className="group rounded-2xl border border-deep-blue/20 p-8 text-center transition hover:bg-sky-blue/12"
                >
                  <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-deep-blue transition group-hover:bg-sky-blue">
                    <Icon
                      name={industry.icon}
                      className="h-6 w-6 text-white transition group-hover:text-deep-blue"
                    />
                  </span>
                  <h3 className="mt-4 text-h4">{industry.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">
                    {industry.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Insights teaser — two large cards per the v2 design. Read-time sits
          in Deep Blue at 80%, never orange on a light section. */}
      {(posts?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
            <h2 className="text-center text-h2">Fresh from the blog</h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {posts.slice(0, 2).map((post) => (
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
                      {post.publishedAt} · {post.readTime} min read
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

      {/* FAQ preview (M26) — unchanged: heading left, accordion right */}
      <FaqAccordion
        heading="Things people usually ask us"
        faqs={page.faqs}
        name="home-faq"
      />

      {/* CTA banner (M3) — restored between the FAQ and the newsletter, per
          the v2 pass. One reusable component, one per page template. */}
      <CtaBanner data={page.ctaBanner} meetingsUrl={settings?.meetingsUrl} />

      {/* Newsletter — the single capture. The footer's duplicate signup was
          removed; this band is where "Stay in the loop" lives. */}
      <NewsletterBand
        heading="Stay in the loop."
        text="Our newsletter aims to keep you informed on all things CRM, AI and Automation."
      />
    </>
  );
}
