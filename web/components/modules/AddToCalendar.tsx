"use client";

import { useEffect, useRef, useState } from "react";

export type CalendarLinks = {
  google: string;
  outlook: string;
  ical: string;
};

const OPTIONS = [
  { label: "iCal", key: "ical" },
  { label: "Google", key: "google" },
  { label: "Outlook", key: "outlook" },
] as const;

// Add-to-calendar dropdown: toggles on click, closes on outside click or Esc.
export function AddToCalendar({ links }: { links: CalendarLinks }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 border-b-2 border-sky-blue pb-0.5 text-body font-semibold text-deep-blue"
      >
        <span aria-hidden>+</span> Add to calendar
        <span aria-hidden className={open ? "rotate-180" : undefined}>
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[190px] rounded-xl border border-[#DCDACB] bg-white p-[7px] shadow-[0_16px_40px_rgba(14,47,74,0.18)]">
          {OPTIONS.map((option) => (
            <a
              key={option.key}
              href={links[option.key]}
              {...(option.key === "ical"
                ? { download: "zippily-session.ics" }
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="block rounded-lg px-4 py-2.5 text-body text-deep-blue hover:bg-off-white-tan"
              onClick={() => setOpen(false)}
            >
              {option.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
