type Span = { text?: string | null };
type Block = {
  _type?: string;
  style?: string | null;
  listItem?: string | null;
  children?: Span[] | null;
};

const textOf = (block: Block) =>
  (block.children ?? []).map((child) => child.text ?? "").join("").trim();

const FAQ_HEADING = /^frequently asked questions$/i;

/**
 * The question-and-answer pairs in a post's own "Frequently asked questions"
 * section, read from the body so the FAQPage markup is generated from what the
 * reader can see.
 *
 * Google requires marked-up Q&A to be visible on the page. A separate `faqs`
 * field would keep the same text in two places that drift apart; reading the
 * body makes drift impossible, because the markup *is* the visible content.
 *
 * The convention: an H2 reading "Frequently asked questions", then an H3 per
 * question with the answer in the paragraphs that follow, ending at the next
 * H2. Anything that does not follow it yields no pairs, which means no
 * FAQPage — the safe failure, since a page with no FAQ must not claim one.
 */
export function faqFromBody(
  body: Block[] | null | undefined,
): { question: string; answer: string }[] {
  const blocks = (body ?? []).filter((b) => b._type === "block");
  const start = blocks.findIndex(
    (b) => b.style === "h2" && FAQ_HEADING.test(textOf(b)),
  );
  if (start === -1) return [];

  const pairs: { question: string; answer: string }[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    const a = answer.join(" ").trim();
    if (question && a) pairs.push({ question, answer: a });
    question = null;
    answer = [];
  };

  for (const block of blocks.slice(start + 1)) {
    if (block.style === "h2") break;
    if (block.style === "h3") {
      flush();
      question = textOf(block) || null;
    } else if (question) {
      const text = textOf(block);
      if (text) answer.push(text);
    }
  }
  flush();
  return pairs;
}
