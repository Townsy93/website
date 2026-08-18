import Image from "next/image";
import Link from "next/link";

const SERVICES_LINKS = [
  { label: "CRM implementation", href: "/services/crm-implementation" },
  { label: "Marketing automation", href: "/services/marketing-automation" },
  { label: "Websites & integrations", href: "/services/websites-and-integrations" },
  { label: "RevOps retainers", href: "/services/revops-retainers" },
  { label: "HubSpot audits", href: "/services/hubspot-audit" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "Events", href: "/events" },
  { label: "Our work", href: "/our-work" },
  { label: "Industries", href: "/industries" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const RESOURCES_LINKS = [
  { label: "Insight hub", href: "/insights" },
  { label: "Free resources", href: "/resources" },
  { label: "Case studies", href: "/our-work" },
  { label: "Solutions", href: "/solutions" },
];

export type FooterSettings = {
  newsletterHeading?: string | null;
  portalUrl?: string | null;
  linkedInUrl?: string | null;
  instagramUrl?: string | null;
  youTubeUrl?: string | null;
} | null;

function LinkColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={heading} className="flex flex-col gap-2.5">
      <p className="text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
        {heading}
      </p>
      {links.map((item) => (
        <Link key={item.label} href={item.href} className="text-body text-white/80 hover:text-white hover:underline">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// Module M2 — full footer, 4-col. Newsletter signup becomes a HubSpot
// form in the integrations pass; the form is presentational until then.
export function Footer({ settings }: { settings?: FooterSettings }) {
  return (
    <footer className="bg-deep-blue text-white">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-6 py-10 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Image
            src="/logo-white.png"
            alt="zippily"
            width={138}
            height={36}
            className="h-9 w-auto"
          />
          <p className="mt-3 max-w-xs text-body text-white/70">
            HubSpot implementation and RevOps for NZ &amp; AU businesses — done
            zippily.
          </p>
          {/* Socials sit here, left-aligned under the brand, rather than in
              the bottom-right corner — designer's call: visibility. The
              newsletter capture that lived here is gone; the page-level
              "Stay in the loop" band is the one capture, so the footer no
              longer competes with it. */}
          <div className="mt-6 flex items-center gap-3">
            {settings?.linkedInUrl && (
              <a
                href={settings.linkedInUrl}
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:border-white hover:bg-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8h4.6v14.5H.2V8Zm7.6 0h4.4v2h.06c.61-1.16 2.1-2.38 4.34-2.38 4.64 0 5.5 3.05 5.5 7.02v7.86h-4.6v-6.97c0-1.66-.03-3.8-2.32-3.8-2.32 0-2.68 1.81-2.68 3.68v7.09H7.8V8Z" />
                </svg>
              </a>
            )}
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:border-white hover:bg-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {settings?.youTubeUrl && (
              <a
                href={settings.youTubeUrl}
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:border-white hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23 7.6a3 3 0 0 0-2.1-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.6 32 32 0 0 0 .5 12 32 32 0 0 0 1 16.4a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A32 32 0 0 0 23.5 12 32 32 0 0 0 23 7.6ZM9.8 15.3V8.7l5.8 3.3-5.8 3.3Z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <LinkColumn heading="Services" links={SERVICES_LINKS} />
        <LinkColumn heading="Company" links={COMPANY_LINKS} />
        <LinkColumn heading="Resources" links={RESOURCES_LINKS} />
      </div>

      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-6">
        <p className="text-caption text-white/60">
          © {new Date().getFullYear()} zippily ltd · Auckland, New Zealand
        </p>
        {/* Existing clients only. Rendered from settings so it stays absent
            until the portal is on its real domain — a workers.dev link in
            the footer reads as unfinished. Labelled "Client login" rather
            than "Login" so anyone who is not a client can tell at a glance
            that it is not for them. */}
        {settings?.portalUrl && (
          <a
            href={settings.portalUrl}
            className="rounded-full border border-white/30 px-3.5 py-1.5 text-caption text-white transition hover:border-white hover:bg-white/10"
          >
            Client login
          </a>
        )}
      </div>
    </footer>
  );
}
