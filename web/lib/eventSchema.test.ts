import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eventJsonLd } from "./eventSchema.ts";

const SITE = "https://www.zippily.co.nz";
const at = (event: Parameters<typeof eventJsonLd>[0]["event"]) =>
  eventJsonLd({ siteUrl: SITE, slug: "s", event }).location as Record<string, unknown>;

describe("eventJsonLd", () => {
  it("gives an in-person venue its address, one line", () => {
    const place = at({ venueType: "in-person", venueName: "Zippily HQ", address: "Level 1/435 Khyber Pass Road\nNewmarket, Auckland" });
    assert.equal(place["@type"], "Place");
    assert.equal(place.address, "Level 1/435 Khyber Pass Road, Newmarket, Auckland");
  });

  it("falls back to the short location rather than emitting a Place with no address", () => {
    const place = at({ venueType: "in-person", venueName: "Zippily HQ", address: null, shortLocation: "Newmarket, Auckland" });
    assert.equal(place.address, "Newmarket, Auckland");
  });

  it("gives an online event a URL, the event's own page", () => {
    const loc = at({ venueType: "online", platform: "Google Meet" });
    assert.equal(loc["@type"], "VirtualLocation");
    assert.equal(loc.name, "Google Meet");
    assert.equal(loc.url, `${SITE}/events/s`);
  });

  it("names an online event's location Online when no platform is set", () => {
    assert.equal(at({ venueType: "online" }).name, "Online");
  });

  it("marks attendance mode and availability from the event", () => {
    const online = eventJsonLd({ siteUrl: SITE, slug: "s", event: { venueType: "online", spotsRemaining: 3 } });
    assert.equal(online.eventAttendanceMode, "https://schema.org/OnlineEventAttendanceMode");
    assert.equal((online.offers as Record<string, unknown>).availability, "https://schema.org/InStock");
    const full = eventJsonLd({ siteUrl: SITE, slug: "s", event: { venueType: "in-person", spotsRemaining: 0 } });
    assert.equal(full.eventAttendanceMode, "https://schema.org/OfflineEventAttendanceMode");
    assert.equal((full.offers as Record<string, unknown>).availability, "https://schema.org/SoldOut");
  });
});
