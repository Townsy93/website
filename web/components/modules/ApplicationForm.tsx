"use client";

import { useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";

const FIELD =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-[15px] text-white placeholder:text-white/50 focus:border-sky-blue focus:outline-none";

const SOURCES = [
  "LinkedIn",
  "Seek",
  "A Zippily client",
  "Someone who works here",
  "Search",
  "Somewhere else",
];

/**
 * Job application.
 *
 * The CV is uploaded first and only its key is passed to HubSpot. If uploads
 * are unavailable the application still submits — it just says plainly that
 * the CV did not attach and where to send it. Blocking the whole application
 * on a storage binding would lose the candidate entirely.
 */
export function ApplicationForm({ roleTitle }: { roleTitle: string }) {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvNote, setCvNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/5 p-8">
        <h3 className="text-h3 text-white">Application received.</h3>
        <p className="mt-3 text-body text-white/80">
          We read every one properly. If it looks like a fit you&apos;ll hear
          from a person within about a week.
        </p>
        {cvNote && (
          <p className="mt-4 rounded-xl bg-white/10 p-4 text-[14px] text-white">
            {cvNote}
          </p>
        )}
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    if (String(form.get("company_website") ?? "")) {
      setSubmitted(true);
      return;
    }

    setSending(true);
    let cvKey = "";
    let note: string | null = null;

    const cv = form.get("cv");
    if (cv instanceof File && cv.size > 0) {
      const upload = new FormData();
      upload.append("file", cv);
      try {
        const response = await fetch("/api/careers/upload", {
          method: "POST",
          body: upload,
        });
        const body = (await response.json()) as {
          ok?: boolean;
          key?: string;
          message?: string;
        };
        if (body.ok && body.key) cvKey = body.key;
        else note = body.message ?? "Your CV didn't attach — please email it to us.";
      } catch {
        note = "Your CV didn't attach — please email it to hello@zippily.co.nz.";
      }
    }

    const fields: Record<string, string> = {
      firstname: String(form.get("firstname") ?? "").trim(),
      lastname: String(form.get("lastname") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      website: String(form.get("linkedin") ?? "").trim(),
      message: String(form.get("note") ?? "").trim(),
      zippily_application_role: roleTitle,
      zippily_application_date: new Date().toISOString().slice(0, 10),
      zippily_cv_key: cvKey,
      zippily_referral_source: String(form.get("source") ?? ""),
    };

    const guid = HUBSPOT_FORMS.careers;
    if (!isHubSpotConfigured(guid)) {
      console.warn("[careers] HubSpot form not configured; nothing was sent.");
      setSending(false);
      setCvNote(note);
      setSubmitted(true);
      return;
    }

    const result = await submitHubSpotForm(guid, fields);
    setSending(false);
    if (result.ok) {
      setCvNote(note);
      setSubmitted(true);
    } else {
      setError(result.message ?? "That didn't send. Try again, or email us.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="firstname" required placeholder="First name" className={FIELD} aria-label="First name" />
        <input name="lastname" required placeholder="Last name" className={FIELD} aria-label="Last name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" required placeholder="Email" className={FIELD} aria-label="Email" />
        <input name="phone" type="tel" required placeholder="Phone" className={FIELD} aria-label="Phone" />
      </div>
      <input name="linkedin" type="url" placeholder="LinkedIn URL (optional)" className={FIELD} aria-label="LinkedIn URL" />

      <div>
        <label htmlFor="cv" className="mb-2 block text-[14px] text-white/80">
          Your CV — PDF or Word, up to 10MB
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="w-full text-[14px] text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-sky-blue file:px-4 file:py-2 file:text-[14px] file:font-semibold file:text-deep-blue"
        />
      </div>

      <textarea
        name="note"
        rows={4}
        placeholder="Anything you'd like to add (optional)"
        className={FIELD}
        aria-label="Cover note"
      />

      <select name="source" defaultValue="" className={FIELD} aria-label="How did you hear about us">
        <option value="" disabled>
          How did you hear about us? (optional)
        </option>
        {SOURCES.map((source) => (
          <option key={source} value={source} className="text-deep-blue">
            {source}
          </option>
        ))}
      </select>

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
          I&apos;m happy for Zippily to hold my details for this application.
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
        {sending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
