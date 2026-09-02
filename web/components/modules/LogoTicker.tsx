import { SanityImage } from "@/components/ui/SanityImage";

type Logo = {
  _key: string;
  asset?: { _ref?: string } | null;
  alt?: string | null;
};

// The client-logo ticker from the homepage trust strip, extracted when the
// designer reused it in the retainer page hero. The track holds the logo set
// twice so the loop is seamless; it pauses entirely for reduced-motion users
// (the .ticker-track keyframes in globals.css). Logos sit on white chips, so
// the ticker reads the same on any dark section. Placeholder blocks scroll
// until logos with display permission exist.
export function LogoTicker({ logos }: { logos?: Logo[] | null }) {
  return (
    <div
      className="min-w-0 flex-1 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="ticker-track flex w-max items-center gap-10">
        {[0, 1].map((half) => (
          <div
            key={half}
            aria-hidden={half === 1}
            className="flex shrink-0 items-center gap-10"
          >
            {(logos?.length ?? 0) > 0
              ? logos?.map((logo) => (
                  <span
                    key={`${half}-${logo._key}`}
                    className="flex h-12 shrink-0 items-center rounded-lg bg-white px-5"
                  >
                    <SanityImage
                      image={logo}
                      width={112}
                      height={28}
                      className="h-6 w-auto object-contain"
                    />
                  </span>
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={`${half}-${i}`}
                    className="h-7 w-28 shrink-0 rounded bg-white/15"
                  />
                ))}
          </div>
        ))}
      </div>
    </div>
  );
}
