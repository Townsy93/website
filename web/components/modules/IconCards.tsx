import { Icon } from "@/components/ui/Icon";

type Card = {
  _key?: string;
  title?: string | null;
  text?: string | null;
  icon?: string | null;
};

// Module M6 — white cards on tan with circular Deep Blue icon chips.
// D4 ruling: icon strokes are Sky Blue, never orange on light sections.
export function IconCards({
  eyebrow,
  heading,
  cards,
  columns = 4,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  cards?: Card[] | null;
  columns?: 3 | 4;
}) {
  const items = (cards ?? []).filter((card) => card.title);
  if (items.length === 0) return null;
  return (
    <section className="bg-off-white-tan">
      <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
        {eyebrow && (
          <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
            {eyebrow}
          </p>
        )}
        {heading && <h2 className="mt-3 max-w-2xl text-h2">{heading}</h2>}
        <div
          className={`mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 ${
            columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {items.map((card) => (
            <div
              key={card._key ?? card.title}
              className="rounded-xl bg-white p-7 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-deep-blue">
                <Icon name={card.icon} className="h-5 w-5 text-sky-blue" />
              </span>
              <h3 className="mt-5 text-h4">{card.title}</h3>
              <p className="mt-2 text-body text-deep-blue-80">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
