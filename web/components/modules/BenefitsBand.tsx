import Link from "next/link";

type Benefit = { _key: string; heading?: string | null; text?: string | null };

// The numbered Deep Blue benefits band from the retainer page's mock, now
// shared: any service with benefits content renders it (the CRM page's
// copywriter "Why us?" section uses it too). Numerals Sky Blue — the
// numbered-block standard.
export function BenefitsBand({
  eyebrow,
  heading,
  intro,
  benefits,
  action,
}: {
  eyebrow: string;
  heading?: string | null;
  intro?: string | null;
  benefits?: Benefit[] | null;
  action?: { label: string; href: string } | null;
}) {
  if ((benefits?.length ?? 0) === 0) return null;
  const cols =
    (benefits?.length ?? 0) >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <section className="bg-deep-blue text-white">
      <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
              {eyebrow}
            </p>
            {heading && <h2 className="mt-3 text-h2">{heading}</h2>}
          </div>
          <div className="lg:self-end">
            {intro && <p className="text-body-lg text-white/70">{intro}</p>}
            {action && (
              <Link
                href={action.href}
                className="mt-3 inline-block text-body font-semibold text-deep-orange underline decoration-deep-orange decoration-2 underline-offset-4"
              >
                {action.label} →
              </Link>
            )}
          </div>
        </div>
        <div className={`mt-14 grid gap-y-8 sm:grid-cols-2 ${cols}`}>
          {benefits?.map((benefit, index) => (
            <div
              key={benefit._key}
              className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:px-7 lg:pt-0 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="text-h3 font-semibold text-sky-blue">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-h4">{benefit.heading}</h3>
              <p className="mt-3 text-body text-white/75">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
