"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

// The three stage pills carry the designer's custom stage icons; "All
// services" is deliberately bare — it is not a stage. Each stage carries a
// who-it-suits one-liner under the pills, per the designer's Services pass
// (Aug 2026): "so users know which category best suits their needs".
const FILTERS = [
  {
    label: "All services",
    value: "all",
    icon: null,
    blurb:
      "Every service we offer, in one grid — filter by where you're starting from.",
  },
  {
    label: "Discover",
    value: "discover",
    icon: "zl-stage-discover",
    blurb:
      "For teams who suspect HubSpot could be doing more, and want to know what's wrong before paying to fix it.",
  },
  {
    label: "Build",
    value: "build",
    icon: "zl-stage-build",
    blurb:
      "For teams ready to set HubSpot up properly — implementations, automations and integrations built around how you work.",
  },
  {
    label: "Scale",
    value: "scale",
    icon: "zl-stage-scale",
    blurb:
      "For teams already live on HubSpot who want more from it — optimisation, training and ongoing senior help.",
  },
] as const;

export type ServiceCardData = {
  key: string;
  title: string;
  description: string;
  whoItsFor?: string | null;
  icon?: string | null;
  category: string;
  href: string;
};

// Module M7 + the Discover/Build/Scale filter pills (T2).
// Cards carry no pricing (ruling D2).
export function ServiceFilterGrid({ cards }: { cards: ServiceCardData[] }) {
  const [filter, setFilter] = useState<string>("all");
  // The hero's goal buttons deep-link a stage (#discover/#build/#scale) —
  // the anchor scrolls here natively, this effect selects the matching pill.
  useEffect(() => {
    const applyHash = () => {
      const stage = window.location.hash.replace("#", "");
      if (["discover", "build", "scale"].includes(stage)) setFilter(stage);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const visible = cards.filter(
    (card) => filter === "all" || card.category === filter,
  );
  const active = FILTERS.find((f) => f.value === filter);
  return (
    <div>
      {/* Wraps rather than scrolls. The row used to be overflow-x-auto, which
          put a scrollbar under the pills on a phone and hid the last filter
          off-screen — and the brand rules say never a horizontal swipe on
          mobile. Icons and padding shrink below sm so the three stage pills
          sit on one line. */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {FILTERS.map((f, index) => (
          <Fragment key={f.value}>
            {/* All four pills measure 408px against 327px on a phone, so they
                cannot share a line. Left to wrap naturally they split 2/2,
                which reads as an accident. Breaking after "All services"
                puts the three stage filters — 315px — on one line together,
                which is the grouping that means something. */}
            {index === 1 && <div aria-hidden className="basis-full sm:hidden" />}
          <button
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border py-2 text-body transition-colors sm:gap-2 ${f.icon ? "pl-2.5 pr-3.5 sm:pl-4 sm:pr-5" : "px-3.5 sm:px-5"} ${
              filter === f.value
                ? "border-deep-blue bg-deep-blue font-semibold text-white"
                : "border-deep-blue-20 bg-white text-deep-blue hover:border-deep-blue"
            }`}
          >
            {/* currentColor: Deep Blue at rest, white when the pill is active */}
            {f.icon && <Icon name={f.icon} className="h-6 w-6 sm:h-8 sm:w-8" />}
            {f.label}
          </button>
          </Fragment>
        ))}
      </div>
      {/* aria-live so the description change is announced with the filter. */}
      <p
        aria-live="polite"
        className="mx-auto mt-5 max-w-2xl text-center text-body italic text-deep-blue-80"
      >
        {active?.blurb}
      </p>
      {/* Three across on desktop, per the designer's mock. */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group rounded-xl border border-deep-blue-20 bg-white p-7 transition hover:-translate-y-0.5 hover:border-deep-blue hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <Icon name={card.icon} className="h-6 w-6 text-deep-blue" />
            </div>
            <h3 className="mt-4 text-h3">{card.title}</h3>
            <p className="mt-2 text-body text-deep-blue-80">
              {card.description}
            </p>
            {card.whoItsFor && (
              <p className="mt-3 text-caption text-deep-blue-80 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-200 md:group-hover:max-h-16 md:group-hover:opacity-100">
                <span className="font-semibold">Who it&apos;s for:</span>{" "}
                {card.whoItsFor}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
