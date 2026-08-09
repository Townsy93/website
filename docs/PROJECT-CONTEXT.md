# Zippily website & portal — project context

*Written 30 July 2026, so this survives a change of Claude plan, workspace or
machine. Everything here previously lived in a chat history or in machine-local
memory, neither of which moves with you.*

**Read this first if you are new to the work, or picking it up in a new
session.** It is the map. The detail lives in the repos it points at.

---

## The three repositories

| Repo | What it is |
|---|---|
| [`Townsy93/website`](https://github.com/Townsy93/website) | Marketing site. Next.js 16 + Sanity, on Cloudflare Workers. Also holds `health/`, the weekly site check. |
| [`Townsy93/zippily-portal`](https://github.com/Townsy93/zippily-portal) | Client portal (private). `app/` the portal, `sync/` the Asana + Xero cron, `alerts/` error alerting. |
| [`Townsy93/zippily-ai-brain`](https://github.com/Townsy93/zippily-ai-brain) | Business knowledge (private). **Holds the pricing changelog, which is the authority on every price.** |

Local checkouts: `~/zippily-website`, `~/zippily-portal`, `~/zippily-ai-brain`.

---

## The single most important rule

**`Knowledge/Services-And-Pricing/PRICING-CHANGELOG.md` in the AI Brain repo is
the authority on pricing.** It supersedes Drive, the website, the spreadsheets
and any service brief.

Never quote or publish a price without checking it. This is not theoretical:
on 29 July the live site was publicly showing CRM Implementation at
$12,500 / $18,000, figures the changelog had voided the day before. Several
website briefs have carried wrong prices historically, which is exactly why
the changelog wins.

Order of precedence: **changelog → Drive service briefs → the AI Brain repo →
spreadsheets.** Drive is the live source and the repo is its export, so update
Drive first; updating the repo first guarantees someone reintroduces old
figures.

---

## What is deployed

### Marketing site — not yet on the real domain

`zippily.co.nz` still serves **Squarespace**. The new site runs at
`https://website.sean-fe5.workers.dev` and moves across when DNS moves to
Cloudflare.

- **58 redirects** from the old Squarespace URLs, in `web/next.config.ts`,
  with the approved mapping in `docs/launch-redirects.csv`
- **All 96 health checks pass.** Nothing technical blocks the cutover
- Sanity project `phzyp5b1`, dataset `production`
- GA4 `G-P0NVHJ6RTS`, no consent banner (NZ Privacy Act does not require one)
- Publishing from Sanity appears live in about **52 seconds**

### Client portal — built, not open to the client

- Production `https://zippily-portal.sean-fe5.workers.dev`
- Staging `https://zippily-portal-staging.sean-fe5.workers.dev`, **separate database**
- Pilot client Novated Lease Australia. They **cannot log in**: the mail guard
  is `test` with an `@zippily.co.nz` allowlist, so a login code cannot reach them

---

## Things that will bite you

**`NEXT_PUBLIC_*` is inlined at build time.** Wrangler vars arrive too late and
only reach server code. This has caused two real faults: a login page that
crashed with an undefined app id, and a staging deploy where the browser read
production while the server wrote staging. Always deploy via the npm scripts,
which rebuild.

**Cache tags come from `_type ==` in a GROQ query. A dereference adds none.**
A service page query says `_type == "service"` then `pricingTable->{...}`, so
publishing a pricing table purged nothing. Handled now by a fanout map in
`web/app/api/revalidate/route.ts` — extend it if you add a referenced type.

**Newly tagged pages do not purge on the first publish after the change.**
Entries already cached carry no tags. One forced re-render fixes it.

**A rebuild can bake stale data.** Next caches fetches at build time — and
`.next/cache` alone is not enough: the stale prerender also survives in
`.next/server` and `.open-next` (seen live: the intro photos deployed twice
as placeholders after a `.next/cache` clear). Before a deploy that must pick
up changed Sanity content, `rm -rf .next .open-next`.

**Cloudflare rejects `0` for Sunday in cron.** Use `SUN` or `7`. The deploy
reports only "a request to the API failed", with no reason.

**`instant-cli push perms` silently pushes nothing** if it cannot find
`instant.perms.ts` at the project root. It reports success either way. The
portal has a re-export file so this works; do not delete it.

---

## Portal rules that must not be broken

1. The Asana PAT lives in Worker secrets. Never in the repo, never in the
   browser. No Asana call is ever made client-side.
2. `clientId` is always derived server-side from the session. Never from a URL
   or anything the browser supplies.
3. Asana task visibility **fails closed**. A task is hidden unless Client
   Status is explicitly set.
4. The Asana "Estimated time" field is excluded at the sync layer and never
   reaches the database. It is internal hour budgeting.
5. TypeScript strict. Sanity types via TypeGen, never hand-maintained.
6. Clients never write to Sanity or Asana directly. Writes land in InstantDB;
   a Worker pushes to Asana.

Two predicates that look similar and must stay separate: `isOpenStatus` (is
this work live) and `isClientEditable` (may the client still change it). A test
asserts they have not been merged.

---

## Where credentials live

**Every secret is set with `wrangler secret put`. None are in any repo.**

`app/.env` in the portal *is* committed, deliberately — it holds only
`NEXT_PUBLIC_*` values, which ship in the browser bundle anyway. CI fails if a
non-public key appears in it.

Secrets in use: `ASANA_PAT`, `INSTANT_ADMIN_TOKEN`, `RESEND_API_KEY`,
`SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`.

> **Outstanding: all four portal credentials need rotating before the pilot
> opens.** They have been in use throughout development.

---

## Decisions still open

| Decision | Detail |
|---|---|
| **The cost post** | `/insights/how-much-does-hubspot-implementation-cost-in-nz` is the 4th best page on the site — 676 impressions, position 12.8. Sean wants it gone for outdated pricing. Recommended: rewrite in place, keep the URL and ranking. **Not actioned.** |
| **Hours** for Marketing Automation, Revenue Hub, Website Migration, Custom Integration, Landing Page Package | Prices locked; hours never documented, so recovery against the $207–210 standard is unverified. Owner: Erica / Bailey. |
| **Audit recovery exception** | Paid audit tiers run at $167–196/hr, justified as lead generation *with the free Portal Health Snapshot as the entry point*. The Snapshot was withdrawn 30 July, so half that rationale is gone. Re-justify or reprice. |
| **Website Development vs Website Migration** | Naming unresolved; blocks building `/services/websites-and-integrations`. |
| **`/faqs`** | Redirects to `/contact`. That URL had 330 impressions, so a real FAQ page may be worth building. |

---

## What the search data actually said

Three months to 26 July: **161 clicks** across the whole site. Low enough that
every redirect decision was lower-stakes than it looked.

The real opportunity is elsewhere: **~2,000 impressions and zero clicks** on
core commercial terms — `hubspot auckland` (419, pos 21.6), `hubspot
implementation nz` (346, pos 21.5), `hubspot partner auckland` (260, pos 26).
Page 2–3 for everything worth winning. Moving those up is worth more than
every redirect combined, and it is what real service page copy is for.

**Write service pages in this order**, by the traffic their old URLs earn:
`websites-and-integrations` (967) → `marketing-automation` (451) →
`hubspot-audit` (331) → `revops-retainers` (142, but best position at 10.2).

---

## Working agreements

- **Verify against the live deployment, not the code.** Most faults this
  project hit were invisible in source and obvious in a request.
- **Deliberately break a rule and confirm the test fails**, then restore. Used
  on the portal role check, the pending-edit lock and the rate limiter.
- **Never paste a token into chat.** `wrangler secret put` prompts, or pipe
  from a file that is deleted after.
- **Deploy lag is real.** Checking immediately after a deploy misleads; poll.

---

## Also worth knowing

- Asana project **Website Launch — zippily.co.nz** (Marketing team) holds the
  task list. Read it rather than rebuilding one.
- Sean is on **paternity leave from ~September 2026**. Everything is paced
  against that.
- `hello@zippily.co.nz` is the shared inbox and should receive all form
  notifications and alerts, not a personal address.

**The prototype is retired (10 Aug 2026).** `Website-prototype` on GitHub is frozen with the v2 homepage as its final commit. The designer reviews the live build; design revisions land in this repo only.
