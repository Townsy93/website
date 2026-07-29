import { describe, expect, it } from "vitest";
import {
  matchesRule,
  normalisePath,
  scrollPercent,
  shouldShowOnPath,
} from "./popup";

describe("normalisePath", () => {
  it("adds a leading slash so /pricing and pricing behave the same", () => {
    expect(normalisePath("pricing")).toBe("/pricing");
  });

  it("strips a trailing slash", () => {
    expect(normalisePath("/services/")).toBe("/services");
  });

  it("leaves the root alone", () => {
    expect(normalisePath("/")).toBe("/");
  });

  it("drops query and fragment", () => {
    expect(normalisePath("/services?utm_source=x")).toBe("/services");
  });
});

describe("matchesRule", () => {
  it("matches an exact path", () => {
    expect(matchesRule("/pricing", "/pricing")).toBe(true);
    expect(matchesRule("/pricing", "/contact")).toBe(false);
  });

  it("matches a wildcard section", () => {
    expect(matchesRule("/services/crm-implementation", "/services/*")).toBe(true);
  });

  it("includes the section root in its own wildcard", () => {
    // "/services/*" not covering /services is the kind of surprise that makes
    // someone add a second rule and assume the feature is broken.
    expect(matchesRule("/services", "/services/*")).toBe(true);
  });

  it("does not let a wildcard leak into a sibling section", () => {
    expect(matchesRule("/services-and-more", "/services/*")).toBe(false);
  });

  it("supports /* as everything", () => {
    expect(matchesRule("/anything/at/all", "/*")).toBe(true);
  });

  it("tolerates a rule typed without a leading slash", () => {
    expect(matchesRule("/pricing", "pricing")).toBe(true);
  });

  it("ignores an empty rule rather than matching everything", () => {
    // A blank row left in the Studio must not silently turn into "all pages".
    expect(matchesRule("/pricing", "")).toBe(false);
    expect(matchesRule("/pricing", "   ")).toBe(false);
  });
});

describe("shouldShowOnPath", () => {
  it("shows everywhere when no rules are set", () => {
    expect(shouldShowOnPath("/anything", {})).toBe(true);
  });

  it("restricts to the include list when one is given", () => {
    const t = { includePaths: ["/services/*"] };
    expect(shouldShowOnPath("/services/crm-implementation", t)).toBe(true);
    expect(shouldShowOnPath("/about-us", t)).toBe(false);
  });

  it("lets exclude beat include", () => {
    const t = { includePaths: ["/services/*"], excludePaths: ["/services/hubspot-audit"] };
    expect(shouldShowOnPath("/services/hubspot-audit", t)).toBe(false);
    expect(shouldShowOnPath("/services/marketing-automation", t)).toBe(true);
  });

  it("supports the common case: everywhere except a few pages", () => {
    const t = { excludePaths: ["/contact", "/careers/*"] };
    expect(shouldShowOnPath("/", t)).toBe(true);
    expect(shouldShowOnPath("/contact", t)).toBe(false);
    expect(shouldShowOnPath("/careers/senior-consultant", t)).toBe(false);
  });

  it("ignores empty rows in either list", () => {
    expect(shouldShowOnPath("/pricing", { excludePaths: ["", "  "] })).toBe(true);
    expect(shouldShowOnPath("/pricing", { includePaths: ["", "/pricing"] })).toBe(true);
  });

  it("treats null lists as unset, not as empty rules", () => {
    expect(shouldShowOnPath("/x", { includePaths: null, excludePaths: null })).toBe(true);
  });
});

describe("scrollPercent", () => {
  it("reports 0 at the top", () => {
    expect(scrollPercent(0, 800, 2400)).toBe(0);
  });

  it("reports 100 at the bottom", () => {
    expect(scrollPercent(1600, 800, 2400)).toBe(100);
  });

  it("reports halfway", () => {
    expect(scrollPercent(800, 800, 2400)).toBe(50);
  });

  it("treats an unscrollable page as fully read", () => {
    // Otherwise a scroll-depth trigger could never fire on a short page, and
    // it would look like the popup was simply broken.
    expect(scrollPercent(0, 800, 600)).toBe(100);
    expect(scrollPercent(0, 800, 800)).toBe(100);
  });

  it("never exceeds its bounds on overscroll", () => {
    expect(scrollPercent(9999, 800, 2400)).toBe(100);
    expect(scrollPercent(-50, 800, 2400)).toBe(0);
  });
});
