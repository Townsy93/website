// Module M27 — Deep Blue newsletter band (distinct from the footer signup).
// HubSpot form wiring lands with the integrations pass.
export function NewsletterBand({
  heading,
  text,
}: {
  heading?: string | null;
  text?: string | null;
}) {
  return (
    <section className="bg-deep-blue text-white">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-h2">{heading ?? "One good email a month."}</h2>
        {text && <p className="mt-4 text-body-lg text-white/65">{text}</p>}
        <form className="mx-auto mt-8 flex max-w-md gap-2">
          <label htmlFor="band-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="band-newsletter-email"
            type="email"
            placeholder="you@company.co.nz"
            className="w-full min-w-0 rounded-full bg-white px-5 py-3 text-body text-deep-blue placeholder:text-deep-blue/50"
          />
          <button
            type="button"
            className="shrink-0 rounded-full bg-deep-orange px-6 py-3 text-body font-semibold text-deep-blue transition hover:bg-orange-hover"
          >
            Sign up
          </button>
        </form>
        <p className="mt-3 text-caption text-white/50">No spam, ever.</p>
      </div>
    </section>
  );
}
