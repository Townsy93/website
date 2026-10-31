import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INDEXNOW_KEY, indexNowUrls, submitIndexNow } from "./indexNow.ts";

const S = "https://www.zippily.co.nz";

describe("indexNowUrls", () => {
  it("announces a post and the insights list that now includes it", () => {
    assert.deepEqual(indexNowUrls({ _type: "blogPost", slug: { current: "a-post" } }), [
      `${S}/insights/a-post`,
      `${S}/insights`,
    ]);
  });

  it("holds back anything the sitemap would leave out", () => {
    assert.deepEqual(indexNowUrls({ _type: "service", slug: { current: "x" }, pageBuilt: false }), []);
    assert.deepEqual(indexNowUrls({ _type: "service", slug: { current: "x" } }), []);
    assert.deepEqual(indexNowUrls({ _type: "caseStudy", slug: { current: "x" }, pageBuilt: true, status: "comingSoon" }), []);
    assert.deepEqual(indexNowUrls({ _type: "vacancy", slug: { current: "x" }, status: "closed" }), []);
    assert.deepEqual(indexNowUrls({ _type: "blogPost", slug: { current: "x" }, seo: { noIndex: true } }), []);
  });

  it("announces a built service and a live case study", () => {
    assert.equal(indexNowUrls({ _type: "service", slug: { current: "crm" }, pageBuilt: true })[0], `${S}/services/crm`);
    assert.equal(
      indexNowUrls({ _type: "caseStudy", slug: { current: "c" }, pageBuilt: true, status: "live" })[0],
      `${S}/our-work/c`,
    );
  });

  it("ignores types with no public page, and documents with no slug", () => {
    assert.deepEqual(indexNowUrls({ _type: "siteSettings" }), []);
    assert.deepEqual(indexNowUrls({ _type: "blogPost", slug: null }), []);
    assert.deepEqual(indexNowUrls({}), []);
  });

  it("gives a landing page its own URL and no list page", () => {
    assert.deepEqual(indexNowUrls({ _type: "landingPage", slug: { current: "l" }, pageBuilt: true }), [`${S}/lp/l`]);
  });
});

describe("submitIndexNow", () => {
  it("posts the host, key, key location and URLs", async () => {
    let seen: { url: string; body: Record<string, unknown> } | null = null;
    const fake = (async (url: string, init: RequestInit) => {
      seen = { url, body: JSON.parse(String(init.body)) };
      return new Response(null, { status: 202 });
    }) as unknown as typeof fetch;
    const result = await submitIndexNow([`${S}/insights/a`], fake);
    assert.deepEqual(result, { sent: 1, status: 202 });
    assert.equal(seen!.body.host, "www.zippily.co.nz");
    assert.equal(seen!.body.key, INDEXNOW_KEY);
    assert.equal(seen!.body.keyLocation, `${S}/${INDEXNOW_KEY}.txt`);
    assert.deepEqual(seen!.body.urlList, [`${S}/insights/a`]);
  });

  it("sends nothing for an empty list", async () => {
    const fake = (async () => assert.fail("should not call")) as unknown as typeof fetch;
    assert.deepEqual(await submitIndexNow([], fake), { sent: 0 });
  });

  it("swallows a network failure so a publish never fails because of it", async () => {
    const boom = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    const result = await submitIndexNow([`${S}/x`], boom);
    assert.equal(result.sent, 0);
    assert.match(result.error ?? "", /offline/);
  });
});
