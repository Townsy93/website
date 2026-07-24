import Link from "next/link";

const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "About Us", href: "/about-us" },
  { label: "Industries", href: "/industries" },
  { label: "Our Work", href: "/our-work" },
  { label: "Insight Hub", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-deep-blue text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-h3 lowercase">zippily</p>
          <p className="mt-3 max-w-xs text-body text-sky-blue">
            Auckland-based HubSpot implementation and RevOps agency. HubSpot
            Gold Partner.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-body hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div>
          <p className="text-h4">Stay in the loop</p>
          <p className="mt-2 text-body text-sky-blue">
            RevOps ideas worth reading, straight to your inbox.
          </p>
          {/* Placeholder — Klaviyo integration lands in a later phase */}
          <form className="mt-4 flex gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="you@company.co.nz"
              className="w-full min-w-0 rounded-full bg-white px-4 py-2.5 text-body text-deep-blue placeholder:text-deep-blue/50"
            />
            <button
              type="button"
              className="shrink-0 rounded-full bg-deep-orange px-5 py-2.5 text-body font-semibold text-deep-blue transition hover:bg-deep-orange/90"
            >
              Sign up
            </button>
          </form>

          <div className="mt-8 flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-body text-sky-blue hover:underline"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="text-caption text-sky-blue">
          © {new Date().getFullYear()} zippily. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
