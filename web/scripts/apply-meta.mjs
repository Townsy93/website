/**
 * Applies the confirmed meta titles and descriptions from the SEO sheet.
 *
 *   node --env-file=.env.local scripts/apply-meta.mjs <csv> [--commit]
 *
 * Dry run by default.
 *
 * Only rows the sheet marks OK on both length checks are applied. Rows
 * flagged Short, carrying a CHECK note, or pointing at a page that does not
 * exist are reported instead of guessed at — a meta description is the copy
 * a search result is judged on, so a half-right one is worse than none.
 */
import { readFileSync } from "node:fs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "phzyp5b1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const COMMIT = process.argv.includes("--commit");
const CSV = process.argv[2];

/** Minimal RFC-4180 parser — fields contain commas, quotes and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** URL -> Sanity document id. */
function docIdFor(url) {
  const map = {
    "/": "homePage",
    "/services": "servicesLandingPage",
    "/contact": "contactPage",
    "/solutions": "solutionsPage",
    "/about-us": "aboutPage",
    "/careers": "careersPage",
    "/events": "eventsPage",
    "/industries": "industriesHubPage",
    "/our-work": "ourWorkPage",
    "/insights": "insightHubPage",
    "/privacy-policy": "legalPage-privacy-policy",
    "/solutions/aircall": "partnerIntegration-aircall",
  };
  if (map[url]) return map[url];
  let m = url.match(/^\/services\/([a-z0-9-]+)$/);
  if (m) return `service-${m[1]}`;
  m = url.match(/^\/industries\/([a-z0-9-]+)$/);
  if (m) return `industry-${m[1]}`;
  return null;
}

const rows = parseCsv(readFileSync(CSV, "utf8"));
const head = rows[0].map((h) => h.trim());
const col = (name) => head.findIndex((h) => h.startsWith(name));
const iUrl = col("Proposed URL");
const iTitle = col("Meta title");
const iTitleCheck = col("Title check");
const iDesc = col("Meta description");
const iDescCheck = col("Desc check");
const iNotes = col("Notes");
const iPage = col("Page");

const existing = await (
  await fetch(
    `https://${PROJECT}.api.sanity.io/v2026-07-01/data/query/${DATASET}?query=${encodeURIComponent(
      "*[defined(_id)]._id",
    )}`,
  )
).json();
const ids = new Set(existing.result ?? []);

const apply = [], skipped = [];
for (const r of rows.slice(1)) {
  if (!r[iUrl]) continue;
  const url = r[iUrl].trim();
  const page = r[iPage].trim();
  const title = r[iTitle].trim();
  const desc = r[iDesc].trim();
  const notes = (r[iNotes] ?? "").trim();
  const id = docIdFor(url);

  if (!id) { skipped.push([page, url, "no page of that URL exists yet"]); continue; }
  if (!ids.has(id)) { skipped.push([page, url, `no document ${id}`]); continue; }
  if (!title) { skipped.push([page, url, "no title in the sheet"]); continue; }

  const reasons = [];
  if (r[iTitleCheck].trim() !== "OK") reasons.push(`title ${r[iTitleCheck].trim()}`);
  if (desc && r[iDescCheck].trim() !== "OK") reasons.push(`description ${r[iDescCheck].trim()}`);
  if (/^CHECK:/i.test(notes)) reasons.push(notes.replace(/^CHECK:\s*/i, ""));
  if (reasons.length) { skipped.push([page, url, reasons.join("; ")]); continue; }

  apply.push({
    patch: {
      id,
      set: { "seo.metaTitle": title, ...(desc ? { "seo.metaDescription": desc } : {}) },
    },
  });
  console.log(`  apply  ${url.padEnd(38)} ${title.slice(0, 52)}`);
}

console.log(`\n${apply.length} to apply, ${skipped.length} held back:\n`);
for (const [page, url, why] of skipped) {
  console.log(`  hold   ${page.slice(0, 24).padEnd(26)} ${url.padEnd(38)} ${why}`);
}

if (!COMMIT) { console.log("\nDry run. Re-run with --commit.\n"); process.exit(0); }
if (!TOKEN) { console.error("\nNo SANITY_API_WRITE_TOKEN.\n"); process.exit(1); }

const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v2026-07-01/data/mutate/${DATASET}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ mutations: apply }),
  },
);
if (!res.ok) { console.error(`\nFailed: ${res.status} ${await res.text()}\n`); process.exit(1); }
console.log(`\nApplied to ${apply.length} page(s).\n`);
