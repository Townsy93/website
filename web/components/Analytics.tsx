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

/**
 * Whether the Clarity tag should be rendered at all. Same two reasons to
 * stay silent as GA4, with one that matters more here: Clarity records
 * session replays, so a draft-mode session would record an editor working
 * on unpublished copy rather than a visitor using the site.
 */
export function shouldLoadClarity(
  projectId: string | undefined,
  isDraftMode: boolean,
): projectId is string {
  if (!projectId) return false;
  if (isDraftMode) return false;
  return true;
}

/**
 * Microsoft Clarity — heatmaps and session replay.
 *
 * `afterInteractive` rather than the vendor's inline snippet so it does not
 * block first paint; the snippet's own async insert is redundant once Next
 * controls the loading strategy.
 *
 * The same no-consent-banner reasoning as GA4 above applies, and the same
 * caveat: this is the file that changes if EU traffic ever becomes material.
 * Clarity masks text content by default, which is worth leaving on — the
 * careers form takes CVs and the contact form takes names.
 */
export function Clarity({
  projectId,
  isDraftMode,
}: {
  projectId: string | undefined;
  isDraftMode: boolean;
}) {
  if (!shouldLoadClarity(projectId, isDraftMode)) return null;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}

/**
 * Whether the HubSpot tracking script should be rendered at all. Same two
 * reasons to stay silent as GA4 and Clarity, and a sharper one for HubSpot:
 * it creates contacts. A draft-mode session would register an editor as a
 * visitor on a contact record.
 */
export function shouldLoadHubSpot(
  portalId: string | undefined,
  isDraftMode: boolean,
): portalId is string {
  if (!portalId) return false;
  if (isDraftMode) return false;
  return true;
}

/**
 * HubSpot tracking code.
 *
 * Without it HubSpot sees form submissions but never the visit that led to
 * them: no page views on the contact timeline, and a new contact's source
 * falls back to "Offline sources" because nothing ties the submission to a
 * session. GA4 can say where traffic came from; only HubSpot can link that
 * to the person who became a contact and then a deal, which is the chain
 * this business actually sells on.
 *
 * Built from the portal id and region rather than pasting the vendor
 * snippet's hard-coded URL, so it follows the same two env vars the forms
 * use and cannot drift from them. The loader host is js-<region>.hs-scripts.com
 * (ap1 here, from NEXT_PUBLIC_HUBSPOT_REGION).
 *
 * The same no-consent-banner reasoning as GA4 applies; this is also a file
 * that changes if EU traffic ever becomes material.
 */
export function HubSpotTracking({
  portalId,
  region,
  isDraftMode,
}: {
  portalId: string | undefined;
  region: string | undefined;
  isDraftMode: boolean;
}) {
  if (!shouldLoadHubSpot(portalId, isDraftMode)) return null;
  const host = region && region !== "na1" ? `js-${region}` : "js";
  return (
    <Script
      id="hs-script-loader"
      src={`https://${host}.hs-scripts.com/${portalId}.js`}
      strategy="afterInteractive"
    />
  );
}
