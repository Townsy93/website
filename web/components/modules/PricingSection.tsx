import { ButtonLink } from "@/components/ui/ButtonLink";

type Tier = {
  _key: string;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  priceSuffix?: string | null;
  custom?: boolean | null;
  featured?: boolean | null;
  features?: string[] | null;
  ctaLabel?: string | null;
};

type PricingSource = {
  confirmed?: boolean | null;
  tiers?: Tier[] | null;
  fallbackText?: string | null;
} | null;

// Module M18 — the pricing section, extracted from the service template so
// the bespoke retainer page renders the identical block. Never renders tiers
// unless the source is confirmed; the column count follows the tier count
// so a two-tier row centres instead of leaving an empty third column.
export function PricingSection({
  pricingTable,
  pricing,
}: {
  pricingTable?: PricingSource;
  pricing?: PricingSource;
}) {
  const pricingSource = pricingTable ?? pricing;
  const pricingConfirmed = Boolean(pricingSource?.confirmed);
  const tiers = pricingConfirmed ? (pricingSource?.tiers ?? []) : [];
  return (
      <section id="pricing" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <h2 className="text-center text-h2">
            {pricingConfirmed ? "Honest, fixed pricing" : "Pricing"}
          </h2>
          {pricingConfirmed && tiers.length > 0 ? (
            // Two tiers in a three-column grid leave an empty third column
            // and the pair sits left of the centred heading — so the column
            // count follows the tier count, capped at three.
            <div
              className={`mx-auto mt-12 grid items-stretch gap-6 ${
                tiers.length >= 3
                  ? "md:grid-cols-3"
                  : tiers.length === 2
                    ? "max-w-4xl md:grid-cols-2"
                    : "max-w-md"
              }`}
            >
              {tiers.map((tier) => {
                const featured = Boolean(tier.featured);
                return (
                  <div
                    key={tier._key}
                    className={`relative flex flex-col rounded-2xl p-8 ${
                      featured
                        ? "bg-deep-blue text-white shadow-xl"
                        : "border border-deep-blue-20 bg-white"
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-deep-orange px-4 py-1 text-caption font-semibold text-deep-blue">
                        Most teams pick this
                      </span>
                    )}
                    <h3 className="text-h3">{tier.name}</h3>
                    {tier.description && (
                      <p
                        className={`mt-1 text-body ${featured ? "text-white/70" : "text-deep-blue-80"}`}
                      >
                        {tier.description}
                      </p>
                    )}
                    <p className="mt-5 text-h2">
                      {/* An Enterprise tier is scoped per deal. Showing a
                          floor price here would be read as a list price. */}
                      {tier.custom || typeof tier.price !== "number"
                        ? "Custom"
                        : `$${tier.price.toLocaleString()}`}
                      <span
                        className={`ml-2 text-caption ${featured ? "text-white/60" : "text-deep-blue-80"}`}
                      >
                        {tier.custom ? "scoped per project" : tier.priceSuffix}
                      </span>
                    </p>
                    <ul
                      className={`mt-6 flex flex-1 flex-col gap-2.5 border-t pt-6 ${
                        featured ? "border-white/15" : "border-deep-blue-10"
                      }`}
                    >
                      {tier.features?.map((feature) => (
                        <li key={feature} className="flex gap-2.5 text-body">
                          <span
                            aria-hidden
                            className={featured ? "text-deep-orange" : "text-sky-blue"}
                          >
                            ✓
                          </span>
                          <span className={featured ? "text-white/85" : "text-deep-blue-80"}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <ButtonLink
                      href="/contact"
                      variant={featured ? "orange" : "navy-outline"}
                      className="mt-7 text-center"
                    >
                      {tier.ctaLabel ?? `Start with ${tier.name}`}
                    </ButtonLink>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-xl rounded-2xl border-2 border-dashed border-deep-blue-20 bg-white p-10 text-center">
              <h3 className="text-h3">
                {pricingSource?.fallbackText ?? "This one's scoped individually"}
              </h3>
              <p className="mt-3 text-body text-deep-blue-80">
                Every project gets a fixed, transparent quote up front — scoped
                to what your team actually needs.
              </p>
              <ButtonLink href="/contact" variant="navy" className="mt-6">
                Get a fixed quote
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
  );
}
