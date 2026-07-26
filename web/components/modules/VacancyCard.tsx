import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { vacancyMeta, type VacancyLike } from "@/lib/careers";

const META_ICON = ["building-2", "clock", "map-pin"];

/**
 * A role in the open-positions list.
 *
 * The metadata row wraps rather than truncating on narrow screens — losing
 * "Remote" off the end of a line is the one thing that would make someone
 * skip a role they were qualified for.
 */
export function VacancyCard({ vacancy }: { vacancy: VacancyLike }) {
  const slug = vacancy.slug?.current ?? "";
  const meta = vacancyMeta(vacancy);

  return (
    <article className="rounded-3xl border border-deep-blue/12 bg-white p-6 transition hover:border-deep-blue/35 sm:p-7">
      <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h3 className="text-[20px] text-deep-blue">{vacancy.title}</h3>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {meta.map((item, index) => (
              <li key={item} className="flex items-center gap-1.5 text-[14px] text-body">
                <Icon name={META_ICON[index] ?? "dot"} className="h-4 w-4 text-deep-blue/60" />
                {item}
              </li>
            ))}
          </ul>

          {vacancy.summary && (
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-body">
              {vacancy.summary}
            </p>
          )}
        </div>

        <Link
          href={`/careers/${slug}`}
          className="mt-5 block w-full shrink-0 rounded-full bg-deep-blue px-6 py-3 text-center text-[15px] font-semibold text-white transition hover:bg-deep-blue/90 sm:mt-0 sm:w-auto"
        >
          View role
          <span className="sr-only">: {vacancy.title}</span>
        </Link>
      </div>
    </article>
  );
}
