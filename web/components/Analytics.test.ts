import { describe, expect, it } from "vitest";
import {
  shouldLoadAnalytics,
  shouldLoadClarity,
  shouldLoadHubSpot,
} from "./Analytics";

describe("shouldLoadAnalytics", () => {
  it("loads when an id is configured on a published page", () => {
    expect(shouldLoadAnalytics("G-P0NVHJ6RTS", false)).toBe(true);
  });

  it("ships nothing when no id is configured", () => {
    // This is what keeps local development out of the reporting. If it ever
    // returns true for undefined, dev traffic silently pollutes real data.
    expect(shouldLoadAnalytics(undefined, false)).toBe(false);
  });

  it("treats an empty id as unconfigured, not as a valid id", () => {
    expect(shouldLoadAnalytics("", false)).toBe(false);
  });

  it("stays silent in draft mode even with an id", () => {
    // Studio previews are editing sessions, not visits. Counting them would
    // inflate exactly the pages being worked on.
    expect(shouldLoadAnalytics("G-P0NVHJ6RTS", true)).toBe(false);
  });
});

describe("shouldLoadClarity", () => {
  it("loads when a project id is configured on a published page", () => {
    expect(shouldLoadClarity("ywbc5y8nh1", false)).toBe(true);
  });

  it("ships nothing when no project id is configured", () => {
    expect(shouldLoadClarity(undefined, false)).toBe(false);
  });

  it("treats an empty id as unconfigured", () => {
    expect(shouldLoadClarity("", false)).toBe(false);
  });

  it("stays silent in draft mode", () => {
    // Clarity records session replay. In draft mode that would be a recording
    // of an editor working on unpublished copy, not a visitor.
    expect(shouldLoadClarity("ywbc5y8nh1", true)).toBe(false);
  });
});

describe("shouldLoadHubSpot", () => {
  it("loads when a portal id is configured on a published page", () => {
    expect(shouldLoadHubSpot("441648495", false)).toBe(true);
  });

  it("ships nothing when no portal id is configured", () => {
    expect(shouldLoadHubSpot(undefined, false)).toBe(false);
  });

  it("treats an empty id as unconfigured", () => {
    expect(shouldLoadHubSpot("", false)).toBe(false);
  });

  it("stays silent in draft mode", () => {
    // HubSpot tracking creates contacts. An editor previewing a draft would
    // otherwise register as a visitor on a contact record.
    expect(shouldLoadHubSpot("441648495", true)).toBe(false);
  });
});
