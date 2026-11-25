import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { caseStudyArticleJsonLd } from "./caseStudySchema.ts";

const SITE = "https://www.zippily.co.nz";

describe("caseStudyArticleJsonLd", () => {
  it("is an Article about the page, written and published by the site's Organization", () => {
    const d = caseStudyArticleJsonLd({ siteUrl: SITE, slug: "beachwood-homes", client: "Beachwood Homes", headline: "How Beachwood did it" });
    assert.equal(d["@type"], "Article");
    assert.equal(d.headline, "How Beachwood did it");
    assert.deepEqual(d.author, { "@id": `${SITE}/#organization` });
    assert.deepEqual(d.publisher, { "@id": `${SITE}/#organization` });
    assert.deepEqual(d.mainEntityOfPage, { "@type": "WebPage", "@id": `${SITE}/our-work/beachwood-homes` });
  });

  it("falls back to the client name for the headline", () => {
    assert.equal(caseStudyArticleJsonLd({ siteUrl: SITE, slug: "x", client: "Acme" }).headline, "Acme case study");
    assert.equal(caseStudyArticleJsonLd({ siteUrl: SITE, slug: "x" }).headline, "Case study");
  });

  it("carries the image and dates when it has them, as an image list", () => {
    const d = caseStudyArticleJsonLd({ siteUrl: SITE, slug: "x", imageUrl: "https://cdn/i.jpg", createdAt: "2026-07-28T00:00:00Z", updatedAt: "2026-11-01T00:00:00Z" });
    assert.deepEqual(d.image, ["https://cdn/i.jpg"]);
    assert.equal(d.datePublished, "2026-07-28T00:00:00Z");
    assert.equal(d.dateModified, "2026-11-01T00:00:00Z");
  });

  it("leaves out keys it has no value for instead of sending them empty", () => {
    const d = caseStudyArticleJsonLd({ siteUrl: SITE, slug: "x" });
    for (const key of ["image", "description", "datePublished", "dateModified"]) assert.equal(key in d, false, key);
  });

  it("uses the creation date as the modified date when never edited", () => {
    assert.equal(caseStudyArticleJsonLd({ siteUrl: SITE, slug: "x", createdAt: "2026-07-28T00:00:00Z" }).dateModified, "2026-07-28T00:00:00Z");
  });
});
