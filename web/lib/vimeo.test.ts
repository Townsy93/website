import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildVimeoEmbedUrl,
  parseVimeoUrl,
  vimeoOembedUrl,
  VIMEO_ASPECT,
} from "./vimeo.ts";

describe("parsing the URL shapes editors actually paste", () => {
  test("a standard public video", () => {
    assert.deepEqual(parseVimeoUrl("https://vimeo.com/123456789"), {
      videoId: "123456789",
      hash: null,
    });
  });

  test("an unlisted video keeps its privacy hash", () => {
    // Without the hash the iframe returns a privacy error rather than the
    // video, and most Zippily videos will be unlisted.
    assert.deepEqual(parseVimeoUrl("https://vimeo.com/123456789/a1b2c3d4e5"), {
      videoId: "123456789",
      hash: "a1b2c3d4e5",
    });
  });

  test("an already-built player URL", () => {
    assert.deepEqual(
      parseVimeoUrl("https://player.vimeo.com/video/123456789?h=a1b2c3d4e5"),
      { videoId: "123456789", hash: "a1b2c3d4e5" },
    );
  });

  test("a channel URL", () => {
    assert.deepEqual(parseVimeoUrl("https://vimeo.com/channels/staffpicks/123456789"), {
      videoId: "123456789",
      hash: null,
    });
  });

  test("a group URL", () => {
    assert.deepEqual(
      parseVimeoUrl("https://vimeo.com/groups/motion/videos/123456789"),
      { videoId: "123456789", hash: null },
    );
  });
});

describe("tolerating how a URL arrives", () => {
  test("no protocol, as copied from an address bar", () => {
    assert.equal(parseVimeoUrl("vimeo.com/123456789")?.videoId, "123456789");
  });

  test("www, http, trailing slash and surrounding whitespace", () => {
    for (const input of [
      "http://www.vimeo.com/123456789",
      "https://vimeo.com/123456789/",
      "  https://vimeo.com/123456789  ",
    ]) {
      assert.equal(parseVimeoUrl(input)?.videoId, "123456789", input);
    }
  });

  test("a query string on a plain video URL", () => {
    assert.equal(
      parseVimeoUrl("https://vimeo.com/123456789?share=copy")?.videoId,
      "123456789",
    );
  });

  test("hash given as a query param on the short form", () => {
    assert.equal(
      parseVimeoUrl("https://vimeo.com/123456789?h=a1b2c3d4e5")?.hash,
      "a1b2c3d4e5",
    );
  });
});

describe("refusing what is not a Vimeo video", () => {
  test("another provider is rejected rather than half-parsed", () => {
    assert.equal(parseVimeoUrl("https://youtube.com/watch?v=123456789"), null);
    assert.equal(parseVimeoUrl("https://vimeo.com.evil.example/123456789"), null);
  });

  test("empty, junk and non-URLs", () => {
    assert.equal(parseVimeoUrl(""), null);
    assert.equal(parseVimeoUrl("not a url"), null);
    assert.equal(parseVimeoUrl("https://vimeo.com/"), null);
  });

  test("a Vimeo page that is not a video", () => {
    assert.equal(parseVimeoUrl("https://vimeo.com/upgrade"), null);
  });

  test("a segment that is not a plausible hash is not treated as one", () => {
    const ref = parseVimeoUrl("https://vimeo.com/123456789/settings");
    assert.equal(ref?.videoId, "123456789");
    assert.equal(ref?.hash, null);
  });
});

describe("building the embed", () => {
  const ref = { videoId: "123456789", hash: "a1b2c3d4e5" };

  test("carries the privacy hash through", () => {
    assert.match(buildVimeoEmbedUrl(ref), /[?&]h=a1b2c3d4e5/);
  });

  test("sets do-not-track and strips Vimeo's chrome", () => {
    const url = buildVimeoEmbedUrl(ref);
    for (const param of ["dnt=1", "title=0", "byline=0", "portrait=0"]) {
      assert.match(url, new RegExp(param.replace("=", "=")), param);
    }
  });

  test("does not autoplay unless asked", () => {
    assert.doesNotMatch(buildVimeoEmbedUrl(ref), /autoplay/);
    assert.match(buildVimeoEmbedUrl(ref, { autoplay: true }), /autoplay=1/);
  });

  test("omits h entirely for a public video", () => {
    assert.doesNotMatch(
      buildVimeoEmbedUrl({ videoId: "123456789", hash: null }),
      /[?&]h=/,
    );
  });
});

describe("oEmbed lookup", () => {
  test("rebuilds the unlisted URL, or Vimeo will not return a thumbnail", () => {
    const url = vimeoOembedUrl({ videoId: "123456789", hash: "a1b2c3d4e5" });
    assert.match(url, /vimeo\.com%2F123456789%2Fa1b2c3d4e5/);
  });

  test("uses the plain URL for a public video", () => {
    const url = vimeoOembedUrl({ videoId: "123456789", hash: null });
    assert.match(url, /vimeo\.com%2F123456789$/);
  });
});

test("every orientation has an aspect ratio, so nothing shifts", () => {
  assert.deepEqual(Object.keys(VIMEO_ASPECT).sort(), [
    "landscape",
    "portrait",
    "square",
  ]);
});
