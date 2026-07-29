import Script from "next/script";

/**
 * Whether the GA4 tag should be rendered at all.
 *
 * Kept separate from the component so the decision is testable without a
 * React tree, and so the two reasons to stay silent are explicit rather than
 * buried in JSX conditionals.
 */
export function shouldLoadAnalytics(
  measurementId: string | undefined,
  isDraftMode: boolean,
): measurementId is string {
  // No id configured: ship nothing. This is what keeps local development and
  // any un-configured environment out of the reporting entirely, rather than
  // relying on remembering to strip a tag.
  if (!measurementId) return false;

  // Draft mode means someone is previewing unpublished content from the
  // Studio. Those are editing sessions, not visits, and counting them would
  // quietly inflate exactly the pages being worked on.
  if (isDraftMode) return false;

  return true;
}

/**
 * GA4, loaded directly rather than via @next/third-parties.
 *
 * No consent banner by deliberate choice: New Zealand's Privacy Act does not
 * require one, and an opt-in gate typically loses 20-40% of sessions. If EU
 * traffic ever becomes material this is the file that has to change, and it
 * would mean Consent Mode v2 with the tag held back until acceptance.
 *
 * Page views on client-side navigations are handled by GA4's own enhanced
 * measurement, which listens to History API changes. The App Router uses
 * pushState, so soft navigations are counted without any manual wiring.
 */
export function Analytics({
  measurementId,
  isDraftMode,
}: {
  measurementId: string | undefined;
  isDraftMode: boolean;
}) {
  if (!shouldLoadAnalytics(measurementId, isDraftMode)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
