import { ButtonLink } from "@/components/ui/ButtonLink";

type CtaBannerData = {
  heading?: string | null;
  text?: string | null;
  button?: { label?: string | null; href?: string | null } | null;
  showMeetingsEmbed?: boolean | null;
} | null;

// Module M3 — one per page, at the bottom. Deep Blue, divider rule,
// outline-orange button (or the live meetings embed on Home).
export function CtaBanner({
  data,
  meetingsUrl,
}: {
  data?: CtaBannerData;
  meetingsUrl?: string | null;
}) {
  if (!data?.heading) return null;
  return (
    <section className="bg-deep-blue text-white">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-h2">{data.heading}</h2>
        <div className="mx-auto mt-6 h-0.5 w-14 bg-sky-blue" aria-hidden />
        {data.text && (
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/65">
            {data.text}
          </p>
        )}
        {data.showMeetingsEmbed && meetingsUrl ? (
          <div className="mt-10 overflow-hidden rounded-2xl bg-white p-2">
            <iframe
              src={`${meetingsUrl}?embed=true`}
              title="Book a call"
              className="h-165 w-full border-0"
            />
          </div>
        ) : (
          data.button?.href && (
            <ButtonLink
              href={data.button.href}
              variant="orange-outline"
              className="mt-10"
            >
              {data.button.label}
            </ButtonLink>
          )
        )}
      </div>
    </section>
  );
}
