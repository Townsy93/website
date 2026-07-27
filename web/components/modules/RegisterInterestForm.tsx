"use client";

import { useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";

const EXPERTISE = [
  "Implementation",
  "Marketing Automation",
  "RevOps",
  "Web",
  "AI",
];

const FIELD =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-[15px] text-white placeholder:text-white/50 focus:border-sky-blue focus:outline-none";

/**
 * Evergreen register-interest form.
 *
 * No CV upload by design — this is the low-commitment path for someone who
 * likes the look of Zippily but sees no role that fits. Asking for a CV here
 * would cost most of the submissions this form exists to collect.
 */
export function RegisterInterestForm() {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expertise, setExpertise] = useState<string[]>([]);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center">
        <h3 className="text-h3 text-white">Got it — thanks.</h3>
        <p className="mt-3 text-body text-white/80">
          We keep these on file and go back to them first when something opens
          up. If it&apos;s a fit, you&apos;ll hear from a person, not a system.
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    // Honeypot: a real person never fills a field they cannot see.
    if (String(form.get("company_website") ?? "")) {
      setSubmitted(true);
      return;
    }

    setSending(true);
    const fields: Record<string, string> = {
      firstname: String(form.get("firstname") ?? "").trim(),
      lastname: String(form.get("lastname") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      // A dedicated property, not HubSpot's standard `website`. That field
      // is the contact's company website — writing a LinkedIn URL into it
      // would overwrite the real one on anyone already in the CRM.
      zippily_linkedin: String(form.get("linkedin") ?? "").trim(),
      message: String(form.get("note") ?? "").trim(),
      zippily_application_role: "register_interest",
      zippily_application_date: new Date().toISOString().slice(0, 10),
      zippily_area_of_expertise: expertise.join("; "),
    };

    const guid = HUBSPOT_FORMS.careers;
    if (!isHubSpotConfigured(guid)) {
      // Not wired up yet — say so rather than pretending it sent.
      console.warn("[careers] HubSpot form not configured; nothing was sent.");
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="firstname" required placeholder="First name" className={FIELD} aria-label="First name" />
        <input name="lastname" required placeholder="Last name" className={FIELD} aria-label="Last name" />
      </div>
      <input name="email" type="email" required placeholder="Email" className={FIELD} aria-label="Email" />
      <input name="linkedin" type="url" placeholder="LinkedIn URL (optional)" className={FIELD} aria-label="LinkedIn URL" />

      <fieldset>
        <legend className="mb-2 text-[14px] text-white/80">
          Where are you strongest?
        </legend>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE.map((area) => {
            const on = expertise.includes(area);
            return (
              <button
                key={area}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setExpertise((current) =>
                    on ? current.filter((a) => a !== area) : [...current, area],
                  )
                }
                className={`rounded-full px-4 py-2 text-[14px] transition ${
                  on
                    ? "bg-sky-blue font-semibold text-deep-blue"
                    : "border border-white/25 text-white/80 hover:border-white/50"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </fieldset>

      <textarea
        name="note"
        rows={4}
        placeholder="Anything you'd like us to know (optional)"
        className={FIELD}
        aria-label="Note"
      />

      {/* Hidden from people, visible to bots. */}
      <input
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <label className="flex items-start gap-3 text-[14px] text-white/80">
        <input type="checkbox" required className="mt-1" />
        <span>
          I&apos;m happy for Zippily to keep my details on file and get in touch
          about roles.
        </span>
      </label>

      {error && (
        <p role="alert" className="text-[14px] text-sky-blue">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-deep-orange px-7 py-3 text-[15px] font-semibold text-deep-blue transition hover:bg-orange-hover disabled:opacity-50"
      >
        {sending ? "Sending…" : "Register interest"}
      </button>
    </form>
  );
}
