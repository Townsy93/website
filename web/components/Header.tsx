"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "About Us",
    href: "/about-us",
    children: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/about-us/careers" },
      { label: "Events", href: "/about-us/events" },
    ],
  },
  { label: "Industries", href: "/industries" },
  { label: "Our Work", href: "/our-work" },
  { label: "Insight Hub", href: "/insights" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-off-white-tan/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-h3 lowercase"
          onClick={() => setMobileOpen(false)}
        >
          zippily
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-body hover:underline"
                >
                  {item.label}
                  <span aria-hidden className="text-caption">
                    ▾
                  </span>
                </Link>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="flex min-w-40 flex-col rounded-md bg-off-white-tan py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="px-4 py-2 text-body hover:bg-deep-blue/5"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-body hover:underline"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-deep-blue px-5 py-2.5 text-body font-semibold text-white transition hover:bg-deep-blue/90"
          >
            Let&apos;s talk
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span aria-hidden className="text-h3">
              {mobileOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="border-t border-deep-blue/10 bg-off-white-tan px-4 pb-6 pt-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 text-body-lg"
                  aria-expanded={mobileAboutOpen}
                  onClick={() => setMobileAboutOpen((open) => !open)}
                >
                  {item.label}
                  <span aria-hidden>{mobileAboutOpen ? "▴" : "▾"}</span>
                </button>
                {mobileAboutOpen && (
                  <div className="flex flex-col pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="py-2.5 text-body"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block py-3 text-body-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
