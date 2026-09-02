"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered count-up for stat values (Sean, Sep 2026: "dynamically
 * increase from 1 for a cool effect").
 *
 * The server renders the FINAL value — so no-JS visitors, crawlers and the
 * first paint all see the real number, and hydration matches. When the
 * element scrolls into view the number drops to 1 and eases up to the
 * target over ~1.4s. Values are parsed as prefix + number + suffix, so
 * "40+" animates 1→40 and keeps its "+", while a non-numeric value like
 * "Xero" renders untouched. Reduced-motion users get the final value with
 * no animation at all.
 */
export function CountUp({
  value,
  className,
}: {
  value?: string | number | null;
  className?: string;
}) {
  const text = String(value ?? "");
  const match = text.match(/^([^0-9]*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : null;
  const useCommas = Boolean(match?.[2].includes(","));
  const ref = useRef<HTMLSpanElement>(null);
  // null = show the real (final) number; a string = mid-animation frame.
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    if (target === null || target <= 1) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const duration = 1400;
        const start = performance.now();
        const format = (n: number) =>
          useCommas ? n.toLocaleString("en-NZ") : String(n);
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // ease-out cubic: fast start, satisfying settle on the target
          const eased = 1 - Math.pow(1 - progress, 3);
          setFrame(format(Math.max(1, Math.round(1 + (target - 1) * eased))));
          if (progress < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            setFrame(null);
          }
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
    // target/useCommas derive from the value prop, stable per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (target === null) return <span className={className}>{text}</span>;
  return (
    <span ref={ref} className={className}>
      {match![1]}
      {frame ?? (useCommas ? target.toLocaleString("en-NZ") : String(target))}
      {match![3]}
    </span>
  );
}
