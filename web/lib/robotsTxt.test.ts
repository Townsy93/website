import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTENT_SIGNAL, robotsTxt } from "./robotsTxt.ts";

const SITE = "https://www.zippily.co.nz";

describe("robotsTxt", () => {
  it("states the content signal inside the wildcard group, before Allow", () => {
    const lines = robotsTxt({ indexable: true, siteUrl: SITE }).split("\n");
    const ua = lines.indexOf("User-Agent: *");
    const signal = lines.indexOf(`Content-Signal: ${CONTENT_SIGNAL}`);
    const allow = lines.indexOf("Allow: /");
    assert.ok(ua === 0 && signal === 1 && allow === 2);
  });

  it("says yes to search and AI answers, no to training", () => {
    assert.equal(CONTENT_SIGNAL, "search=yes, ai-input=yes, ai-train=no");
  });

  it("still allows crawling and names the sitemap", () => {
    const txt = robotsTxt({ indexable: true, siteUrl: SITE });
    assert.match(txt, /^Allow: \/$/m);
    assert.match(txt, new RegExp(`^Sitemap: ${SITE}/sitemap.xml$`, "m"));
    assert.doesNotMatch(txt, /Disallow/);
  });

  it("keeps staging and previews out entirely, with no signal", () => {
    const txt = robotsTxt({ indexable: false, siteUrl: SITE });
    assert.match(txt, /^Disallow: \/$/m);
    assert.doesNotMatch(txt, /Content-Signal|Allow|Sitemap/);
  });

  it("ends with a newline", () => {
    assert.ok(robotsTxt({ indexable: true, siteUrl: SITE }).endsWith("\n"));
    assert.ok(robotsTxt({ indexable: false, siteUrl: SITE }).endsWith("\n"));
  });
});
