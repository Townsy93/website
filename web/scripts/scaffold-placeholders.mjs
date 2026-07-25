/**
 * Fills every unbuilt service, industry and solution page with its full
 * section structure, so a copywriter can see the shape of the whole site
 * before a word of real copy is written.
 *
 *   node --env-file=.env.local scripts/scaffold-placeholders.mjs [--commit]
 *
 * Dry run by default. Nothing is written without --commit.
 *
 * The placeholders are briefs, not lorem ipsum. Each one says what belongs
 * in that slot and roughly how long it should be, because the point is for
 * someone to review the structure and know what to write — and because a
 * brief in square brackets can never be mistaken for finished copy the way
 * plausible-sounding filler can.
 *
 * Pages already built are skipped, never overwritten. Every page this
 * touches is left with pageBuilt: false, which keeps it out of the sitemap
 * and marks it noindex.
 */
const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "phzyp5b1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_READ_TOKEN;
const COMMIT = process.argv.includes("--commit");

const P = (text) => `[${text}]`;

/** Sections every service detail page (T3) carries, in render order. */
const serviceStructure = (title) => ({
  hero: {
    eyebrow: `Services › ${title}`,
    heading: P("H1 — the outcome, not the activity. 6–9 words"),
    subheading: P(
      "Sub — one sentence: what this is, who it is for, and what changes afterwards. ~25 words",
    ),
    markerStyle: "circle",
    primaryCta: { label: "Book a free scoping chat", href: "/contact" },
    secondaryCta: { label: "See pricing", href: "#pricing" },
  },
  heroMeta: P("Meta — price anchor and typical timeline. Leave blank if pricing is unconfirmed"),
  painPoints: [1, 2, 3].map((n) => ({
    _type: "iconCard",
    _key: `pain${n}`,
    title: P(`Pain ${n} — the symptom in the client's words, 3–5 words`),
    text: P(
      `Pain ${n} detail — what it costs them day to day. Concrete, not abstract. ~20 words`,
    ),
  })),
  painPointsCloser: P(
    "Closing line — name who this is for and hand off to the process section. ~20 words",
  ),
  processSteps: [1, 2, 3, 4].map((n) => ({
    _type: "iconCard",
    _key: `step${n}`,
    title: P(`Step ${n} — one word if possible`),
    text: P(`Step ${n} detail — what actually happens, and what they get. ~20 words`),
  })),
  faqs: [
    "How long does it take?",
    "What does it cost?",
    "What do you need from us?",
    "What happens afterwards?",
  ].map((question, i) => ({
    _type: "faqItem",
    _key: `faq${i + 1}`,
    question: P(`FAQ ${i + 1} — ${question}`),
    answer: P(`Answer ${i + 1} — direct, no hedging. 2–3 sentences`),
  })),
  ctaBanner: {
    heading: P("CTA — a question they would say yes to. 5–8 words"),
    text: P("CTA sub — what the first conversation involves and that it is free. ~20 words"),
    button: { label: "Book your free chat", href: "/contact" },
  },
  proofStat: {
    value: P("Stat"),
    label: P("What the number means, in plain words"),
  },
  seo: {
    metaTitle: P(`Meta title — ${title} | keep under 60 characters`),
    metaDescription: P("Meta description — the promise plus a reason to click. Under 155 characters"),
  },
});

/** Sections every industry page (T7) carries, in render order. */
const industryStructure = (title) => ({
  hero: {
    eyebrow: `Industries › ${title}`,
    heading: P(`H1 — HubSpot for ${title.toLowerCase()}, said as an outcome. 6–9 words`),
    subheading: P(
      "Sub — the problem this sector has that others do not. ~25 words",
    ),
    markerStyle: "circle",
    primaryCta: { label: "Book a free chat", href: "/contact" },
  },
  painPoints: [1, 2, 3].map((n) => ({
    _type: "iconCard",
    _key: `pain${n}`,
    title: P(`Pain ${n} — specific to this sector, 3–5 words`),
    text: P(`Pain ${n} detail — why it happens in this sector particularly. ~20 words`),
  })),
  howWeFixHeading: P("How we fix it — 4–7 words"),
  howWeFixBody: P(
    "Two or three sentences on the approach for this sector. Name the tools and the sequence.",
  ),
  checklist: [1, 2, 3, 4].map((n) =>
    P(`Checklist ${n} — one concrete thing we set up. 4–8 words`),
  ),
  faqs: [
    "Do you understand our compliance requirements?",
    "How long does it take?",
    "Can you migrate our existing data?",
  ].map((question, i) => ({
    _type: "faqItem",
    _key: `faq${i + 1}`,
    question: P(`FAQ ${i + 1} — ${question}`),
    answer: P(`Answer ${i + 1} — direct, sector-specific. 2–3 sentences`),
  })),
  ctaBanner: {
    heading: P("CTA — a question this sector would say yes to. 5–8 words"),
    text: P("CTA sub — what the first conversation involves. ~20 words"),
    button: { label: "Book your free chat", href: "/contact" },
  },
  seo: {
    metaTitle: P(`Meta title — HubSpot for ${title} | under 60 characters`),
    metaDescription: P("Meta description — sector promise plus reason to click. Under 155 characters"),
  },
});

const query = async (groq) => {
  const url = new URL(`https://${PROJECT}.api.sanity.io/v2026-07-01/data/query/${DATASET}`);
  url.searchParams.set("query", groq);
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
};

// Services and industries only. partnerIntegration (/solutions) has a
// different field set — whatItDoes, whatWeSetUp, no painPoints — so the
// service shape would write fields that page never renders. Aircall is also
// already part-written. Solutions get their own pass once Sean confirms
// which ones exist beyond Aircall.
const docs = await query(
  `*[_type in ["service","industry"]]|order(_type asc, slug.current asc){
     _id, _type, title, "slug": slug.current, pageBuilt,
     "built": defined(hero.heading) && count(painPoints) > 0
   }`,
);

const patches = [];
for (const doc of docs) {
  // Never overwrite a page someone has actually written.
  if (doc.built) {
    console.log(`  skip     ${doc._type}/${doc.slug} — already has real copy`);
    continue;
  }
  const structure =
    doc._type === "industry"
      ? industryStructure(doc.title)
      : serviceStructure(doc.title);
  patches.push({
    patch: {
      id: doc._id,
      // Only fill empty slots; never clobber anything already there.
      setIfMissing: { ...structure, pageBuilt: false },
    },
  });
  console.log(`  scaffold ${doc._type}/${doc.slug}`);
}

console.log(`\n${patches.length} page(s) to scaffold, ${docs.length - patches.length} left alone.`);

if (!COMMIT) {
  console.log("\nDry run. Re-run with --commit to write.\n");
  process.exit(0);
}
if (!TOKEN) {
  console.error("\nNo SANITY_API_WRITE_TOKEN — cannot write.\n");
  process.exit(1);
}

const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v2026-07-01/data/mutate/${DATASET}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations: patches }),
  },
);
if (!res.ok) {
  console.error(`\nWrite failed: ${res.status} ${await res.text()}\n`);
  process.exit(1);
}
console.log(`\nScaffolded ${patches.length} page(s). All left as pageBuilt: false.\n`);
