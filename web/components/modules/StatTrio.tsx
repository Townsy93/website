type Stat = { _key?: string; value?: string | null; label?: string | null };

// Module M21 — centred stat row with hairline dividers, on Deep Blue.
export function StatTrio({ stats }: { stats?: Stat[] | null }) {
  const items = (stats ?? []).filter((stat) => stat.value);
  if (items.length === 0) return null;
  return (
    <section className="bg-deep-blue text-white">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-12 sm:py-20 text-center md:grid-cols-3 md:divide-x md:divide-white/15">
        {items.map((stat) => (
          <div key={stat._key ?? stat.value} className="px-4">
            <p className="text-5xl font-semibold tracking-heading text-deep-orange">
              {stat.value}
            </p>
            <p className="mt-3 text-body text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
