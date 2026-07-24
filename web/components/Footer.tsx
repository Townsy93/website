import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/modules/NewsletterForm";

const SERVICES_LINKS = [
  { label: "CRM implementation", href: "/services/crm-implementation" },
  { label: "Marketing automation", href: "/services/marketing-automation" },
  { label: "Websites & integrations", href: "/services/websites-and-integrations" },
  { label: "RevOps retainers", href: "/services/revops-retainers" },
  { label: "HubSpot audits", href: "/services/hubspot-audit" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "Our work", href: "/our-work" },
  { label: "Industries", href: "/industries" },
  { label: "Careers", href: "/about-us/careers" },
  { label: "Contact", href: "/contact" },
];

const RESOURCES_LINKS = [
  { label: "Insight hub", href: "/insights" },
  { label: "Case studies", href: "/our-work" },
  { label: "Solutions", href: "/solutions" },
];

export type FooterSettings = {
  newsletterHeading?: string | null;
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
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Image
            src="/logo-white.png"
            alt="zippily"
            width={130}
            height={33}
            className="h-8 w-auto"
          />
          <p className="mt-3 max-w-xs text-body text-white/70">
            HubSpot implementation and RevOps for NZ &amp; AU businesses — done
            zippily.
          </p>
          <p className="mt-8 text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
            {settings?.newsletterHeading ?? "One useful HubSpot tip a month"}
          </p>
          <div className="mt-3">
            <NewsletterForm compact />
          </div>
          <p className="mt-2 text-caption text-white/50">No spam, ever.</p>
        </div>

        <LinkColumn heading="Services" links={SERVICES_LINKS} />
        <LinkColumn heading="Company" links={COMPANY_LINKS} />
        <LinkColumn heading="Resources" links={RESOURCES_LINKS} />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-6 sm:px-6">
        <p className="text-caption text-white/60">
          © {new Date().getFullYear()} zippily ltd · Auckland, New Zealand
        </p>
        <div className="flex gap-4">
          {settings?.linkedInUrl && (
            <a href={settings.linkedInUrl} className="text-caption text-sky-blue hover:underline">
              LinkedIn
            </a>
          )}
          {settings?.instagramUrl && (
            <a href={settings.instagramUrl} className="text-caption text-sky-blue hover:underline">
              Instagram
            </a>
          )}
          {settings?.youTubeUrl && (
            <a href={settings.youTubeUrl} className="text-caption text-sky-blue hover:underline">
              YouTube
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
