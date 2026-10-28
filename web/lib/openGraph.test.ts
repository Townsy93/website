import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shareMeta } from "./openGraph.ts";

const imagesOf = (meta: ReturnType<typeof shareMeta>) =>
  (meta.openGraph as { images: { url: string; width: number; height: number; alt?: string }[] }).images;

describe("shareMeta", () => {
  it("gives the canonical and og:url the same path", () => {
    const meta = shareMeta("/services/hubspot-audit");
    assert.equal(meta.alternates?.canonical, "/services/hubspot-audit");
    assert.equal(meta.openGraph?.url, "/services/hubspot-audit");
  });

  it("carries every field Ahrefs checks, with or without an image", () => {
    for (const meta of [shareMeta("/x"), shareMeta("/x", { imageUrl: "https://cdn/i.png" })]) {
      assert.ok(meta.openGraph?.type);
      assert.ok(meta.openGraph?.url);
      assert.ok(meta.openGraph?.siteName);
      assert.ok(meta.openGraph?.locale);
    }
  });

  it("defaults to website and lets a post say article", () => {
    assert.equal(shareMeta("/x").openGraph?.type, "website");
    assert.equal(shareMeta("/x", { type: "article" }).openGraph?.type, "article");
  });

  it("uses the page's own image for Open Graph and Twitter when there is one", () => {
    const meta = shareMeta("/x", { imageUrl: "https://cdn/i.png" });
    assert.deepEqual(imagesOf(meta), [{ url: "https://cdn/i.png", width: 1200, height: 630 }]);
    assert.deepEqual(meta.twitter, { images: ["https://cdn/i.png"] });
  });

  it("falls back to the generated card, which a page-level openGraph would otherwise drop", () => {
    for (const meta of [shareMeta("/x"), shareMeta("/x", { imageUrl: null })]) {
      const [image] = imagesOf(meta);
      assert.equal(image.url, "/opengraph-image");
      assert.ok(image.alt);
      assert.deepEqual(meta.twitter, { images: ["/opengraph-image"] });
    }
  });
});
