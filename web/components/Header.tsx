"use client";

import Image from "next/image";
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
      { label: "Careers", href: "/careers" },
      { label: "Events", href: "/events" },
    ],
  },
  { label: "Industries", href: "/industries" },
  { label: "Our Work", href: "/our-work" },
  { label: "Insight Hub", href: "/insights" },
];

// Locked IA (ruling D1) in the prototype's floating pill style:
// translucent Deep Blue pill, blur, orange CTA (orange is fine here —
// the pill itself is a Deep Blue background).
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-3">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-deep-blue/95 shadow-lg backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-4 pl-6 pr-3">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image
              src="/logo-white.png"
              alt="zippily"
              width={122}
              height={32}
              priority
              className="h-[29px] w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-body text-white/85 hover:text-white"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="text-caption transition-transform group-hover:rotate-180"
                    >
                      ▾
                    </span>
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="flex min-w-40 flex-col rounded-xl border border-white/10 bg-deep-blue py-2 shadow-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="px-4 py-2 text-body text-white/85 hover:bg-white/10 hover:text-white"
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
                  className="text-body text-white/85 hover:text-white"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="rounded-full bg-deep-orange px-5 py-2 text-body font-semibold text-deep-blue transition hover:bg-orange-hover"
            >
              Let&apos;s talk
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-white lg:hidden"
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
            className="border-t border-white/10 px-6 pb-6 pt-2 text-white lg:hidden"
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
                          className="py-2.5 text-body text-white/85"
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
      </div>
    </header>
  );
}
