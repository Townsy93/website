import type { Metadata } from "next";
import Image from "next/image";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { StatTrio } from "@/components/modules/StatTrio";
import { TestimonialCards } from "@/components/modules/TestimonialCards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "A small, senior Auckland team that's spent years inside HubSpot — and likes it that way.",
  alternates: { canonical: "/about-us" },
};

export default async function AboutPage() {
  const page = await sanityFetch(ABOUT_PAGE_QUERY);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">About page content not found in Sanity.</p>
      </section>
    );
  }

  return (
    <>
      {/* Hero — dark split with anchor CTAs (H1b) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="inline-flex rounded-full border border-white/20 px-4 py-1.5 text-caption font-semibold text-sky-blue">
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
                <ButtonLink
                  href={page.hero.primaryCta.href}
                  variant="orange-outline"
                >
                  {page.hero.primaryCta.label} ↓
                </ButtonLink>
              )}
              {page.hero?.secondaryCta?.href && (
                <ButtonLink
                  href={page.hero.secondaryCta.href}
                  variant="ghost-light"
                >
                  {page.hero.secondaryCta.label} ↓
                </ButtonLink>
              )}
            </div>
          </div>
          <SanityImage
            image={page.hero?.image}
            width={540}
            height={480}
            className="h-72 w-full rounded-2xl object-cover lg:h-110"
            placeholderLabel="Real team photo — not an illustration"
          />
        </div>
      </section>

      {/* Pillar A — trust rows (M28) */}
      {(page.trustPillars?.length ?? 0) > 0 && (
        <section id="trust" className="scroll-mt-24 bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
              Promise one
            </p>
            <h2 className="mt-3 text-center text-h2">Why you&apos;ll trust us</h2>
            <div className="mt-14 flex flex-col gap-16">
              {page.trustPillars?.map((row, index) => (
                <div
                  key={row._key}
                  className="grid items-center gap-10 lg:grid-cols-2"
                >
                  <SanityImage
                    image={row.image}
                    width={560}
                    height={400}
                    className={`h-64 w-full rounded-2xl object-cover lg:h-96 ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                    placeholderLabel="Candid team photo"
                  />
                  <div>
                    <h3 className="text-h3">{row.heading}</h3>
                    <p className="mt-4 max-w-lg text-body-lg text-deep-blue-80">
                      {row.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Meet the team (M13) */}
      {(page.team?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-center text-h2">
              {page.teamHeading ?? "The people you'll actually work with"}
            </h2>
            <p className="mt-3 text-center text-caption text-white/50">
              Small team, senior bench. Hover a card to see more.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {page.team?.map((member) => (
                <div
                  key={member._id}
                  className="group rounded-xl border border-white/15 p-6 text-center transition hover:-translate-y-1"
                >
                  <SanityImage
                    image={member.photo}
                    width={132}
                    height={132}
                    className="mx-auto h-33 w-33 rounded-full object-cover"
                    placeholderLabel="Photo"
                  />
                  <h3 className="mt-4 text-h4">{member.name}</h3>
                  <p className="mt-1 text-caption text-sky-blue">{member.role}</p>
                  <p className="mt-3 text-body text-white/70">{member.bio}</p>
                  {member.outsideWork && (
                    <p className="mt-2 text-caption text-white/50">
                      Outside work: {member.outsideWork}
                    </p>
                  )}
                  <div className="max-h-0 overflow-hidden text-left opacity-0 transition-all duration-300 group-hover:mt-4 group-hover:max-h-72 group-hover:border-t group-hover:border-white/15 group-hover:pt-4 group-hover:opacity-100">
                    {member.skills && member.skills.length > 0 && (
                      <p className="text-caption text-white/70">
                        <span className="font-semibold text-sky-blue">Skills:</span>{" "}
                        {member.skills.join(", ")}
                      </p>
                    )}
                    <p className="mt-2 text-caption text-white/70">
                      <span className="font-semibold text-sky-blue">
                        Favourite HubSpot feature:
                      </span>{" "}
                      {member.favouriteHubSpotFeature ?? "Coming soon"}
                    </p>
                    <p className="mt-2 text-caption text-white/70">
                      <span className="font-semibold text-sky-blue">
                        Why they love HubSpot:
                      </span>{" "}
                      {member.whyTheyLoveHubSpot ?? "Coming soon"}
                    </p>
                    {member.linkedIn && (
                      <a
                        href={member.linkedIn}
                        className="mt-3 inline-block text-caption font-semibold text-sky-blue underline underline-offset-2"
                      >
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Culture (M32) */}
      {page.cultureText && (
        <section className="bg-off-white-tan">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                The people behind Zippily
              </p>
              <h2 className="mt-3 text-h2">A real, small, senior team.</h2>
              <p className="mt-5 max-w-md text-body-lg text-deep-blue-80">
                {page.cultureText}
              </p>
            </div>
            <div className="flex snap-x gap-4 overflow-x-auto pb-2">
              {(page.culturePhotos?.length
                ? page.culturePhotos
                : [null, null, null, null]
              ).map((photo, index) => (
                <SanityImage
                  key={index}
                  image={photo}
                  width={280}
                  height={320}
                  className="h-80 w-70 shrink-0 snap-start rounded-2xl object-cover"
                  placeholderLabel="Candid photo"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats (M21) */}
      <StatTrio stats={page.stats} />

      {/* Testimonials (M24) */}
      <TestimonialCards
        heading="Don't take our word for it."
        testimonials={page.testimonials}
      />

      {/* Founding story (M33) */}
      {page.storyBody && (
        <section className="bg-off-white-tan">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
            <SanityImage
              image={page.storyImage}
              width={560}
              height={560}
              className="h-80 w-full rounded-2xl object-cover lg:h-130"
              placeholderLabel="Real photo of Sean / the early team"
            />
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                Our story
              </p>
              <h2 className="mt-3 text-h2">
                {page.storyHeading ?? "Why we started Zippily"}
              </h2>
              <div className="mt-5 flex max-w-lg flex-col gap-4 text-body-lg text-deep-blue-80">
                <PortableText value={page.storyBody} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pillar B — love (M22 treatment per D4: Deep Blue borders on dark) */}
      {(page.lovePillars?.length ?? 0) > 0 && (
        <section id="love" className="scroll-mt-24 bg-deep-blue text-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
              Promise two
            </p>
            <h2 className="mt-3 text-center text-h2">Why you&apos;ll love us</h2>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {page.lovePillars?.map((pillar) => (
                <div
                  key={pillar._key}
                  className="border-t-2 border-deep-orange pt-6"
                >
                  <h3 className="text-h4">{pillar.title}</h3>
                  <p className="mt-3 text-body text-white/70">{pillar.text}</p>
                </div>
              ))}
            </div>
            {(page.values?.length ?? 0) > 0 && (
              <div className="mt-16 rounded-3xl bg-black/20 p-10">
                <h3 className="text-h3">The values we actually work by</h3>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  {page.values?.map((value) => (
                    <div
                      key={value._key}
                      className="rounded-xl border border-white/15 p-6"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-deep-orange/15">
                        <Icon
                          name={value.icon}
                          className="h-5 w-5 text-deep-orange"
                        />
                      </span>
                      <h4 className="mt-4 text-h4">{value.title}</h4>
                      <p className="mt-2 text-body text-white/70">
                        {value.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gold Partner credential (M25e) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
            <Image
              src="/hubspot-gold-badge.png"
              alt="HubSpot Gold Solutions Partner badge"
              width={96}
              height={96}
              className="h-24 w-auto shrink-0"
            />
            <div>
              <h2 className="text-h3">HubSpot Gold Partner</h2>
              <p className="mt-2 text-body text-deep-blue-80">
                Certified and delivering across New Zealand &amp; Australia,
                from Auckland.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
