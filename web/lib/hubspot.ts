// HubSpot Forms API submission (public endpoint — no secret required).
// Form GUIDs come from the embed codes Sean supplies; until the env vars
// are set, forms fall back to a local success state so the UI stays testable.

const PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
const REGION = process.env.NEXT_PUBLIC_HUBSPOT_REGION ?? "ap1";

export const HUBSPOT_FORMS = {
  contact: process.env.NEXT_PUBLIC_HUBSPOT_FORM_CONTACT,
  newsletter: process.env.NEXT_PUBLIC_HUBSPOT_FORM_NEWSLETTER,
  // Dedicated resource-download form; falls back to the newsletter form
  // until Sean creates one in HubSpot (lets him segment guide leads).
  resource:
    process.env.NEXT_PUBLIC_HUBSPOT_FORM_RESOURCE ??
    process.env.NEXT_PUBLIC_HUBSPOT_FORM_NEWSLETTER,
  // Event registrations; falls back to the contact form until Sean makes
  // a dedicated one (lets him segment session attendees).
  event:
    process.env.NEXT_PUBLIC_HUBSPOT_FORM_EVENT ??
    process.env.NEXT_PUBLIC_HUBSPOT_FORM_CONTACT,
} as const;

export function isHubSpotConfigured(formGuid?: string): formGuid is string {
  return Boolean(PORTAL_ID && formGuid);
}

export async function submitHubSpotForm(
  formGuid: string,
  fields: Record<string, string>,
): Promise<{ ok: boolean; message?: string }> {
  const endpoint = `https://api-${REGION}.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formGuid}`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: Object.entries(fields)
          .filter(([, value]) => value !== "")
          .map(([name, value]) => ({ name, value })),
        context: {
          pageUri: typeof window !== "undefined" ? window.location.href : undefined,
          pageName: typeof document !== "undefined" ? document.title : undefined,
        },
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return { ok: false, message: body?.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Network error — please try again." };
  }
}
