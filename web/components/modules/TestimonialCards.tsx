import { ButtonLink } from "@/components/ui/ButtonLink";

type Testimonial = {
  _id?: string;
  quote?: string | null;
  name?: string | null;
  role?: string | null;
  company?: string | null;
};

// Module M24 (static 3-up variant) — white quote cards on Deep Blue,
// per the v2 designer pass. Mobile: horizontal scroll-snap swipe.
//
// The oversized watermark is deliberate, not clipped-by-accident: Deep Blue
// ~8% lightness above the section base, fully behind the cards, baseline on
// the section's bottom edge so the descenders crop on purpose. On mobile it
// scales down instead of cropping further — it should still read as a word
// on a 380px viewport.
export function TestimonialCards({
  heading,
  subheading,
  testimonials,
  action,
  watermark,
}: {
  heading?: string | null;
  subheading?: string | null;
  testimonials?: Testimonial[] | null;
  action?: { label: string; href: string } | null;
  watermark?: string | null;
}) {
  const items = (testimonials ?? []).filter((t) => t.quote);
  if (items.length === 0) return null;
  return (
    <section className="relative overflow-hidden bg-deep-blue text-white">
      <div
        className={`mx-auto max-w-[90rem] px-4 pt-24 sm:px-6 ${watermark ? "pb-36" : "pb-24"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {heading && <h2 className="text-h2">{heading}</h2>}
            {subheading && (
              <p className="mt-3 text-body-lg text-white/70">{subheading}</p>
            )}
          </div>
          {action?.href && (
            <ButtonLink href={action.href} variant="orange">
              {action.label}
            </ButtonLink>
          )}
        </div>
        <div className="relative z-10 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {items.map((t) => (
            <figure
              key={t._id ?? t.name}
              className="min-w-72 snap-start rounded-xl bg-white p-7 text-deep-blue md:min-w-0"
            >
              <blockquote className="text-body-lg">“{t.quote}”</blockquote>
              <figcaption className="mt-5">
                <p className="text-body font-semibold">{t.name}</p>
                {/* Deep Blue at 70% — orange never sits on white, and Sky
                    Blue fails contrast on it. */}
                <p className="text-caption text-deep-blue/70">
                  {[t.role, t.company].filter(Boolean).join(", ")}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="relative z-10 mt-4 text-caption text-white/50 md:hidden">
          Swipe for more →
        </p>
      </div>
      {watermark && (
        <div
          aria-hidden
          // 9.2vw, because "CLIENT FEEDBACK" is ~9.9em wide at this weight
          // and tracking: 9.9em × 9.2vw ≈ 91vw, so the whole word is always
          // on screen. The old 12.5vw put it at ~124vw — cropped at both
          // ends, which read as a mistake rather than a motif. Only the
          // descender crop at the bottom edge is deliberate.
          className="pointer-events-none absolute -bottom-[0.22em] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap text-[clamp(2rem,9.2vw,8.5rem)] font-bold uppercase tracking-[-0.04em] text-[#1B4062]"
        >
          {watermark}
        </div>
      )}
    </section>
  );
}
