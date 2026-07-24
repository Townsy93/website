import Link from "next/link";
import type { ReactNode } from "react";

type Variant =
  | "orange" // solid orange — Deep Blue sections only
  | "orange-outline" // outline orange, fills on hover — Deep Blue sections only
  | "navy" // solid Deep Blue — light sections
  | "navy-outline" // outline Deep Blue — light sections
  | "ghost-light"; // outline white — Deep Blue sections

const STYLES: Record<Variant, string> = {
  orange:
    "bg-deep-orange text-deep-blue font-semibold hover:bg-orange-hover",
  "orange-outline":
    "border-2 border-deep-orange text-deep-orange font-semibold hover:bg-deep-orange hover:text-deep-blue",
  navy: "bg-deep-blue text-white font-semibold hover:bg-deep-blue/90",
  "navy-outline":
    "border-2 border-deep-blue text-deep-blue font-semibold hover:bg-deep-blue hover:text-white",
  "ghost-light":
    "border-2 border-white/40 text-white font-semibold hover:border-white",
};

export function ButtonLink({
  href,
  variant = "navy",
  children,
  className = "",
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-full px-6 py-3 text-body transition-colors ${STYLES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
