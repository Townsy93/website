import Image from "next/image";

// The HubSpot partner credential band — pale blue so it reads as its own
// strip between white sections. Shared by About and Services so the badge,
// tier wording and layout can never drift between pages.
export function PartnerBand() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 pb-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-sky-blue/15 p-8 text-center sm:flex-row sm:text-left">
          <Image
            src="/hubspot-platinum-badge.png"
            alt="HubSpot Platinum Solutions Partner badge"
            width={96}
            height={96}
            className="h-24 w-auto shrink-0"
          />
          <div>
            <h2 className="text-h3 text-deep-blue">HubSpot Platinum Partner</h2>
            <p className="mt-2 text-body text-deep-blue-80">
              Certified and delivering across New Zealand &amp; Australia, from
              Auckland.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
