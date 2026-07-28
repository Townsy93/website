"use client";

import { useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";

const FIELD =
  "w-full rounded-xl border border-deep-blue-20 bg-white px-4 py-3 text-body text-deep-blue placeholder:text-deep-blue/40 focus:border-sky-blue focus:outline-none";

/**
 * The conversion point of a landing page.
 *
 * Four fields. Every extra one costs conversions, and everything else can be
 * asked on the call — the job here is to start a conversation, not to
 * complete a CRM record.
 */
export function LandingForm({
  heading,
  body,
  campaign,
  successHeading,
  successBody,
}: {
  heading?: string | null;
  body?: string | null;
  campaign: string;
  successHeading?: string | null;
  successBody?: string | null;
}) {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-deep-blue text-h3 text-sky-blue"
        >
          ✓
        </span>
        <h2 className="mt-5 text-h3 text-deep-blue">
          {successHeading ?? "Got it — we'll be in touch."}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-body text-deep-blue-80">
          {successBody ??
            "We'll come back to you within one working day with a time that suits."}
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    // Hidden from people, visible to bots.
    if (String(form.get("company_website") ?? "")) {
      setSubmitted(true);
      return;
    }

    setSending(true);
    const fields: Record<string, string> = {
      firstname: String(form.get("firstname") ?? "").trim(),
      lastname: String(form.get("lastname") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      // Which campaign produced this lead. Without it a landing-page lead is
      // indistinguishable from a general enquiry, which defeats the point of
      // running the campaign.
      zippily_campaign: campaign,
    };

    const guid = HUBSPOT_FORMS.contact;
    if (!isHubSpotConfigured(guid)) {
      console.warn("[lp] HubSpot form not configured; nothing was sent.");
      setSending(false);
      setSubmitted(true);
      return;
    }

    const result = await submitHubSpotForm(guid, fields);
    setSending(false);
    if (result.ok) setSubmitted(true);
    else setError(result.message ?? "That didn't send. Try again, or email us.");
  }

  return (
    <div className="rounded-2xl bg-white p-7 shadow-lg sm:p-8">
      <h2 className="text-h3 text-deep-blue">
        {heading ?? "Book your free HubSpot audit"}
      </h2>
      {body && <p className="mt-2 text-body text-deep-blue-80">{body}</p>}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="firstname"
            required
            placeholder="First name"
            aria-label="First name"
            className={FIELD}
          />
          <input
            name="lastname"
            required
            placeholder="Last name"
            aria-label="Last name"
            className={FIELD}
          />
        </div>
        <input
          name="email"
          type="email"
          required
          placeholder="Work email"
          aria-label="Work email"
          className={FIELD}
        />
        <input
          name="company"
          required
          placeholder="Company"
          aria-label="Company"
          className={FIELD}
        />

        <input
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-px w-px opacity-0"
        />

        {error && (
          <p role="alert" className="text-caption text-error-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-deep-blue px-7 py-3.5 text-body font-semibold text-white transition hover:bg-deep-blue/90 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Book my free audit"}
        </button>

        <p className="text-center text-caption text-deep-blue-80">
          No obligation. We&apos;ll tell you what we find either way.
        </p>
      </form>
    </div>
  );
}
