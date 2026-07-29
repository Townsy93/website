import { describe, expect, it } from "vitest";
import {
  formatReport,
  inBatches,
  pageProblems,
  parseSitemap,
  pathOf,
  redirectProblems,
  unchangedProblems,
} from "./checks.ts";
import { EXPECTED_REDIRECTS, EXPECTED_UNCHANGED } from "./expected.ts";

describe("pathOf", () => {
  it("reduces an absolute URL to its path, so a domain change does not break the check", () => {
    expect(pathOf("https://www.zippily.co.nz/insights/foo")).toBe("/insights/foo");
    expect(pathOf("https://website.sean-fe5.workers.dev/insights/foo")).toBe("/insights/foo");
  });

  it("treats a trailing slash as the same page", () => {
    expect(pathOf("/services/")).toBe("/services");
    expect(pathOf("/")).toBe("/");
  });

  it("drops query and fragment", () => {
    expect(pathOf("/insights?page=2")).toBe("/insights");
    expect(pathOf("/insights#top")).toBe("/insights");
  });
});

describe("parseSitemap", () => {
  it("extracts paths from loc elements", () => {
    const xml = `<urlset><url><loc>https://x.co/a</loc></url><url><loc>https://x.co/b</loc></url></urlset>`;
    expect(parseSitemap(xml)).toEqual(["/a", "/b"]);
  });

  it("returns nothing for an empty sitemap rather than throwing", () => {
    expect(parseSitemap("<urlset></urlset>")).toEqual([]);
  });
});

describe("pageProblems", () => {
  const good = `<html><head><title>A page</title><meta name="description" content="Real copy."></head></html>`;

  it("passes a healthy page", () => {
    expect(pageProblems(200, good)).toEqual([]);
  });

  it("reports a non-200 and stops there", () => {
    expect(pageProblems(404, "")).toEqual(["returned 404"]);
  });

  it("catches a missing meta description", () => {
    expect(pageProblems(200, `<html><head><title>A</title></head></html>`)).toContain(
      "no meta description",
    );
  });

  it("catches an empty meta description, not just a missing one", () => {
    const html = `<html><head><title>A</title><meta name="description" content="  "></head></html>`;
    expect(pageProblems(200, html)).toContain("no meta description");
  });

  it("treats noindex in the sitemap as a contradiction", () => {
    const html = `<html><head><title>A</title><meta name="description" content="x">
      <meta name="robots" content="noindex, follow"></head></html>`;
    expect(pageProblems(200, html)).toContain("marked noindex but is in the sitemap");
  });

  it("does not flag a page that is explicitly indexable", () => {
    const html = `<html><head><title>A</title><meta name="description" content="x">
      <meta name="robots" content="index, follow"></head></html>`;
    expect(pageProblems(200, html)).toEqual([]);
  });
});

describe("redirectProblems", () => {
  it("passes a permanent redirect landing on a live page", () => {
    expect(redirectProblems(308, "/insights/foo", "/insights/foo", 200)).toEqual([]);
    expect(redirectProblems(301, "/insights/foo", "/insights/foo", 200)).toEqual([]);
  });

  it("rejects a temporary redirect, which would not pass ranking", () => {
    expect(redirectProblems(302, "/insights/foo", "/insights/foo", 200)).toEqual([
      "returned 302, expected a permanent redirect",
    ]);
  });

  it("rejects a 404 where a redirect was expected", () => {
    expect(redirectProblems(404, null, "/insights/foo", null)[0]).toMatch(/returned 404/);
  });

  it("catches landing on the wrong destination", () => {
    expect(redirectProblems(308, "/wrong", "/insights/foo", 200)[0]).toBe(
      "redirects to /wrong, expected /insights/foo",
    );
  });

  it("catches the destination itself being broken — the failure mode that matters", () => {
    expect(redirectProblems(308, "/insights/foo", "/insights/foo", 404)).toEqual([
      "destination /insights/foo returns 404",
    ]);
  });

  it("reports both faults at once rather than one per week", () => {
    expect(redirectProblems(308, "/wrong", "/right", 404)).toHaveLength(2);
  });

  it("compares by path, so the check survives the domain change at cutover", () => {
    expect(
      redirectProblems(308, "https://www.zippily.co.nz/insights/foo", "/insights/foo", 200),
    ).toEqual([]);
  });
});

describe("unchangedProblems", () => {
  it("passes a URL that still serves its page", () => {
    expect(unchangedProblems(200)).toEqual([]);
  });

  it("flags a redirect appearing on a URL that is supposed to keep its path", () => {
    expect(unchangedProblems(308)[0]).toMatch(/supposed to keep its path/);
  });

  it("flags a 404", () => {
    expect(unchangedProblems(404)).toEqual(["returned 404"]);
  });
});

describe("inBatches", () => {
  it("returns every result, in order", async () => {
    const out = await inBatches([1, 2, 3, 4, 5], 2, async (n) => n * 2);
    expect(out).toEqual([2, 4, 6, 8, 10]);
  });

  it("never exceeds the ceiling", async () => {
    let live = 0;
    let peak = 0;
    await inBatches([1, 2, 3, 4, 5, 6, 7], 3, async () => {
      live++;
      peak = Math.max(peak, live);
      await new Promise((r) => setTimeout(r, 5));
      live--;
    });
    expect(peak).toBeLessThanOrEqual(3);
  });
});

describe("the expectation list", () => {
  it("carries the full approved mapping", () => {
    // 50 from the Squarespace sitemap, plus 3 found later by comparing Search
    // Console's page list against that sitemap. Google held URLs the sitemap
    // never listed, and two of them were 404ing.
    expect(EXPECTED_REDIRECTS).toHaveLength(53);
    expect(EXPECTED_UNCHANGED).toHaveLength(5);
  });

  it("never expects a redirect to itself, which would be an infinite loop", () => {
    for (const [from, to] of EXPECTED_REDIRECTS) expect(from).not.toBe(to);
  });

  it("has no source listed twice, which would make one rule unreachable", () => {
    const sources = EXPECTED_REDIRECTS.map(([from]) => from);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("does not both redirect a URL and expect it to stay put", () => {
    const sources = new Set(EXPECTED_REDIRECTS.map(([from]) => from));
    for (const path of EXPECTED_UNCHANGED) expect(sources.has(path)).toBe(false);
  });

  it("never chains: no destination is itself a redirect source", () => {
    const sources = new Set(EXPECTED_REDIRECTS.map(([from]) => from));
    for (const [, to] of EXPECTED_REDIRECTS) expect(sources.has(to)).toBe(false);
  });
});

describe("formatReport", () => {
  it("names every failing URL and its reason", () => {
    const text = formatReport(
      [{ url: "/faqs", problem: "returned 404" }],
      54,
      "https://example.com",
    );
    expect(text).toContain("/faqs");
    expect(text).toContain("returned 404");
    expect(text).toContain("1 problem found across 54 checks");
  });

  it("pluralises honestly", () => {
    const text = formatReport(
      [
        { url: "/a", problem: "x" },
        { url: "/b", problem: "y" },
      ],
      54,
      "https://example.com",
    );
    expect(text).toContain("2 problems found");
  });
});
