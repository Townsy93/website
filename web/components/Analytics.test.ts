import { describe, expect, it } from "vitest";
import { shouldLoadAnalytics } from "./Analytics";

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
