import { ButtonLink } from "@/components/ui/ButtonLink";
import { CountUp } from "@/components/ui/CountUp";
import { SanityImage } from "@/components/ui/SanityImage";
import { VimeoEmbed } from "@/components/modules/VimeoEmbed";

type Stat = { _key: string; value?: string | null; label?: string | null };

// The rounded Deep Blue case-study feature card — text and stats left,
// photo right — from the designer's retainer and platforms mocks. Shared so
// the treatment can't drift. Stats render orange on the Deep Blue card (the
// permitted pairing); the button only renders for a live story.
//
// When the case study has a film, `videoUrl` swaps the photo pane for the
// click-to-play facade (poster + play button; the Vimeo iframe only loads
// on click). The photo is the fallback, not a companion.
export function CaseFeature({
  eyebrow,
  heading,
  body,
  stats,
  href,
  buttonLabel = "Read the full story",
  image,
  imageLabel,
  videoUrl,
  posterUrl,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  stats?: Stat[] | null;
  href?: string | null;
  buttonLabel?: string;
  image?: { asset?: { _ref?: string } | null; alt?: string | null } | null;
  imageLabel?: string;
  videoUrl?: string | null;
  posterUrl?: string | null;
}) {
  const visibleStats = (stats ?? []).slice(0, 2);
  return (
    <div className="grid overflow-hidden rounded-3xl bg-deep-blue text-white lg:grid-cols-[1.1fr_1fr]">
      <div className="p-10 lg:p-14">
        {eyebrow && (
          <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-4 text-pretty text-h2">{heading}</h2>
        {body && (
          <p className="mt-5 max-w-xl text-body-lg text-white/75">{body}</p>
        )}
        {visibleStats.length > 0 && (
          <div className="mt-8 flex items-stretch gap-6">
            {visibleStats.map((stat, index) => (
              <div key={stat._key} className="flex items-stretch gap-6">
                {index > 0 && (
                  <span aria-hidden className="w-px self-stretch bg-white/25" />
                )}
                <div>
                  <p className="text-h2 font-semibold leading-none text-deep-orange">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="mt-2 max-w-36 text-caption text-white/75">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {href && (
          <ButtonLink href={href} variant="orange" className="mt-9">
            {buttonLabel}
          </ButtonLink>
        )}
      </div>
      {videoUrl ? (
        // A fixed height on mobile, the text column's height on desktop —
        // same box the photo occupies; the card's own rounding clips it.
        <div className="relative h-64 w-full lg:h-full lg:min-h-96">
          <VimeoEmbed
            fill
            url={videoUrl}
            title={`${heading ?? "Case study"} — video`}
            posterUrl={posterUrl}
          />
        </div>
      ) : (
        <SanityImage
          image={image}
          width={720}
          height={560}
          className="h-64 w-full object-cover lg:h-full"
          placeholderLabel={imageLabel ?? "Project photo"}
        />
      )}
    </div>
  );
}
