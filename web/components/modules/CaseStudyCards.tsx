import Link from "next/link";
import { SanityImage } from "@/components/ui/SanityImage";

export type CaseStudyCardData = {
  _id: string;
  client?: string | null;
  slug?: { current?: string | null } | null;
  resultLine?: string | null;
  photo?: { asset?: { _ref?: string } | null; alt?: string | null } | null;
  status?: string | null;
  tag?: string | null; // service title in service contexts, industry title on industry pages (D11)
};

// Module M10 — case study card grid with the "coming soon" state.
export function CaseStudyCards({ items }: { items: CaseStudyCardData[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((caseStudy) => {
        const comingSoon = caseStudy.status === "comingSoon";
        const inner = (
          <>
            <div className="relative">
              <SanityImage
                image={caseStudy.photo}
                width={400}
                height={210}
                className="h-48 w-full object-cover"
                placeholderLabel={comingSoon ? "Story coming soon" : "Project photo"}
              />
              {caseStudy.tag && (
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-caption font-semibold ${
                    comingSoon
                      ? "bg-deep-blue/10 text-deep-blue"
                      : "bg-deep-blue text-white"
                  }`}
                >
                  {caseStudy.tag}
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-h4">{caseStudy.client}</h3>
              <p className="mt-2 text-body text-deep-blue-80">
                {caseStudy.resultLine}
              </p>
              <p className="mt-4 text-caption font-semibold uppercase tracking-[0.08em] text-sky-blue">
                {comingSoon ? "Story coming soon" : "Read the story →"}
              </p>
            </div>
          </>
        );
        const cardClass =
          "overflow-hidden rounded-xl border border-deep-blue-10 bg-white shadow-sm";
        return comingSoon ? (
          <div key={caseStudy._id} className={`${cardClass} opacity-90`}>
            {inner}
          </div>
        ) : (
          <Link
            key={caseStudy._id}
            href={`/our-work/${caseStudy.slug?.current}`}
            className={`${cardClass} transition hover:-translate-y-0.5 hover:shadow-lg`}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
