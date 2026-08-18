export type StatItem = { value?: number | null; label: string };

/**
 * The trust-stats band — three big numbers with short, centred dividers
 * between them, per the designer's case study layout. Shared by Home, About
 * and the case study pages so the treatment can never drift between them.
 *
 * Counts come from Site settings via the caller; entries without a positive
 * value are dropped rather than rendering "0", and the whole band renders
 * nothing when no stat survives.
 */
export function StatsBand({
  stats,
  background = "bg-sky-blue/15",
}: {
  stats: StatItem[];
  background?: string;
}) {
  const visible = stats.filter((stat) => (stat.value ?? 0) > 0);
  if (visible.length === 0) return null;
  return (
    <section className={background}>
      <div className="mx-auto flex max-w-[90rem] flex-col items-center px-6 py-6 text-center sm:flex-row sm:items-stretch sm:justify-center">
        {visible.map((stat, index) => (
          <div key={stat.label} className="contents">
            {/* Divider: short and centred per the design, never full-height. */}
            {index > 0 && (
              <span
                aria-hidden
                className="h-px w-16 bg-deep-blue/20 sm:h-24 sm:w-px sm:self-center"
              />
            )}
            <div className="px-6 py-7 sm:flex sm:w-64 sm:flex-col sm:justify-center sm:py-14">
              <p className="text-[clamp(2.5rem,3.5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-deep-blue">
                {stat.value}
              </p>
              <p className="mx-auto mt-3 max-w-45 text-body text-deep-blue-80">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
