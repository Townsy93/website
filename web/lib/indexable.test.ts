import assert from "node:assert/strict";
import { test } from "node:test";
import { isIndexableHost } from "./indexable.ts";

test("the live domain is indexable, with or without www", () => {
  assert.equal(isIndexableHost("www.zippily.co.nz"), true);
  assert.equal(isIndexableHost("zippily.co.nz"), true);
});

test("a port and odd casing do not change the answer", () => {
  assert.equal(isIndexableHost("WWW.Zippily.CO.NZ"), true);
  assert.equal(isIndexableHost("www.zippily.co.nz:443"), true);
});

test("the staging worker is not indexable", () => {
  assert.equal(isIndexableHost("website.sean-fe5.workers.dev"), false);
});

test("a lookalike host does not pass", () => {
  // The guard is an exact match, not a suffix test — otherwise
  // zippily.co.nz.evil.com would be treated as production.
  assert.equal(isIndexableHost("zippily.co.nz.evil.com"), false);
  assert.equal(isIndexableHost("notzippily.co.nz"), false);
  assert.equal(isIndexableHost("www.zippily.co.nz.attacker.net"), false);
});

test("a missing or empty host is not indexable", () => {
  assert.equal(isIndexableHost(null), false);
  assert.equal(isIndexableHost(undefined), false);
  assert.equal(isIndexableHost(""), false);
});
