import { ButtonLink } from "@/components/ui/ButtonLink";

type CtaBannerData = {
  heading?: string | null;
  text?: string | null;
  button?: { label?: string | null; href?: string | null } | null;
  showMeetingsEmbed?: boolean | null;
} | null;

// Module M3 — one per page, at the bottom. Two variants:
//
// Plain (most pages): Deep Blue, centred, divider rule, outline-orange
// button.
//
// Meetings embed (Home): Sky Blue background with the heading in a 1/3
// column and the booking widget in the 2/3 column beside it — the embed is
// tall, and centred-stacked it consumed a whole viewport. Sky Blue is the
// designer's pick so the block reads as its own thing rather than blending
// into the Deep Blue newsletter band and footer below it. Deep Blue text on
// Sky Blue; no orange here — orange only ever sits on Deep Blue.
export function CtaBanner({
  data,
  meetingsUrl,
}: {
  data?: CtaBannerData;
  meetingsUrl?: string | null;
}) {
  if (!data?.heading) return null;

  if (data.showMeetingsEmbed && meetingsUrl) {
    return (
      <section className="bg-sky-blue text-deep-blue">
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-14">
          <div>
            <h2 className="text-h2">{data.heading}</h2>
            <div className="mt-6 h-0.5 w-14 bg-deep-blue" aria-hidden />
            {data.text && (
              <p className="mt-6 max-w-md text-body-lg text-deep-blue/80">
                {data.text}
              </p>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
            <iframe
              src={`${meetingsUrl}?embed=true`}
              title="Book a call"
              className="h-165 w-full border-0"
            />
          </div>
        </div>
      </section>
    );
  }

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
        {data.button?.href && (
          <ButtonLink
            href={data.button.href}
            variant="orange-outline"
            className="mt-10"
          >
            {data.button.label}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
