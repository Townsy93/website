import { NewsletterForm } from "@/components/modules/NewsletterForm";

// Module M27 — Deep Blue newsletter band (distinct from the footer signup).
// Submits to the HubSpot newsletter form.
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
        <div className="mx-auto mt-8 max-w-md">
          <NewsletterForm />
        </div>
        <p className="mt-3 text-caption text-white/50">No spam, ever.</p>
      </div>
    </section>
  );
}
