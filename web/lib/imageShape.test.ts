import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aspectFromRef, isSquareish } from "./imageShape.ts";

describe("aspectFromRef", () => {
  it("reads the ratio out of a Sanity image reference", () => {
    assert.equal(
      aspectFromRef("image-01b999115405fa451d2846f40cf626cd3121c97c-225x225-png"),
      1,
    );
    const wide = aspectFromRef("image-abc123-1351x506-png");
    assert.ok(wide !== null && Math.abs(wide - 2.67) < 0.01);
  });

  it("returns null rather than guessing for a malformed reference", () => {
    assert.equal(aspectFromRef(undefined), null);
    assert.equal(aspectFromRef(null), null);
    assert.equal(aspectFromRef(""), null);
    assert.equal(aspectFromRef("file-abc123-pdf"), null);
    assert.equal(aspectFromRef("image-abc123-png"), null);
  });

  it("returns null for a zero dimension instead of dividing by it", () => {
    assert.equal(aspectFromRef("image-abc-0x225-png"), null);
    assert.equal(aspectFromRef("image-abc-225x0-png"), null);
  });
});

describe("isSquareish", () => {
  it("treats the live square logos as square", () => {
    // Beachwood Homes and PH Digital — the two a wide strip cropped hardest.
    assert.equal(isSquareish("image-aaa-225x225-png"), true);
    assert.equal(isSquareish("image-bbb-400x400-png"), true);
  });

  it("treats wide logos as wide", () => {
    assert.equal(isSquareish("image-ccc-390x129-png"), false);
    assert.equal(isSquareish("image-ddd-1351x506-png"), false);
  });

  it("falls back to wide when the shape is unknown", () => {
    // The chip is the long-standing default, so an unreadable reference
    // should not suddenly switch layout.
    assert.equal(isSquareish(undefined), false);
    assert.equal(isSquareish("not-a-ref"), false);
  });
});
