"use client";

import { useState } from "react";

// F1 — contact form. Submission wiring to HubSpot Forms lands with the
// integrations pass; until then the success state is client-side only.
export function ContactForm({
  heading,
  options,
  successHeading,
  successText,
}: {
  heading?: string | null;
  options?: string[] | null;
  successHeading?: string | null;
  successText?: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-deep-blue-20 bg-white p-10 text-center">
        <span
        aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-deep-blue text-h3 text-sky-blue"
        >
          ✓
        </span>
        <h2 className="mt-5 text-h3">{successHeading ?? "Thanks — we're on it."}</h2>
        <p className="mx-auto mt-3 max-w-md text-body text-deep-blue-80">
          {successText}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-body font-semibold text-deep-blue underline decoration-sky-blue decoration-2 underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-full border border-deep-blue-20 bg-white px-5 py-3 text-body text-deep-blue placeholder:text-deep-blue-80/50 focus:border-sky-blue focus:outline-none";

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      {heading && <h2 className="text-h3">{heading}</h2>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold">
            First name <span className="text-sky-blue">*</span>
          </span>
          <input required name="firstName" placeholder="Jane" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold">
            Last name <span className="text-sky-blue">*</span>
          </span>
          <input required name="lastName" placeholder="Smith" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold">
            Email <span className="text-sky-blue">*</span>
          </span>
          <input
            required
            type="email"
            name="email"
            placeholder="jane@company.co.nz"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold">
            Company name <span className="text-sky-blue">*</span>
          </span>
          <input required name="company" placeholder="Company Ltd" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption font-semibold text-deep-blue-80">
          Phone number
        </span>
        <input
          type="tel"
          name="phone"
          placeholder="+64 21 000 0000"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption font-semibold">
          How can we help? <span className="text-sky-blue">*</span>
        </span>
        <select required name="topic" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose one…
          </option>
          {(options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption font-semibold text-deep-blue-80">
          Tell us about your project or challenge
        </span>
        <textarea
          name="message"
          rows={4}
          placeholder="A few lines on where you're at…"
          className="w-full rounded-2xl border border-deep-blue-20 bg-white px-5 py-3 text-body text-deep-blue placeholder:text-deep-blue-80/50 focus:border-sky-blue focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="self-start rounded-full bg-deep-blue px-7 py-3 text-body font-semibold text-white transition hover:bg-deep-blue/90 max-sm:w-full"
      >
        Let&apos;s chat →
      </button>
    </form>
  );
}
