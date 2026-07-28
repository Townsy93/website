"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Must be a client component — React needs to catch the render on the client
 * to show a fallback. Next serves this with an HTTP 500, which is what a
 * monitoring tool and a crawler both need to see; a friendly page returned
 * with a 200 hides real outages.
 *
 * Deliberately shows no stack trace or error message. Digest is enough to
 * find the log entry, and an internal error string on a public page is an
 * information leak.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-deep-blue px-4 text-white">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
          Something went wrong
        </p>
        <h1 className="mt-4 text-h2">This page didn&apos;t load properly.</h1>
        <p className="mx-auto mt-5 max-w-md text-body-lg text-white/70">
          It&apos;s us, not you. Try again in a moment — and if it keeps
          happening we&apos;d genuinely like to know.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-deep-orange px-7 py-3 text-body font-semibold text-deep-blue transition hover:bg-orange-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border-2 border-white/40 px-7 py-3 text-body font-semibold text-white transition hover:border-white"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-caption text-white/50">
          Still stuck? Email{" "}
          <a href="mailto:hello@zippily.co.nz" className="text-sky-blue hover:underline">
            hello@zippily.co.nz
          </a>
          {error.digest ? ` and quote ${error.digest}.` : "."}
        </p>
      </div>
    </main>
  );
}
