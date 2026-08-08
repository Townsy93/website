import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  matchesRule,
  normalisePath,
  scrollPercent,
  shouldShowOnPath,
} from "./popup.ts";

describe("normalisePath", () => {
  it("adds a leading slash so /pricing and pricing behave the same", () => {
    assert.equal(normalisePath("pricing"), "/pricing");
  });

  it("strips a trailing slash", () => {
    assert.equal(normalisePath("/services/"), "/services");
  });

  it("leaves the root alone", () => {
    assert.equal(normalisePath("/"), "/");
  });

  it("drops query and fragment", () => {
    assert.equal(normalisePath("/services?utm_source=x"), "/services");
  });
});

describe("matchesRule", () => {
  it("matches an exact path", () => {
    assert.equal(matchesRule("/pricing", "/pricing"), true);
    assert.equal(matchesRule("/pricing", "/contact"), false);
  });

  it("matches a wildcard section", () => {
    assert.equal(matchesRule("/services/crm-implementation", "/services/*"), true);
  });

  it("includes the section root in its own wildcard", () => {
    // "/services/*" not covering /services is the kind of surprise that makes
    // someone add a second rule and assume the feature is broken.
    assert.equal(matchesRule("/services", "/services/*"), true);
  });

  it("does not let a wildcard leak into a sibling section", () => {
    assert.equal(matchesRule("/services-and-more", "/services/*"), false);
  });

  it("supports /* as everything", () => {
    assert.equal(matchesRule("/anything/at/all", "/*"), true);
  });

  it("tolerates a rule typed without a leading slash", () => {
    assert.equal(matchesRule("/pricing", "pricing"), true);
  });

  it("ignores an empty rule rather than matching everything", () => {
    // A blank row left in the Studio must not silently turn into "all pages".
    assert.equal(matchesRule("/pricing", ""), false);
    assert.equal(matchesRule("/pricing", "   "), false);
  });
});

describe("shouldShowOnPath", () => {
  it("shows everywhere when no rules are set", () => {
    assert.equal(shouldShowOnPath("/anything", {}), true);
  });

  it("restricts to the include list when one is given", () => {
    const t = { includePaths: ["/services/*"] };
    assert.equal(shouldShowOnPath("/services/crm-implementation", t), true);
    assert.equal(shouldShowOnPath("/about-us", t), false);
  });

  it("lets exclude beat include", () => {
    const t = { includePaths: ["/services/*"], excludePaths: ["/services/hubspot-audit"] };
    assert.equal(shouldShowOnPath("/services/hubspot-audit", t), false);
    assert.equal(shouldShowOnPath("/services/marketing-automation", t), true);
  });

  it("supports the common case: everywhere except a few pages", () => {
    const t = { excludePaths: ["/contact", "/careers/*"] };
    assert.equal(shouldShowOnPath("/", t), true);
    assert.equal(shouldShowOnPath("/contact", t), false);
    assert.equal(shouldShowOnPath("/careers/senior-consultant", t), false);
  });

  it("ignores empty rows in either list", () => {
    assert.equal(shouldShowOnPath("/pricing", { excludePaths: ["", "  "] }), true);
    assert.equal(shouldShowOnPath("/pricing", { includePaths: ["", "/pricing"] }), true);
  });

  it("treats null lists as unset, not as empty rules", () => {
    assert.equal(shouldShowOnPath("/x", { includePaths: null, excludePaths: null }), true);
  });
});

describe("scrollPercent", () => {
  it("reports 0 at the top", () => {
    assert.equal(scrollPercent(0, 800, 2400), 0);
  });

  it("reports 100 at the bottom", () => {
    assert.equal(scrollPercent(1600, 800, 2400), 100);
  });

  it("reports halfway", () => {
    assert.equal(scrollPercent(800, 800, 2400), 50);
  });

  it("treats an unscrollable page as fully read", () => {
    // Otherwise a scroll-depth trigger could never fire on a short page, and
    // it would look like the popup was simply broken.
    assert.equal(scrollPercent(0, 800, 600), 100);
    assert.equal(scrollPercent(0, 800, 800), 100);
  });

  it("never exceeds its bounds on overscroll", () => {
    assert.equal(scrollPercent(9999, 800, 2400), 100);
    assert.equal(scrollPercent(-50, 800, 2400), 0);
  });
});
