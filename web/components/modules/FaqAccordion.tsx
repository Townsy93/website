type Faq = { _key?: string; question?: string | null; answer?: string | null };

// Module M26 — native details accordion, mutually exclusive, first open.
// Server-rendered; no client JS.
export function FaqAccordion({
  heading,
  faqs,
  name,
  dark = false,
  layout = "stacked",
}: {
  heading?: string | null;
  faqs?: Faq[] | null;
  name: string;
  dark?: boolean;
  /** "split" puts the heading in a left column — the retainer page mock. */
  layout?: "stacked" | "split";
}) {
  const items = (faqs ?? []).filter((faq) => faq.question && faq.answer);
  if (items.length === 0) return null;
  if (layout === "split") {
    return (
      <section className={dark ? "bg-deep-blue text-white" : "bg-white"}>
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:py-24 lg:grid-cols-[1fr_1.6fr]">
          {heading && <h2 className="max-w-60 text-h2">{heading}</h2>}
          <div className="flex flex-col gap-3">
            {items.map((faq, index) => (
              <details
                key={faq._key ?? faq.question}
                name={name}
                open={index === 0}
                className="group rounded-xl border border-deep-blue-20 bg-white px-5 text-deep-blue"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body-lg font-semibold">
                  {faq.question}
                  <span
                    aria-hidden
                    className="shrink-0 transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 text-body text-deep-blue-80">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={dark ? "bg-deep-blue text-white" : "bg-white"}>
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-24">
        {heading && <h2 className="text-center text-h2">{heading}</h2>}
        <div className="mt-10 flex flex-col gap-3">
          {items.map((faq, index) => (
            <details
              key={faq._key ?? faq.question}
              name={name}
              open={index === 0}
              className="group rounded-xl border border-deep-blue-20 bg-white px-5 text-deep-blue"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body-lg font-semibold">
                {faq.question}
                <span
                  aria-hidden
                  className="shrink-0 transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <p className="max-w-2xl pb-5 text-body text-deep-blue-80">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
