type Testimonial = {
  _id?: string;
  quote?: string | null;
  name?: string | null;
  role?: string | null;
  company?: string | null;
};

// Module M24 (static 3-up variant) — quote cards on Deep Blue.
// Mobile: horizontal scroll-snap swipe, matching the prototype.
export function TestimonialCards({
  heading,
  subheading,
  testimonials,
}: {
  heading?: string | null;
  subheading?: string | null;
  testimonials?: Testimonial[] | null;
}) {
  const items = (testimonials ?? []).filter((t) => t.quote);
  if (items.length === 0) return null;
  return (
    <section className="bg-deep-blue text-white">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        {heading && <h2 className="text-h2">{heading}</h2>}
        {subheading && (
          <p className="mt-3 text-body-lg text-white/70">{subheading}</p>
        )}
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {items.map((t) => (
            <figure
              key={t._id ?? t.name}
              className="min-w-72 snap-start rounded-xl border border-white/20 p-7 md:min-w-0"
            >
              <blockquote className="text-body-lg">“{t.quote}”</blockquote>
              <figcaption className="mt-5">
                <p className="text-body font-semibold">{t.name}</p>
                <p className="text-caption text-sky-blue">
                  {[t.role, t.company].filter(Boolean).join(", ")}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-caption text-white/50 md:hidden">
          Swipe for more →
        </p>
      </div>
    </section>
  );
}
