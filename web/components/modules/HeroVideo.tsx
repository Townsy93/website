import { buildVimeoEmbedUrl, parseVimeoUrl } from "@/lib/vimeo";

/**
 * The hero brand video — a muted, looping, chrome-less Vimeo player that
 * behaves as a moving image. Deliberately not the VimeoEmbed facade: a hero
 * video plays on arrival or it is a broken-looking poster, and because it is
 * muted there is no sound to justify a click-to-start gate.
 *
 * Server component on purpose — there is no state, so no client bundle.
 */
export function HeroVideo({
  url,
  className = "",
}: {
  url?: string | null;
  className?: string;
}) {
  const ref = url ? parseVimeoUrl(url) : null;
  // Unparseable renders nothing; the caller falls back to the hero image.
  if (!ref) return null;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-deep-blue ${className}`}
    >
      <iframe
        src={buildVimeoEmbedUrl(ref, { background: true })}
        title="Zippily brand video"
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
