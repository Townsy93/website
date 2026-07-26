import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { CAREERS_PAGE_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { VacancyCard } from "@/components/modules/VacancyCard";
import { VimeoEmbed } from "@/components/modules/VimeoEmbed";
import { RegisterInterestForm } from "@/components/modules/RegisterInterestForm";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(CAREERS_PAGE_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "Careers at Zippily — HubSpot roles in Auckland",
    description:
      page?.seo?.metaDescription ??
      page?.hero?.subheading ??
      "HubSpot roles at a small Auckland consultancy where you work directly with senior people.",
    alternates: { canonical: "/careers" },
    // Placeholder copy must not reach Google. follow stays true — the links
    // out of the page are real, only the wording is not.
    ...(page?.seo?.noIndex || !page?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

// Template M — careers hub. Single long scroll, light/dark alternating.
export default async function CareersPage() {
  const page = await sanityFetch(CAREERS_PAGE_QUERY);
  const roles = page?.openRoles ?? [];
  const benefits = page?.benefits ?? [];
  const storyRows = page?.storyRows ?? [];
  const values = page?.values ?? [];

  return (
    <>
      {/* 2 — Hero */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          {page?.teamPhoto && (
            <SanityImage
              image={page.teamPhoto}
              width={1200}
              height={560}
              className="w-full rounded-3xl object-cover"
              placeholderLabel="Team photo to come"
            />
          )}
          <h1 className="mt-10 max-w-3xl text-h1 text-deep-blue">
            <EmphasisedHeading
              heading={page?.hero?.heading ?? "Careers at Zippily"}
              phrase={page?.hero?.emphasisPhrase}
              markerStyle={page?.hero?.markerStyle}
            />
          </h1>
          {page?.hero?.subheading && (
            <p className="mt-5 max-w-2xl text-body-lg text-body">
              {page.hero.subheading}
            </p>
          )}
          <div className="mt-8">
            <ButtonLink href="#open-roles">
              {page?.hero?.primaryCta?.label ?? "See all open roles"}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 3 — Who we are, alternating image/text rows */}
      {storyRows.length > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-5xl space-y-16 px-4 py-20 sm:px-6 sm:space-y-20">
            {storyRows.map((row, index) => (
              <div
                key={row._key ?? index}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                <div className={row.imagePosition === "right" ? "md:order-2" : ""}>
                  <SanityImage
                    image={row.image}
                    width={640}
                    height={480}
                    className="w-full rounded-3xl object-cover"
                  />
                </div>
                <div>
                  <p className="text-eyebrow uppercase tracking-[0.14em] text-sky-blue">
                    {row.eyebrow}
                  </p>
                  <p className="mt-4 text-body-lg leading-relaxed text-white/85">
                    {row.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 — Values */}
      {values.length > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-14">
            {page?.valuesImage && (
              <SanityImage
                image={page.valuesImage}
                width={640}
                height={720}
                className="w-full rounded-3xl object-cover"
              />
            )}
            <div>
              <h2 className="text-h2 text-deep-blue">What we care about</h2>
              <div className="mt-8 space-y-8">
                {values.map((value, index) => (
                  <div key={value._key ?? index}>
                    <p className="text-eyebrow uppercase tracking-[0.14em] text-deep-blue">
                      {value.label}
                    </p>
                    <p className="mt-2 text-[16px] leading-relaxed text-body">
                      {value.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5 — Why work here + benefits */}
      {(page?.whyIntro || benefits.length > 0) && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
            {page?.whyIntro && (
              <p className="mx-auto max-w-2xl text-center text-body-lg text-body">
                {page.whyIntro}
              </p>
            )}

            {benefits.length > 0 && (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit._key ?? index}
                    className="rounded-3xl border border-deep-blue/12 bg-white p-6"
                  >
                    {/* Deep Blue tile with a Sky Blue glyph — never orange on
                        a light section. */}
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-deep-blue">
                      <Icon name={benefit.icon} className="h-6 w-6 text-sky-blue" />
                    </span>
                    <h3 className="mt-5 text-[18px] text-deep-blue">
                      {benefit.heading}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-body">
                      {benefit.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <ButtonLink href="#open-roles">See open roles</ButtonLink>
              <ButtonLink href="#register-interest" variant="navy-outline">
                Register interest
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* 6 — Life at Zippily. Renders nothing at all without a video, rather
          than an empty frame. */}
      {page?.lifeVideo?.url && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-h2">Life at Zippily</h2>
            <div className="mt-10">
              <VimeoEmbed
                url={page.lifeVideo.url}
                title={page.lifeVideo.title}
                orientation={page.lifeVideo.orientation}
                caption={page.lifeVideo.caption}
              />
            </div>
          </div>
        </section>
      )}

      {/* 7 — Open positions, or 7b the empty state. Never an empty section. */}
      <section id="open-roles" className="scroll-mt-24 bg-off-white-tan">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-h2 text-deep-blue">
            {page?.openRolesHeading ?? "Open positions"}
          </h2>

          {roles.length > 0 ? (
            <div className="mt-8 space-y-4">
              {roles.map((role) => (
                <VacancyCard key={role._id} vacancy={role} />
              ))}
            </div>
          ) : (
            <p className="mt-5 max-w-2xl text-body-lg text-body">
              {page?.emptyStateMessage ??
                "No roles open right now — we're always keen to hear from experienced HubSpot people."}
            </p>
          )}
        </div>
      </section>

      {/* 8 — Register interest, always present */}
      <section id="register-interest" className="scroll-mt-24 bg-deep-blue text-white">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <h2 className="text-h2">
            {page?.registerInterest?.heading ?? "No role that fits? Tell us anyway."}
          </h2>
          {page?.registerInterest?.body && (
            <p className="mt-4 text-body-lg text-white/85">
              {page.registerInterest.body}
            </p>
          )}
          <div className="mt-8">
            <RegisterInterestForm />
          </div>
        </div>
      </section>
    </>
  );
}
