"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";
import type { CalendarLinks } from "@/components/modules/AddToCalendar";
import type { PanelState } from "@/lib/events";

type Props = {
  eventTitle: string;
  state: PanelState;
  dateLine: string;
  spotsRemaining?: number | null;
  capacity?: number | null;
  price?: number | null;
  venueCaption: string;
  calendar: CalendarLinks;
  startedAtLabel: string;
};

const FIELD =
  "w-full rounded-lg border-[1.5px] border-[#DCDACB] bg-[#FBFBF6] px-3.5 py-3 text-[15px] text-deep-blue placeholder:text-[#8A8A78] focus:border-sky-blue focus:outline-none";
const LABEL = "text-[13px] font-semibold text-deep-blue";

function spotsText(
  state: PanelState,
  spotsRemaining?: number | null,
  capacity?: number | null,
) {
  if (state === "full")
    return `Waitlist only — ${capacity ?? 0} of ${capacity ?? 0} taken`;
  if (state === "nearly-full") return `Only ${spotsRemaining} spots left`;
  if (typeof spotsRemaining === "number" && capacity)
    return `${spotsRemaining} of ${capacity} spots left`;
  return null;
}

export function RegistrationPanel(props: Props) {
  const {
    eventTitle,
    state: initialState,
    dateLine,
    spotsRemaining,
    capacity,
    price,
    venueCaption,
    calendar,
    startedAtLabel,
  } = props;

  const [state, setState] = useState<PanelState>(initialState);
  const [formOpen, setFormOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const isWaitlist = state === "full";
  const isTerminal =
    state === "closed" || state === "past" || state === "registered";

  const heading = isWaitlist ? "Join the waitlist" : "Register";
  const submitLabel = isWaitlist ? "Join the waitlist" : "Confirm my spot";
  const buttonLabel = isWaitlist ? "Join waitlist" : "Register";
  const priceLabel = price && price > 0 ? `$${price.toLocaleString()}` : "Free";
  const spots = spotsText(state, spotsRemaining, capacity);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "");
    const formGuid = HUBSPOT_FORMS.event;
    if (isHubSpotConfigured(formGuid)) {
      setSending(true);
      await submitHubSpotForm(formGuid, {
        firstname: value("firstName"),
        lastname: value("lastName"),
        email: value("email"),
        company: value("company"),
        phone: value("phone"),
        message: [
          `Event: ${eventTitle}`,
          isWaitlist ? "Waitlist request" : "Registration",
          value("goals") && `Wants to get out of it: ${value("goals")}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      setSending(false);
    }
    setState("registered");
    setFormOpen(false);
    setSheetOpen(false);
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>First name</span>
          <input required name="firstName" className={FIELD} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Last name</span>
          <input required name="lastName" className={FIELD} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>Email</span>
        <input required type="email" name="email" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>Company</span>
        <input name="company" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>
          Phone <span className="font-normal text-[#8A8A78]">(optional)</span>
        </span>
        <input type="tel" name="phone" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>
          What would you like to get out of this session?
        </span>
        <textarea name="goals" rows={3} className={FIELD} />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="mt-1 w-full rounded-lg bg-deep-blue py-4 text-body font-semibold text-white transition hover:bg-[#123A5A] disabled:opacity-60"
      >
        {sending ? "Sending…" : submitLabel}
      </button>
      <p className="text-center text-[12.5px] text-[#767666]">
        We&apos;ll only email you about this session.
      </p>
    </form>
  );

  const calendarButtons = (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {(
        [
          ["iCal", calendar.ical],
          ["Google", calendar.google],
          ["Outlook", calendar.outlook],
        ] as const
      ).map(([label, href]) => (
        <a
          key={label}
          href={href}
          {...(label === "iCal"
            ? { download: "zippily-session.ics" }
            : { target: "_blank", rel: "noopener noreferrer" })}
          className="rounded-lg border-[1.5px] border-[#DCDACB] py-2.5 text-center text-[14px] font-semibold text-deep-blue hover:border-deep-blue"
        >
          {label}
        </a>
      ))}
    </div>
  );

  // Terminal states share a simple heading + action shape.
  const terminal = (() => {
    if (state === "registered")
      return (
        <>
          <span
            aria-hidden
            className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-sky-blue/30 text-h4 text-deep-blue"
          >
            ✓
          </span>
          <h2 className="mt-4 text-h3">You&apos;re in</h2>
          <p className="mt-2 text-body text-deep-blue-80">
            We&apos;ve got your spot. Check your inbox for the details.
          </p>
          {calendarButtons}
        </>
      );
    if (state === "closed")
      return (
        <>
          <h2 className="text-h3">Registrations have closed</h2>
          <p className="mt-2 text-body text-deep-blue-80">
            This session is no longer taking registrations — but there&apos;s
            usually another one coming.
          </p>
          <Link
            href="/events"
            className="mt-5 block rounded-lg border-[1.5px] border-deep-blue py-3.5 text-center text-body font-semibold text-deep-blue transition hover:bg-deep-blue hover:text-white"
          >
            See all sessions
          </Link>
        </>
      );
    return (
      <>
        <h2 className="text-h3">This one&apos;s been and gone</h2>
        <p className="mt-2 text-body text-deep-blue-80">
          This session ran on {startedAtLabel}.
        </p>
        <Link
          href="/events"
          className="mt-5 block rounded-lg bg-deep-blue py-3.5 text-center text-body font-semibold text-white transition hover:bg-[#123A5A]"
        >
          See the next session
        </Link>
      </>
    );
  })();

  return (
    <>
      {/* Desktop sticky panel */}
      <aside className="sticky top-26 hidden rounded-[18px] border border-[#DCDACB] bg-white p-7.5 shadow-[0_4px_20px_rgba(14,47,74,0.07)] lg:block">
        {isTerminal ? (
          terminal
        ) : (
          <>
            <h2 className="text-h3">{heading}</h2>
            <div className="flex flex-col gap-3.5 border-b border-[#EAE8DC] pb-5.5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-body text-[#767666]">Price</span>
                <span className="text-h3 font-semibold">{priceLabel}</span>
              </div>
              <p className="text-body font-semibold text-deep-blue">
                {dateLine}
              </p>
              {spots &&
                (state === "nearly-full" ? (
                  <p className="rounded-lg bg-sky-blue/28 px-3.5 py-2.5 text-[16px] font-semibold text-deep-blue">
                    {spots}
                  </p>
                ) : (
                  <p className="text-[15.5px] font-semibold text-deep-blue-80">
                    {spots}
                  </p>
                ))}
            </div>
            {formOpen ? (
              <div className="mt-5.5">{form}</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="mt-5.5 w-full rounded-lg bg-deep-blue py-4 text-body font-semibold text-white transition hover:bg-[#123A5A]"
                >
                  {buttonLabel}
                </button>
                <p className="mt-3 text-center text-[13.5px] text-[#767666]">
                  {venueCaption}
                </p>
              </>
            )}
          </>
        )}
      </aside>

      {/* Mobile fixed bar */}
      <div className="fixed inset-x-0 bottom-0 z-70 border-t border-[#DCDACB] bg-white px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-[0_-8px_26px_rgba(14,47,74,0.14)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            {isTerminal ? (
              <p className="text-body font-semibold text-deep-blue">
                {state === "registered"
                  ? "You're in — see you there"
                  : state === "closed"
                    ? "Registrations have closed"
                    : "This one's been and gone"}
              </p>
            ) : (
              <>
                <p className="text-[16px] font-semibold text-deep-blue">
                  {priceLabel}
                  {isWaitlist ? " · waitlist" : ""}
                </p>
                {spots && (
                  <p
                    className={`text-[13.5px] ${
                      state === "nearly-full"
                        ? "font-semibold text-deep-blue"
                        : "text-[#767666]"
                    }`}
                  >
                    {spots}
                  </p>
                )}
              </>
            )}
          </div>
          {isTerminal ? (
            <Link
              href="/events"
              className="shrink-0 rounded-lg border-[1.5px] border-deep-blue px-6 py-3 text-body font-semibold text-deep-blue"
            >
              All sessions
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="shrink-0 rounded-lg bg-deep-blue px-6.5 py-3.5 text-body font-semibold text-white"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Mobile sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-80 flex items-end bg-deep-blue/50 lg:hidden">
          <div className="max-h-[520px] w-full overflow-y-auto rounded-t-[20px] bg-white px-5.5 pb-6 pt-5 shadow-[0_-14px_40px_rgba(14,47,74,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-h3">{heading}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSheetOpen(false)}
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-off-white-tan text-deep-blue"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 mt-2 text-[14.5px] text-[#767666]">
              {dateLine}
              {spots ? ` · ${spots}` : ""}
            </p>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
