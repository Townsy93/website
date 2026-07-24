import type { ReactNode } from "react";

type MarkerStyle = "circle" | "underline" | "none";

// Hand-drawn marker emphasis (module M4). Orange on Deep Blue sections,
// Sky Blue or Deep Blue on light sections — never a solid highlight fill.
export function Marker({
  style = "circle",
  color = "deep-orange",
  children,
}: {
  style?: MarkerStyle | null;
  color?: "deep-orange" | "sky-blue" | "deep-blue";
  children: ReactNode;
}) {
  if (!style || style === "none") return <span>{children}</span>;
  const stroke = `var(--color-${color})`;
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      {style === "circle" ? (
        <svg
          className="pointer-events-none absolute -inset-x-3 -inset-y-2"
          viewBox="0 0 260 70"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M130 8.4 C 200 3.8 252 14 254 33 C 256 54 196 66 124 65 C 56 64 8 52 6 34 C 4 17 52 6 118 7.5"
            fill="none"
            stroke={stroke}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full"
          viewBox="0 0 260 24"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M4 15 C 60 6, 140 6, 190 11 C 224 14, 246 16, 256 12"
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

// Splits a heading around the emphasis phrase and wraps it in a Marker.
export function EmphasisedHeading({
  heading,
  phrase,
  markerStyle,
  color,
}: {
  heading: string;
  phrase?: string | null;
  markerStyle?: MarkerStyle | null;
  color?: "deep-orange" | "sky-blue" | "deep-blue";
}) {
  if (!phrase || !heading.includes(phrase)) return <>{heading}</>;
  const [before, ...rest] = heading.split(phrase);
  return (
    <>
      {before}
      <Marker style={markerStyle} color={color}>
        {phrase}
      </Marker>
      {rest.join(phrase)}
    </>
  );
}
