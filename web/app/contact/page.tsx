import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { CONTACT_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { ContactForm } from "@/components/modules/ContactForm";
import { FaqAccordion } from "@/components/modules/FaqAccordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact — zippily",
  description: "Let's talk about your HubSpot.",
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    client.fetch(CONTACT_PAGE_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Contact page content not found in Sanity.</p>
      </section>
    );
  }

  return (
    <>
      {/* Hero — light split (H1d). Marker is Sky Blue on light per brand rule. */}
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
            height={416}
            className="h-64 w-full rounded-2xl object-cover shadow-lg lg:h-96"
            placeholderLabel="Warm photo of the Zippily team"
          />
        </div>
      </section>

      {/* Form + direct details, side by side on desktop (T13 / F1) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-[1.25fr_0.75fr]">
          <ContactForm
            heading={page.formHeading}
            options={page.formOptions}
            successHeading={page.successHeading}
            successText={page.successText}
          />

          <aside className="rounded-3xl bg-deep-blue p-9 text-white">
            <h2 className="text-h3">
              {page.detailsHeading ?? "Rather talk it through?"}
            </h2>
            <p className="mt-2 text-body text-white/65">
              Grab a time that suits — or reach us directly.
            </p>
            {settings?.meetingsUrl && (
              <ButtonLink
                href={settings.meetingsUrl}
                variant="orange"
                className="mt-6"
              >
                Book a call
              </ButtonLink>
            )}
            <dl className="mt-8 flex flex-col gap-5 border-t border-white/15 pt-8">
              {settings?.contactEmail && (
                <div>
                  <dt className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-body hover:underline"
                    >
                      {settings.contactEmail}
                    </a>
                  </dd>
                </div>
              )}
              {settings?.contactPhone && (
                <div>
                  <dt className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                    Phone
                  </dt>
                  <dd className="mt-1 text-body">{settings.contactPhone}</dd>
                </div>
              )}
              {settings?.address && (
                <div>
                  <dt className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                    Where
                  </dt>
                  <dd className="mt-1 text-body text-white/80">
                    {settings.address}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </section>

      {/* FAQ (M26) */}
      <FaqAccordion
        heading="Questions, answered"
        faqs={page.faqs}
        name="contact-faq"
      />
    </>
  );
}
