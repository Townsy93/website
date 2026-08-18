import { ButtonLink } from "@/components/ui/ButtonLink";
import { QuoteMark } from "@/components/ui/QuoteMark";

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
// The oversized watermark is deliberate: Deep Blue ~8% lightness above the
// section base, behind the cards, baseline on the section's bottom edge.
// "CLIENT FEEDBACK" is set in caps, and no letter in it has a descender —
// so baseline-on-the-edge means the WHOLE word is visible. The first cut
// carried a descender offset that cropped the bottom of every letter, which
// is what Sean flagged as "cut off halfway". The section reserves room for
// the word with viewport-proportional padding, so no height fits by luck.
export function TestimonialCards({
  heading,
  subheading,
  testimonials,
  action,
  watermark,
  appearance = "solid",
}: {
  heading?: string | null;
  subheading?: string | null;
  testimonials?: Testimonial[] | null;
  action?: { label: string; href: string } | null;
  watermark?: string | null;
  /**
   * "solid" is the homepage v2 white card; "outline" is the About design's
   * transparent card with a hairline border. On outline cards the role sits
   * in Deep Orange — permitted, because the card is transparent and the
   * orange rests on the section's Deep Blue.
   */
  appearance?: "solid" | "outline";
}) {
  const items = (testimonials ?? []).filter((t) => t.quote);
  if (items.length === 0) return null;
  return (
    <section className="relative overflow-hidden bg-deep-blue text-white">
      <div
        className={`mx-auto max-w-[90rem] px-6 pt-24 ${
          watermark ? "pb-[calc(8.6vw+5rem)]" : "pb-14 sm:pb-24"
        }`}
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
              className={`min-w-72 snap-start rounded-xl p-7 md:min-w-0 ${
                appearance === "outline"
                  ? "border border-white/25 text-white"
                  : "bg-white text-deep-blue"
              }`}
            >
              <QuoteMark className="h-9 w-9" />
              <blockquote className="mt-5 text-body-lg">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-body font-semibold">{t.name}</p>
                {/* Solid cards: Deep Blue at 70% — orange never sits on
                    white. Outline cards: Deep Orange, resting on the
                    section's Deep Blue through the transparent card. */}
                <p
                  className={`text-caption ${
                    appearance === "outline"
                      ? "text-deep-orange"
                      : "text-deep-blue/70"
                  }`}
                >
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
          // Full width, per the designer: 11.35vw sets the measured 8.68em word at
          // ~100vw, so the C and K sit at the viewport edges. No rem cap —
          // a cap would stop it short of full width on wide screens. Sized
          // against the viewport, not the 90rem container, because the
          // section background is full-bleed and so is the word.
          className="pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2 translate-y-[0.16em] select-none whitespace-nowrap text-[11.35vw] font-bold uppercase leading-none tracking-[-0.04em] text-[#1B4062]"
        >
          {watermark}
        </div>
      )}
    </section>
  );
}
