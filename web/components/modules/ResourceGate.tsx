"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  HUBSPOT_FORMS,
  isHubSpotConfigured,
  submitHubSpotForm,
} from "@/lib/hubspot";

// Email gate for resource downloads: "Get the guide" opens a pop-out
// asking for an email; on submit the lead goes to HubSpot and the PDF
// download starts immediately. Falls back to a plain link (gated LP or
// /contact) when the resource has no file uploaded yet.
export function ResourceGate({
  title,
  fileUrl,
  fallbackHref,
}: {
  title: string;
  fileUrl?: string | null;
  fallbackHref: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const buttonClass =
    "inline-block rounded-[5px] border border-off-white-tan/40 px-12 py-3.5 text-body font-semibold uppercase tracking-[0.06em] transition-colors hover:border-deep-orange hover:text-deep-orange";

  if (!fileUrl) {
    return (
      <Link href={fallbackHref} className={buttonClass}>
        Get the guide →
      </Link>
    );
  }

  const downloadUrl = `${fileUrl}?dl=`;

  const startDownload = () => {
    window.location.href = downloadUrl;
  };

  return (
    <>
      <button
        type="button"
        className={buttonClass}
        onClick={() => dialogRef.current?.showModal()}
      >
        Get the guide →
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Download ${title}`}
        className="m-auto w-full max-w-md rounded-2xl bg-off-white-tan p-0 text-deep-blue backdrop:bg-deep-blue/80 backdrop:backdrop-blur-sm"
      >
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-h3">{title}</h3>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="text-h4 text-deep-blue-80 hover:text-deep-blue"
            >
              ✕
            </button>
          </div>

          {state === "done" ? (
            <div className="mt-4">
              <p className="text-body-lg">
                Your download has started. It&apos;s yours to keep — no strings.
              </p>
              <a
                href={downloadUrl}
                className="mt-3 inline-block text-body font-semibold underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                Didn&apos;t start? Download again
              </a>
            </div>
          ) : (
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const formGuid = HUBSPOT_FORMS.resource;
                if (isHubSpotConfigured(formGuid)) {
                  setState("sending");
                  // Which guide this was. Without it every download looks
                  // identical in HubSpot, so you cannot tell a CRM-comparison
                  // lead from someone after the Claude prompts — which is
                  // most of the value in gating them separately.
                  await submitHubSpotForm(formGuid, {
                    email,
                    zippily_resource: title,
                    zippily_resource_date: new Date().toISOString().slice(0, 10),
                  });
                }
                setState("done");
                startDownload();
              }}
            >
              <p className="text-body text-deep-blue-80">
                Pop your email in and the PDF is yours — we&apos;ll also send
                you one useful HubSpot tip a month. No spam, ever.
              </p>
              <label className="flex flex-col gap-1.5">
                <span className="text-caption font-semibold">
                  Email <span className="text-sky-blue">*</span>
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.co.nz"
                  className="w-full rounded-full border border-deep-blue-20 bg-white px-5 py-3 text-body text-deep-blue placeholder:text-deep-blue-80/50 focus:border-sky-blue focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-full bg-deep-blue px-7 py-3 text-body font-semibold text-white transition hover:bg-deep-blue/90 disabled:opacity-60"
              >
                {state === "sending" ? "One sec…" : "Send me the guide ↓"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
