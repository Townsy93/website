# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read [docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md) first.** It is the map across all three
Zippily repos (this one, the private portal repo, and the private AI Brain repo): what's deployed,
where credentials live, the pricing source of truth, and the operational traps that have already
caused real faults. This file covers only what's local to this repo.

## Repo structure

This is a monorepo with three independent Node projects — each has its own `package.json` and is
worked on from its own directory, not the root:

- **`web/`** — Next.js 16 (App Router, TypeScript, Tailwind v4) marketing site. Deployed to
  Cloudflare Workers via the OpenNext adapter.
- **`studio/`** — Sanity Studio (project ID `phzyp5b1`, dataset `production`). Content schema and
  editorial tooling for the marketing site.
- **`health/`** — Cloudflare Worker that runs a weekly synthetic check of the live site (redirects,
  broken pages) and emails a report on failure.

## Commands

Run these from inside the relevant subdirectory (`web/`, `studio/`, or `health/`), not the repo root.

### web/
```bash
npm run dev             # Next dev server
npm run build           # next build
npm run lint            # eslint
npm test                # node --test --experimental-strip-types lib/*.test.ts
npm run preview         # opennextjs-cloudflare build && preview (Cloudflare Worker simulation)
npm run deploy          # opennextjs-cloudflare build && deploy
```
Run a single test file directly: `node --test --experimental-strip-types lib/vimeo.test.ts`.
Tests live next to the code they cover (`lib/vimeo.ts` / `lib/vimeo.test.ts`,
`components/Analytics.tsx` / `components/Analytics.test.ts`) — there is no separate `__tests__` tree.

### studio/
```bash
npm run dev             # sanity dev — local Studio
npm run deploy          # sanity deploy — hosted Studio
npm run typegen         # sanity schema extract --enforce-required-fields --force && sanity typegen generate
```
Run `typegen` after any schema change under `schemaTypes/` — it regenerates the types `web/`
imports from `next-sanity`. Never hand-write Sanity content types.

### health/
```bash
npm test                # vitest run
npm run deploy          # wrangler deploy
npm run tail            # wrangler tail — live logs from the deployed check
```

## Architecture

### Content flow: Studio → Sanity → web
`studio/schemaTypes/` defines documents (`service`, `caseStudy`, `blogPost`, `industry`,
`landingPage`, `teamMember`, …), reusable objects (`hero`, `ctaBanner`, `pricing`, `seo`, …), and
singletons (`homePage`, `siteSettings`, `servicesLandingPage`, …). `web/sanity/queries.ts` holds the
GROQ queries; `web/sanity/fetch.ts` (`sanityFetch`) is the only way pages should read Sanity — it
handles both the published/CDN path and the draft-mode/Presentation path (live drafts with stega
click-to-edit) based on whether Studio's draft-mode cookie is set.

### Cache invalidation is tag-based, not time-based
`sanityFetch` tags every request by document type, derived automatically from the query text
(`tagsForQuery` in `web/sanity/fetch.ts` regexes out `_type == "..."` and `_type in [...]`).
`web/app/api/revalidate/route.ts` is the Sanity publish webhook: on publish it revalidates the tag
for that document's type, plus a `FANOUT` map for types only ever reached via a dereference (e.g.
publishing a `pricingTable` also revalidates `service`, since a service page's query never says
`_type == "pricingTable"` directly). **If you add a new document type that's referenced by
dereference from another type's query, add it to `FANOUT`** or publishing it will silently purge
nothing. `siteSettings` and `redirect` changes are always treated as global.

### Deploy targets Cloudflare Workers, not Vercel
Both `web/` and `health/` deploy as Cloudflare Workers (`web` via `@opennextjs/cloudflare`, `health`
directly via `wrangler`). `web/wrangler.jsonc` binds an R2 bucket for career-application uploads
(never publicly addressable — served through an authenticated route), plus the OpenNext incremental
cache (R2) and tag cache (KV) that `revalidateTag` depends on. `NEXT_PUBLIC_*` env vars are inlined
at Next build time — a `wrangler`-only var change does nothing until the npm build/deploy scripts
re-run the build.

### Redirects
Legacy Squarespace URL → new-site 301s live in `web/next.config.ts` as `LEGACY_REDIRECTS`, matched
against `docs/launch-redirects.csv`. Each entry's comment explains *why* that mapping was chosen
(e.g. sending to a specific post instead of the placeholder service page) — read the surrounding
comments before changing one. `health/src/expected.ts` encodes the same redirects as assertions the
weekly check verifies against the live site.

### Route structure (web/app)
- `(site)/` — the marketing site route group (services, industries, our-work, insights, about-us,
  careers, events, resources, platforms, contact, privacy-policy).
- `lp/[slug]/` — standalone landing pages (Sanity `landingPage` documents), deliberately outside the
  `(site)` group/layout.
- `api/revalidate`, `api/draft-mode`, `api/careers` — webhook, Sanity Presentation draft-mode
  enable/disable, and the careers CV-upload endpoint (writes to R2, never client-side).

### Components
`components/modules/` are Sanity-driven page sections (one per content module type — `HeroVideo`,
`PricingSection`, `TestimonialCards`, `FaqAccordion`, etc.), assembled per-page from whatever modules
that page's Sanity document includes. `components/ui/` are presentational primitives (buttons, the
hand-drawn `Marker` annotation, `SanityImage`). Server Components by default; `"use client"` only
where a module needs interactivity (accordions, filters, forms, carousels).

## Design & brand rules

The approved high-fidelity designs live in the (now-retired, frozen as of 10 Aug 2026) prototype
repo `Townsy93/Website-prototype` — pull exact spacing/structure/layout from there rather than
improvising; design revisions now land directly in this repo.

- Colours: Deep Blue `#0E2F4A` (dark sections), Off-White Tan `#F1F1E4` (light sections), Deep
  Orange `#F77B23` (primary accent, **only ever on Deep Blue backgrounds — never on white/light**),
  Sky Blue `#83B5D1` (secondary accent).
- Emphasis is a hand-drawn marker-style circle/underline (SVG), never a highlight-fill block.
  Sections alternate dark/light. Typography is Archivo only, no secondary typeface.
- Type scale (desktop/line-height): H1 48/56, H2 36/44, H3 24/32, H4 18/26, body-lg 18/28,
  body 16/26, caption 13/18. Headings -6% tracking, body -3% tracking.
- Nav: logo left, persistent "Let's talk" button (→ `/contact`) top-right, no dropdown on Services;
  About Us has a small dropdown (About Us / Careers / Events). One CTA banner per page max.
- Mobile: card grids collapse to 1 column, pricing tiers stack (never horizontal swipe).
- Tone: warm, genuine, direct; no robotic transition words ("furthermore", "in conclusion"); real
  stories over generic claims.

## Code conventions

- TypeScript strict mode everywhere, no `any`.
- Tailwind v4: brand tokens defined in CSS `@theme`; components reference tokens, never raw hex.
- Sanity: camelCase fields, types generated via `sanity typegen` — never hand-written.

## Pricing — hard rule

**Never publish or change a price without checking
`Knowledge/Services-And-Pricing/PRICING-CHANGELOG.md` in the (private) AI Brain repo first** — it is
the sole authority on pricing, overriding anything already in this repo, Drive, or a service brief.
See [docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md) for the full precedence order and the
incident that made this a hard rule.
