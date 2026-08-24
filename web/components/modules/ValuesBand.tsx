type ValueCard = {
  _key: string;
  title?: string | null;
  text?: string | null;
};

// The numbered values block from the homepage v2 pass, extracted when the
// designer reused it on the Services landing (Aug 2026) — split head, then
// the four values in 01–04 columns. The aside is Deep Blue italic (orange is
// banned on white, Sky Blue fails contrast on it); numerals are Sky Blue at
// h3 size per the "this read as small print" note.
export function ValuesBand({
  heading,
  aside,
  intro = "These four decide what we build, what we don't, and how we talk to you while we do it. They're the difference between a portal that gets used and one that gets abandoned.",
  cards,
  padding = "py-14 sm:py-24",
}: {
  heading?: string | null;
  aside?: string | null;
  intro?: string | null;
  cards?: ValueCard[] | null;
  /** The homepage runs this tight under the section above it. */
  padding?: string;
}) {
  if (!heading || (cards?.length ?? 0) === 0) return null;
  return (
    <section className="bg-white">
      <div className={`mx-auto max-w-[90rem] px-6 ${padding}`}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-h2">{heading}</h2>
            {aside && (
              <p className="mt-2 text-body-lg font-medium italic text-deep-blue">
                {aside}
              </p>
            )}
          </div>
          <div>
            <p className="text-body-lg font-semibold uppercase tracking-[0.1em] text-deep-blue">
              Why zippily
            </p>
            {intro && (
              <p className="mt-3 max-w-xl text-body-lg text-deep-blue-80">
                {intro}
              </p>
            )}
          </div>
        </div>
        <div className="mt-14 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {cards?.map((card, index) => (
            <div
              key={card._key}
              className="border-t border-deep-blue/15 pt-6 lg:border-l lg:border-t-0 lg:px-7 lg:pt-0 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="text-h3 font-semibold text-sky-blue">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-h3">{card.title}</h3>
              <p className="mt-3 text-body-lg text-deep-blue-80">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
