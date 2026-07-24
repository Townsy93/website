"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const FILTERS = [
  { label: "All services", value: "all" },
  { label: "Discover", value: "discover" },
  { label: "Build", value: "build" },
  { label: "Scale", value: "scale" },
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
  const visible = cards.filter(
    (card) => filter === "all" || card.category === filter,
  );
  return (
    <div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`shrink-0 snap-start rounded-full border px-5 py-2 text-body transition-colors ${
              filter === f.value
                ? "border-deep-blue bg-deep-blue font-semibold text-white"
                : "border-deep-blue-20 bg-white text-deep-blue hover:border-deep-blue"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
