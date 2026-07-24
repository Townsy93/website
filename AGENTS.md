# Zippily Website — Project Conventions

This repo is the production build of zippily.co.nz. Zippily is an Auckland-based
HubSpot implementation and RevOps agency (HubSpot Gold Partner).

## Repo structure

- `/studio` — Sanity Studio (project ID `phzyp5b1`, dataset `production`). Clean
  schema, TypeScript. Schema gets built in Phase 2 — do not invent document types
  ad hoc before then.
- `/web` — Next.js (App Router, TypeScript, Tailwind v4). Deployed to Cloudflare
  Workers via the OpenNext adapter (`@opennextjs/cloudflare`). Build/deploy
  scripts: `npm run preview`, `npm run deploy` (from `/web`).

## Design reference

The approved high-fidelity designs live in the prototype repo:
https://github.com/Townsy93/Website-prototype
When building any page or component, pull exact spacing, structure, and layout
from the prototype — do not improvise layouts.

## Brand rules (non-negotiable)

- Colours: Deep Blue `#0E2F4A` (dark sections), Off-White Tan `#F1F1E4` (light
  sections), Deep Orange `#F77B23` (primary accent), Sky Blue `#83B5D1`
  (secondary accent), plus black/white.
- **Deep Orange is only ever used on Deep Blue backgrounds. Never Deep Orange
  text or elements on white/light backgrounds.**
- Emphasis treatment: hand-drawn marker-style circle or underline around text
  (SVG annotation style). **Never a solid highlight-fill block behind text.**
- Sections alternate dark (Deep Blue) and light (Off-White Tan).
- Typography: Archivo only (via `next/font/google`). No secondary typeface, no
  PT Serif. Headings: SemiBold, -6% letter-spacing (`-0.06em`). Body: Regular,
  -3% letter-spacing (`-0.03em`).
- Type scale (desktop / line-height): H1 48/56 (32–36 on mobile), H2 36/44,
  H3 24/32, H4 18/26, body-lg 18/28, body 16/26, caption 13/18.
- The wordmark/brand name is set lowercase ("zippily") in stylised headline use.
- People imagery is featured prominently on every page — the site must feel
  human and hand-made, never AI-generated or templated.

## Code conventions

- TypeScript strict mode everywhere. No `any`.
- Tailwind v4: define brand tokens in CSS `@theme` (colours, type scale,
  tracking) — components reference tokens, never raw hex values.
- React Server Components by default; `"use client"` only where interactivity
  requires it (accordions, carousels, filters, forms, exit-intent).
- Sanity: camelCase field names, robust validations, types generated via
  Sanity TypeGen — never hand-written content types.
- Env vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` in
  `web/.env.local` (gitignored) and mirrored in Cloudflare build settings.

## Global UI rules

- Nav: logo left; items Home, Services, Solutions, About Us, Industries,
  Our Work, Insight Hub; persistent **"Let's talk"** button top-right (links to
  /contact) that stays visible on scroll — this replaces any "Contact" text
  link. No dropdown on Services (flat landing page). About Us has a small
  dropdown: About Us / Careers / Events.
- Footer: newsletter signup (Klaviyo), social links, standard footer nav.
- One CTA banner per page maximum (bottom) — the sticky nav button covers the
  always-available ask.
- Mobile: card grids collapse to 1 column, pricing tiers stack (never
  horizontal swipe), hover interactions need touch equivalents, nav needs a
  proper nested mobile menu.

## Content rules

- No robotic transition words ("furthermore", "in conclusion").
- Warm, genuine, direct tone. Real stories over generic claims.
- Never publish pricing for services whose pricing is still flagged as blocked.

## Build plan

The phased plan lives in `zippily-build-phases-v3.md` (Sean has it). Current
phase and its exit criteria govern scope — do not build ahead of the current
phase without being asked.
