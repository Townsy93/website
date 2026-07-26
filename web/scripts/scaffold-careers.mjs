/**
 * Creates the careers page and one example vacancy, as structure only.
 *
 *   node --env-file=.env.local scripts/scaffold-careers.mjs [--commit]
 *
 * Dry run by default. Skips anything that already exists.
 *
 * The example vacancy is titled and noindexed so it can never be mistaken
 * for a real opening. Delete it before the site goes live — it exists so the
 * vacancy template can be reviewed while no role is actually open.
 */
const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "phzyp5b1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const COMMIT = process.argv.includes("--commit");
const P = (text) => `[${text}]`;

const query = async (groq) => {
  const url = new URL(`https://${PROJECT}.api.sanity.io/v2026-07-01/data/query/${DATASET}`);
  url.searchParams.set("query", groq);
  const res = await fetch(url, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} });
  if (!res.ok) throw new Error(`Sanity ${res.status}`);
  return (await res.json()).result;
};

const existing = await query(
  `{"page": *[_type=="careersPage"][0]._id, "example": *[_type=="vacancy" && slug.current=="example-senior-hubspot-consultant"][0]._id}`,
);

const mutations = [];

if (existing.page) {
  console.log("  skip     careersPage — already exists");
} else {
  console.log("  create   careersPage");
  mutations.push({
    create: {
      _id: "careersPage",
      _type: "careersPage",
      hero: {
        eyebrow: "Careers",
        heading: P("H1 — must contain both Careers and Auckland, 6–10 words"),
        subheading: P("Sub — who thrives here and what the work is actually like. ~30 words"),
        markerStyle: "circle",
        primaryCta: { label: "See all open roles", href: "#open-roles" },
      },
      storyRows: [
        {
          _key: "story1",
          eyebrow: "OUR STORY",
          body: P("Our story — where Zippily came from and why. Reuse the About Us hero. ~60 words"),
          imagePosition: "left",
        },
        {
          _key: "story2",
          eyebrow: "WHAT SETS US APART",
          body: P(
            "The differentiator — few clients at a time, direct access to senior people. Reuse the /our-solutions FAQ answer nearly verbatim; it is the strongest copy on the site. ~60 words",
          ),
          imagePosition: "right",
        },
      ],
      values: [
        { _key: "v1", label: P("Value 1 — warmed up from Client-Centered Insight"), body: P("What it means day to day, in plain words. ~30 words") },
        { _key: "v2", label: P("Value 2 — warmed up from Excellence Without Compromise"), body: P("What it means day to day. ~30 words") },
        { _key: "v3", label: P("Value 3 — warmed up from Continuous Improvement"), body: P("What it means day to day. ~30 words") },
      ],
      whyIntro: P("Why work here — the honest pitch. Small team, real ownership, no bench. ~50 words. NET-NEW WRITING"),
      benefits: [
        { _key: "b1", icon: "graduation-cap", heading: P("Benefit 1 — 2–4 words"), body: P("What it actually gets you. ~20 words. NET-NEW") },
        { _key: "b2", icon: "calendar", heading: P("Benefit 2 — 2–4 words"), body: P("What it actually gets you. ~20 words. NET-NEW") },
        { _key: "b3", icon: "heart", heading: P("Benefit 3 — 2–4 words"), body: P("What it actually gets you. ~20 words. NET-NEW") },
      ],
      openRolesHeading: "Open positions",
      emptyStateMessage:
        "No roles open right now — we're always keen to hear from experienced HubSpot people.",
      registerInterest: {
        heading: P("Register interest heading — 5–8 words"),
        body: P("What happens to a speculative application and when they'd hear back. ~25 words"),
      },
      seo: {
        metaTitle: P("Meta title — Careers at Zippily | HubSpot jobs Auckland"),
        metaDescription: P("Meta description — who you're hiring and why someone would want this. Under 155 characters"),
      },
    },
  });
}

if (existing.example) {
  console.log("  skip     example vacancy — already exists");
} else {
  console.log("  create   example vacancy (noindexed, delete before launch)");
  mutations.push({
    create: {
      _type: "vacancy",
      title: "[EXAMPLE] Senior HubSpot Consultant",
      slug: { _type: "slug", current: "example-senior-hubspot-consultant" },
      status: "open",
      workArrangement: "hybrid",
      employmentType: "fullTime",
      location: "Auckland, New Zealand",
      department: "delivery",
      summary: P("Card summary — the role in two lines, written to make the right person click. Max 200 chars"),
      description: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "s1",
              text: P("About the role — what this person owns, who they work with, what success looks like after six months. 2–3 paragraphs"),
            },
          ],
        },
      ],
      responsibilities: [1, 2, 3, 4].map((n) => P(`Responsibility ${n} — start with a verb, be concrete. 8–15 words`)),
      requirements: [1, 2, 3].map((n) => P(`Requirement ${n} — real must-haves only; every extra one costs applicants. 8–15 words`)),
      niceToHave: [1, 2].map((n) => P(`Nice to have ${n} — genuinely optional. 6–12 words`)),
      publishedAt: new Date().toISOString(),
      seo: {
        metaTitle: P("Meta title — role title + Zippily + Auckland"),
        metaDescription: P("Meta description — the role and the hook. Under 155 characters"),
        // An example role must never reach Google Jobs.
        noIndex: true,
      },
    },
  });
}

console.log(`\n${mutations.length} document(s) to create.`);
if (!COMMIT) {
  console.log("\nDry run. Re-run with --commit to write.\n");
  process.exit(0);
}
if (!mutations.length) process.exit(0);
if (!TOKEN) {
  console.error("\nNo SANITY_API_WRITE_TOKEN — cannot write.\n");
  process.exit(1);
}

const res = await fetch(`https://${PROJECT}.api.sanity.io/v2026-07-01/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({ mutations }),
});
if (!res.ok) {
  console.error(`\nWrite failed: ${res.status} ${await res.text()}\n`);
  process.exit(1);
}
console.log(`\nCreated ${mutations.length} document(s).\n`);
