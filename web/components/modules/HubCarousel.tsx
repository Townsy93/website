"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export type HubCardData = {
  _id: string;
  name?: string | null;
  eyebrow?: string | null;
  description?: string | null;
  icon?: string | null;
  isFeatured?: boolean | null;
  linkedService?: {
    title?: string | null;
    slug?: { current?: string | null } | null;
  } | null;
};

// Module M12 — Platforms hub carousel. Scroll-snap track with arrow
// buttons; all card content is in the page HTML (SEO requirement).
export function HubCarousel({ hubs }: { hubs: HubCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 364, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-deep-blue-20 bg-white text-deep-blue transition hover:border-deep-blue"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-deep-blue text-white transition hover:bg-deep-blue/90"
        >
          →
        </button>
      </div>
      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {hubs.map((hub) => {
          const featured = Boolean(hub.isFeatured);
          return (
            <div
              key={hub._id}
              className={`w-80 shrink-0 snap-start rounded-2xl p-7 transition hover:-translate-y-0.5 ${
                featured
                  ? "bg-deep-blue text-white shadow-lg"
                  : "bg-white text-deep-blue shadow-sm"
              }`}
            >
              <span
                className={`flex h-13 w-13 items-center justify-center rounded-xl ${
                  featured ? "bg-deep-orange" : "bg-deep-blue"
                }`}
              >
                <Icon
                  name={hub.icon}
                  className={`h-6 w-6 ${featured ? "text-deep-blue" : "text-sky-blue"}`}
                />
              </span>
              <p
                className={`mt-5 text-caption font-semibold uppercase tracking-[0.08em] ${
                  featured ? "text-deep-orange" : "text-deep-blue-80"
                }`}
              >
                {hub.eyebrow}
              </p>
              <h3 className="mt-2 text-h3">{hub.name}</h3>
              <p
                className={`mt-3 text-body ${featured ? "text-white/70" : "text-deep-blue-80"}`}
              >
                {hub.description}
              </p>
              {hub.linkedService?.slug?.current && (
                <Link
                  href={`/services/${hub.linkedService.slug.current}`}
                  className={`mt-5 inline-block text-body font-semibold underline decoration-2 underline-offset-4 ${
                    featured
                      ? "text-deep-orange decoration-deep-orange"
                      : "text-deep-blue decoration-sky-blue"
                  }`}
                >
                  {hub.linkedService.title} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
