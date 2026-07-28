"use client";

/**
 * Last-resort boundary, for a failure in the root layout itself.
 *
 * Replaces the whole document, so it has to render its own html and body —
 * nothing above it survived. No Sanity fetch and no shared components on
 * purpose: whatever broke may be exactly those, and a boundary that can
 * itself throw is not a boundary.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E2F4A",
          color: "#FFFFFF",
          fontFamily: "Archivo, Helvetica, Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.05em" }}>
            Something went wrong.
          </h1>
          <p style={{ marginTop: "12px", fontSize: "16px", lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
            The site hit an error it couldn&apos;t recover from. Try again in a
            moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              background: "#F77B23",
              color: "#0E2F4A",
              border: 0,
              borderRadius: "999px",
              padding: "12px 28px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: "24px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            Email hello@zippily.co.nz
            {error.digest ? ` and quote ${error.digest}.` : "."}
          </p>
        </div>
      </body>
    </html>
  );
}
