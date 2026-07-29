"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HUBSPOT_FORMS, isHubSpotConfigured, submitHubSpotForm } from "@/lib/hubspot";
import { dismissalKey, scrollPercent, shouldShowOnPath } from "@/lib/popup";

export type PopupData = {
  _id: string;
  heading?: string | null;
  body?: string | null;
  mode?: "form" | "cta" | null;
  buttonLabel?: string | null;
  ctaHref?: string | null;
  successMessage?: string | null;
  triggerType?: "exitIntent" | "timeOnPage" | "scrollDepth" | null;
  triggerSeconds?: number | null;
  triggerPercent?: number | null;
  showAgainAfterDays?: number | null;
  includePaths?: string[] | null;
  excludePaths?: string[] | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

// Exit intent needs a pointer that can leave the top of the window, which a
// touch device does not have. Rather than excluding every phone visitor from
// an exit-intent campaign, fall back to a time trigger there.
const TOUCH_EXIT_FALLBACK_SECONDS = 25;

export function Popup({ popup }: { popup: PopupData | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  const eligible = popup !== null && shouldShowOnPath(pathname ?? "/", popup);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (!popup) return;
    try {
      const days = popup.showAgainAfterDays ?? 30;
      window.localStorage.setItem(
        dismissalKey(popup._id),
        String(Date.now() + days * 86_400_000),
      );
    } catch {
      // Private browsing can refuse storage. Failing to record a dismissal is
      // not worth breaking the page over; the popup simply may reappear.
    }
  }, [popup]);

  // Arm whichever trigger is configured.
  useEffect(() => {
    if (!eligible || !popup) return;

    try {
      const until = window.localStorage.getItem(dismissalKey(popup._id));
      if (until && Number(until) > Date.now()) return;
    } catch {
      // Storage unavailable: treat as not dismissed rather than never showing.
    }

    const show = () => setOpen(true);
    const cleanups: Array<() => void> = [];
    const isTouch = window.matchMedia("(hover: none)").matches;
    const trigger = popup.triggerType ?? "timeOnPage";

    if (trigger === "exitIntent" && !isTouch) {
      const onLeave = (event: MouseEvent) => {
        if (event.clientY <= 0) show();
      };
      document.addEventListener("mouseout", onLeave);
      cleanups.push(() => document.removeEventListener("mouseout", onLeave));
    } else if (trigger === "scrollDepth") {
      const target = popup.triggerPercent ?? 50;
      const onScroll = () => {
        const pct = scrollPercent(
          window.scrollY,
          window.innerHeight,
          document.documentElement.scrollHeight,
        );
        if (pct >= target) show();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // A short page is already "fully scrolled".
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    } else {
      const seconds =
        trigger === "exitIntent"
          ? TOUCH_EXIT_FALLBACK_SECONDS
          : (popup.triggerSeconds ?? 20);
      const timer = window.setTimeout(show, seconds * 1000);
      cleanups.push(() => window.clearTimeout(timer));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [eligible, popup, pathname]);

  // Focus management. A modal that leaves focus behind it is unusable by
  // keyboard and screen reader, which is worse than not having one.
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, dismiss]);

  if (!open || !popup) return null;

  const isForm = (popup.mode ?? "form") === "form";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-blue/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-heading"
        className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          // 44px, comfortably past the 24px WCAG 2.2 target size minimum.
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-deep-blue transition hover:bg-off-white-tan"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            &times;
          </span>
        </button>

        {popup.imageUrl && (
          <div className="relative hidden min-h-[16rem] md:block">
            <Image
              src={popup.imageUrl}
              alt={popup.imageAlt ?? ""}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className={`p-8 ${popup.imageUrl ? "" : "md:col-span-2"}`}>
          <h2 id="popup-heading" className="text-h3 text-deep-blue">
            {popup.heading}
          </h2>
          {popup.body && <p className="mt-3 text-body text-deep-blue-80">{popup.body}</p>}

          {state === "done" ? (
            <p className="mt-6 text-body font-semibold text-deep-blue">
              {popup.successMessage ?? "Got it — check your inbox."}
            </p>
          ) : isForm ? (
            <form
              className="mt-6 flex flex-col gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const formGuid = HUBSPOT_FORMS.newsletter;
                if (!isHubSpotConfigured(formGuid)) {
                  setState("done");
                  return;
                }
                setState("sending");
                const result = await submitHubSpotForm(formGuid, { email });
                setState(result.ok ? "done" : "error");
              }}
            >
              <label htmlFor="popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="popup-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.co.nz"
                className="w-full rounded-full border border-deep-blue-20 bg-white px-5 py-3 text-body text-deep-blue placeholder:text-deep-blue-80/50 focus:border-sky-blue focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-full bg-deep-orange px-6 py-3 text-body font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : (popup.buttonLabel ?? "Send it to me")}
              </button>
              {state === "error" && (
                <p role="alert" className="text-caption text-deep-blue-80">
                  That didn&apos;t send. Try again, or email hello@zippily.co.nz.
                </p>
              )}
            </form>
          ) : (
            <Link
              href={popup.ctaHref ?? "/"}
              onClick={dismiss}
              className="mt-6 inline-block rounded-full bg-deep-orange px-6 py-3 text-body font-semibold text-white transition hover:brightness-95"
            >
              {popup.buttonLabel ?? "Find out more"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
