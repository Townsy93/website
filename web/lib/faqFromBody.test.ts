import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqFromBody } from "./faqFromBody.ts";

const block = (style: string, text: string, extra: object = {}) => ({
  _type: "block",
  style,
  children: [{ text }],
  ...extra,
});

describe("faqFromBody", () => {
  it("reads question and answer pairs from the FAQ section", () => {
    const pairs = faqFromBody([
      block("h2", "What is it?"),
      block("normal", "Intro text."),
      block("h2", "Frequently asked questions"),
      block("h3", "Is it free?"),
      block("normal", "Mostly."),
      block("h3", "Is it in beta?"),
      block("normal", "Yes."),
    ]);
    assert.deepEqual(pairs, [
      { question: "Is it free?", answer: "Mostly." },
      { question: "Is it in beta?", answer: "Yes." },
    ]);
  });

  it("stops at the next H2, so a closing call to action is not an answer", () => {
    // The post ends "Thinking about running your projects in HubSpot?" as an
    // H2 after the FAQ. Its paragraph must not be swallowed into the last
    // answer, or the schema would carry text that is not part of the FAQ.
    const pairs = faqFromBody([
      block("h2", "Frequently asked questions"),
      block("h3", "Q?"),
      block("normal", "A."),
      block("h2", "Thinking about it?"),
      block("normal", "Let's chat."),
    ]);
    assert.deepEqual(pairs, [{ question: "Q?", answer: "A." }]);
  });

  it("joins an answer that runs over several paragraphs", () => {
    const pairs = faqFromBody([
      block("h2", "Frequently asked questions"),
      block("h3", "Q?"),
      block("normal", "First."),
      block("normal", "Second."),
    ]);
    assert.deepEqual(pairs, [{ question: "Q?", answer: "First. Second." }]);
  });

  it("matches the heading case-insensitively", () => {
    assert.equal(
      faqFromBody([
        block("h2", "FREQUENTLY ASKED QUESTIONS"),
        block("h3", "Q?"),
        block("normal", "A."),
      ]).length,
      1,
    );
  });

  it("returns nothing when there is no FAQ section", () => {
    // Every post written before this one. No FAQ means no FAQPage claim.
    assert.deepEqual(
      faqFromBody([block("h2", "Something else"), block("normal", "Text.")]),
      [],
    );
    assert.deepEqual(faqFromBody(null), []);
    assert.deepEqual(faqFromBody(undefined), []);
  });

  it("drops a question that has no answer rather than emitting an empty one", () => {
    const pairs = faqFromBody([
      block("h2", "Frequently asked questions"),
      block("h3", "Orphan question?"),
      block("h3", "Answered?"),
      block("normal", "Yes."),
    ]);
    assert.deepEqual(pairs, [{ question: "Answered?", answer: "Yes." }]);
  });

  it("does not mistake a heading with extra words for the FAQ section", () => {
    assert.deepEqual(
      faqFromBody([
        block("h2", "Frequently asked questions about pricing"),
        block("h3", "Q?"),
        block("normal", "A."),
      ]),
      [],
    );
  });
});
