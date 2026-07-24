"use client";

import { useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";

// Shared newsletter signup (footer + band variants). Submits to the
// HubSpot newsletter form once NEXT_PUBLIC_HUBSPOT_* env vars are set.
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  if (state === "done") {
    return (
      <p className={compact ? "text-caption text-white/80" : "text-body text-white/80"}>
        You&apos;re in — one useful email a month, starting soon.
      </p>
    );
  }

  return (
    <form
      className="flex gap-2"
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
      <label htmlFor={compact ? "footer-newsletter" : "band-newsletter"} className="sr-only">
        Email address
      </label>
      <input
        id={compact ? "footer-newsletter" : "band-newsletter"}
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.co.nz"
        className={`w-full min-w-0 rounded-full bg-white text-deep-blue placeholder:text-deep-blue/50 ${
          compact ? "px-4 py-2.5 text-body" : "px-5 py-3 text-body"
        }`}
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className={`shrink-0 rounded-full bg-deep-orange font-semibold text-deep-blue transition hover:bg-orange-hover disabled:opacity-60 ${
          compact ? "px-5 py-2.5 text-body" : "px-6 py-3 text-body"
        }`}
      >
        {state === "sending" ? "…" : "Sign up"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-caption text-deep-orange">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
