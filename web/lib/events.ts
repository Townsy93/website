// Event date handling. Everything renders in Pacific/Auckland regardless of
// the visitor's timezone, and every bucket derives from startDateTime.

const TZ = "Pacific/Auckland";

const fmt = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-NZ", { timeZone: TZ, ...options }).format(
    new Date(value),
  );

// "10am", "10:30am"
function formatTime(value: string) {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const minute = get("minute");
  const suffix = get("dayPeriod").toLowerCase().replace(/\s/g, "");
  return `${get("hour")}${minute === "00" ? "" : `:${minute}`}${suffix}`;
}

export function timeRange(start: string, end?: string | null) {
  return end ? `${formatTime(start)}–${formatTime(end)}` : formatTime(start);
}

// Built from parts so the weekday isn't comma-separated the way en-NZ
// formats it by default ("Friday, 28 August" → "Friday 28 August").
function dateParts(value: string, weekday: "long" | "short") {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: TZ,
    weekday,
    day: "numeric",
    month: weekday === "long" ? "long" : "short",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}

// "Thursday 30 April"
export const longDate = (value: string) => dateParts(value, "long");

// "Thu 14 May"
export const shortDate = (value: string) => dateParts(value, "short");

// "11 June 2026"
export const pastDate = (value: string) =>
  fmt(value, { day: "numeric", month: "long", year: "numeric" });

// "Thursday 30 April, 10am–12pm"
export const longDateTime = (start: string, end?: string | null) =>
  `${longDate(start)}, ${timeRange(start, end)}`;

// "Thu 14 May · 10am–12pm · Newmarket, Auckland"
export function cardMeta(
  start: string,
  end?: string | null,
  location?: string | null,
) {
  return [shortDate(start), timeRange(start, end), location]
    .filter(Boolean)
    .join(" · ");
}

export function isThisMonth(value: string) {
  const now = new Date();
  const monthKey = (date: Date) =>
    new Intl.DateTimeFormat("en-NZ", {
      timeZone: TZ,
      month: "numeric",
      year: "numeric",
    }).format(date);
  return monthKey(new Date(value)) === monthKey(now);
}

export type PanelState =
  | "open"
  | "nearly-full"
  | "full"
  | "closed"
  | "past"
  | "registered";

// Panel state is derived, never authored.
export function derivePanelState({
  startDateTime,
  registrationClosesAt,
  spotsRemaining,
  alreadyRegistered = false,
}: {
  startDateTime?: string | null;
  registrationClosesAt?: string | null;
  spotsRemaining?: number | null;
  alreadyRegistered?: boolean;
}): PanelState {
  const now = Date.now();
  if (alreadyRegistered) return "registered";
  if (startDateTime && new Date(startDateTime).getTime() < now) return "past";
  if (registrationClosesAt && new Date(registrationClosesAt).getTime() < now)
    return "closed";
  if (typeof spotsRemaining === "number") {
    if (spotsRemaining <= 0) return "full";
    if (spotsRemaining <= 3) return "nearly-full";
  }
  return "open";
}

// Calendar links. iCal is a data URI so it works without a server route.
function stamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function calendarLinks({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string;
  start: string;
  end: string;
  details?: string;
  location?: string;
}) {
  const dates = `${stamp(start)}/${stamp(end)}`;
  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams(
    {
      action: "TEMPLATE",
      text: title,
      dates,
      ...(details ? { details } : {}),
      ...(location ? { location } : {}),
    },
  )}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(
    {
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: title,
      startdt: new Date(start).toISOString(),
      enddt: new Date(end).toISOString(),
      ...(details ? { body: details } : {}),
      ...(location ? { location } : {}),
    },
  )}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//zippily//events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    ...(location ? [`LOCATION:${location}`] : []),
    ...(details ? [`DESCRIPTION:${details}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return {
    google,
    outlook,
    ical: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  };
}
