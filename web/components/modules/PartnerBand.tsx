import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";

// The HubSpot partner credential band — pale blue so it reads as its own
// strip between white sections. Shared by About, Services and Platforms so
// the badge, tier wording and layout can never drift between pages.
//
// Two sizes: the compact default (About/Services), and — when heading/text
// are passed — the Platforms page's larger "Why work with a HubSpot
// partner?" variant with a CTA button.
export function PartnerBand({
  heading = "HubSpot Platinum Partner",
  text = "Certified and delivering across New Zealand & Australia, from Auckland.",
  button,
  kicker,
}: {
  heading?: string;
  text?: string;
  button?: { label: string; href: string };
  /** Small italic lead-in above the heading (About: "We're pretty chuffed…"). */
  kicker?: string;
}) {
  const large = Boolean(button);
  return (
    <section className="bg-white">
      <div className={`mx-auto max-w-5xl px-6 ${large ? "py-14 sm:py-20" : "pb-8"}`}>
        <div
          className={`flex flex-col items-center gap-6 rounded-2xl bg-sky-blue/15 text-center sm:flex-row sm:text-left ${
            large ? "p-10 sm:gap-10 sm:p-12" : "p-8"
          }`}
        >
          <Image
            src="/hubspot-platinum-badge.png"
            alt="HubSpot Platinum Solutions Partner badge"
            width={96}
            height={96}
            className={`w-auto shrink-0 ${large ? "h-36" : "h-24"}`}
          />
          <div>
            {kicker && (
              <p className="mb-2 text-body font-medium italic text-deep-blue-80">
                {kicker}
              </p>
            )}
            <h2 className={`text-deep-blue ${large ? "text-h2" : "text-h3"}`}>
              {heading}
            </h2>
            <p className={`mt-2 text-deep-blue-80 ${large ? "mt-3 max-w-xl text-body-lg" : "text-body"}`}>
              {text}
            </p>
            {button && (
              <ButtonLink href={button.href} variant="orange" className="mt-6">
                {button.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
