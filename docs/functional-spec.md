# Zippily Website — Functional Spec (Phase 1)

Companion to `template-module-inventory.md` (T# = template, M#/F# = module/
form references). Scope: routes, per-template behaviour, interactivity model,
integrations, and content-model implications for the Sanity schema (Phase 2).

---

## 1. Route map

From the page tracker (15 Jul 2026). Priority 1 = build first.

| Route | Template | Tracker status | Priority |
|-------|----------|----------------|----------|
| `/` | T1 Home | Layout wireframed, content ready | 1 |
| `/services` | T2 Services landing | Content blocked (pricing ruling D2) | 1 |
| `/services/crm-implementation` | T3 | Ready — tiers $7,500/$12,000/$18,000 | 2 |
| `/services/hubspot-audit` | T3 | Blocked — pricing tiers undefined | 2 |
| `/services/hubspot-training` | T3 | Ready — $750 half / $1,200 full day | 3 |
| `/services/marketing-automation` | T3 | Partial — reconcile pricing. One page, two anchors (Strategy/Implementation cards both land here) | 2 |
| `/services/ai-solutions` | T3 | Partial — pricing gap; cross-links Claude card on `/solutions` | 2 |
| `/services/revops-retainers` | T3 | Ready — $2,500/$3,000/$4,500 (reconcile live "from $3,200") | 3 |
| `/services/post-sales-excellence` | T3 | Blocked — scope undefined | 3 |
| `/services/customer-journey-mapping` | T3 | Ready — $1,250 | 3 |
| `/services/websites-and-integrations` | T3 | Blocked — pricing both scopes; absorbs Xero content | 2 |
| `/services/landing-page-package` | T3 | Blocked — pricing undefined | 3 |
| `/solutions` | T4 Solutions | Blocked (copy) | 2 |
| `/solutions/aircall` | T5 | Partial — no prototype (D5) | 3 |
| `/about-us` | T12 About | Partial — team fields + video decision (D6) | 1 |
| `/about-us/careers` | (none — not card-sorted) | Blocked | 4 |
| `/about-us/events` | (none — not card-sorted; manual events, Humanatix dropped) | Blocked | 4 |
| `/industries` | T6 Industries hub | Ready | 3 |
| `/industries/financial-services` | T7 | Partial | 3 |
| `/industries/manufacturing` | T7 (reduced variant) | Blocked — hub card links to CRM Implementation until built | 4 |
| `/industries/non-profits` | T7 | Partial | 3 |
| `/industries/saas` | T7 | Partial | 3 |
| `/industries/agencies` | T7 (reduced) | Blocked — hub card links to CRM Implementation until built | 4 |
| `/industries/property-development` | T7 | Partial — closest to launch-ready | 3 |
| `/industries/land-surveying` | T7 | Blocked — House Surveys case study anchors it | 4 |
| `/our-work` | T8 Our Work hub | Partial | 2 |
| `/our-work/accounting-for-nature` | T9 | Ready (needs template design, D5) | 3 |
| `/our-work/house-surveys` | T9 | Ready | 3 |
| `/our-work/novated-lease-australia` | T9 | Blocked — "coming soon" card state until then | 4 |
| `/our-work/ph-digital` | T9 | Blocked | 4 |
| `/our-work/mywave` | T9 | Blocked | 4 |
| `/insights` | T10 Insight Hub | Ready | 2 |
| `/insights/[slug]` | T11 Blog post | Ready — ~20 posts to migrate, audit low-impression posts first | 3 |
| `/contact` | T13 Contact | Ready | 1 |
| `/privacy-policy` | Legal | Keep as-is | — |
| Landing pages (TBD path, e.g. `/lp/free-hubspot-audit`) | T14 | Free-audit variant designed | — |
| `/resources` (Downloadable resources) | placeholder | Not designed — ship placeholder or defer route | 4 |

Redirects: every "Existing URL (Squarespace)" in the tracker needs a 301 to
its new route at cutover (e.g. `/our-solutions` → `/services`,
`/crm-audit` → `/services/hubspot-audit`, `/blog/*` → `/insights/*`,
`/case-studies/*` + `/testimonials` → `/our-work…`). Full list lives in the
tracker columns; implement as Next.js `redirects()` in Phase 5/launch.

---

## 2. Global behaviour

### Header (M1)
- Locked IA: Home, Services, Solutions, About Us▾ (About Us / Careers /
  Events), Industries, Our Work, Insight Hub. Persistent "Let's talk" →
  `/contact`, visible on scroll. No Contact text link. No Services dropdown.
- Visual: prototype pill style — translucent Deep Blue, blur, fully rounded,
  sticky. (Replaces the Phase 0 flat tan header treatment.)
- Mobile: burger with nested About Us group; "Let's talk" stays reachable.
- T14 landing pages suppress the nav entirely: logo + Gold Partner status
  pill only, slim footer (M2b).

### Section rhythm
Deep Blue (hero) → White ↔ Off-White Tan alternating → Deep Blue (CTA
banner) → Deep Blue (footer). Orange accents per brand rule (pending D4
ruling for light-background accents).

### CTA policy
One CTA banner (M3) per page, at the bottom. All hard CTAs point to
`/contact` or the HubSpot meetings link (`meetings-ap1.hubspot.com/stowson`).
Home's banner embeds the meetings widget directly (F4).

### Typography & tokens
Locked scale from AGENTS.md (already tokenised in `web/app/globals.css`).
Add derived tokens when needed: orange-hover `#E06910`, deep-blue-80
`#3A5870` (body text on light), deep-blue-20 `#CDD8E0` (borders), deep-blue
tinted shadows. Icons: Lucide (2px stroke), consistent with prototype.

---

## 3. Interactivity model (server vs client)

React Server Components by default. Client components ("use client") only:

| Component | Why client | Notes |
|-----------|-----------|-------|
| Header | mobile menu + dropdown state | already exists from Phase 0; restyle to pill |
| ServiceFilterPills (T2) | Discover/Build/Scale filter state | filtering is show/hide over an 11-card server-rendered grid; cards themselves stay server |
| InsightFilters (T10) | Topic + Hub dropdowns, search, load-more, no-results state | AND logic: topic exact + hub includes + title substring; selecting resets paging to 3, load-more adds 3; click-outside closes menus |
| Carousel (shared) | arrow buttons + scroll-snap | used by: Hub carousel (T4, 340px cards), testimonial carousel (About, 520px cards), culture strip (About, swipe-only), Home services drag-row (drag-to-scroll + click suppression), mobile testimonial swipe (Home). One component, config for arrows/drag/snap |
| ContactForm (F1) | field state + success swap | submit → HubSpot (see §4) |
| LeadForm (F2) | field state + success swap | landing pages |
| NewsletterForm (F3) | submit state | footer + band variants |
| VideoCard (M15) | play button → player | player choice TBD (YouTube embed lightbox is simplest; videos still in production) |

Server-rendered (no client JS): FAQ accordions (native `<details name>` —
adopt everywhere incl. Contact, replacing its JS accordion), team-card and
service-card hover reveals (CSS only), nav dropdown on desktop (CSS
hover/focus-within), marker annotations (inline SVG), stat bars, all grids.

SEO requirement (from brief): all carousel content — especially the Solutions
Hub carousel — must be in the page HTML, not click-to-reveal-only. Scroll-snap
tracks satisfy this; avoid JS-mounted slides.

---

## 4. Forms & integrations

| Integration | Where | Approach |
|-------------|-------|----------|
| HubSpot meetings | Home CTA banner (embed), all "Book a call" links | iframe embed `?embed=true`; replace T14's mock calendar with the live widget |
| HubSpot forms/CRM | Contact form (F1), lead form (F2) | submit to HubSpot Forms API; field set + the 10 "How can we help?" options per inventory F1. Add validation states (prototype flags this as next step) |
| Klaviyo | Newsletter (F3, footer + band) | Klaviyo list subscribe; consent checkbox on band variant |
| Chat (M34) | Landing (and site-wide?) | Decision needed: HubSpot chat widget vs cut |
| Video | Our Work testimonials, possible About video (D6) | TBD — videos in production per tracker |

Env/config: keep all third-party IDs (portal ID, form GUIDs, Klaviyo list ID)
in env vars mirrored to Cloudflare, same pattern as the Sanity vars.

---

## 5. Content model implications (feeds Phase 2 schema)

Straight from tracker schema hints + what the prototypes actually render:

**Documents**: `service` (10), `industry` (7), `caseStudy` (5+) — needs BOTH a
service reference and an industry reference (cards are tagged by service in
Our Work/Services contexts and by industry in Industries contexts — D11),
plus a `status` (live / coming-soon) driving the M10 card state; `blogPost`
(~20 + 14 drafts; author → teamMember, topic, hubs[], readTime, draft
status); `teamMember` (4–5; name, role, bio, outsideWork, skills,
favouriteHubSpotFeature, whyTheyLoveHubSpot, linkedIn, photo — hover-panel
fields per M13); `hubOffering` (8 carousel entries; Claude flagged
`isFeatured` for the distinct card style); `partnerIntegration` (Aircall);
`testimonial` (quote, name, role, company, avatar, optional video ref);
`event` (future, manual — Humanatix dropped).

**Singletons**: homePage, servicesLandingPage, solutionsPage, aboutPage,
industriesHubPage, ourWorkPage, insightHubPage, contactPage, careersPage,
eventsPage, legalPage.

**Shared objects**: hero (variant enum per §3 of inventory; emphasis phrase +
markerStyle circle|underline), ctaBanner, faqItem, trustBar (variant enum),
stat (value, label, isPlaceholder), pricingTier + pricing object with
`confirmed` boolean (drives M18's two states — mirrors the tracker's
"never publish blocked pricing" rule at the schema level), processStep,
painPoint, checklist item, badge/pill (style enum).

**Taxonomies** (from the working Insight Hub filters):
- Topic: Feature spotlights, Best practices, News and events, Our approach,
  AI developments
- Hub: Sales Hub, Service Hub, Marketing Hub, Content Hub, Revenue Hub,
  Data Hub, Breeze AI
- Service category: Discover, Build, Scale (drives T2 filter pills; Marketing
  Automation appears in two categories via its two cards)

**Template composition rules**: T7 renders proof + testimonial sections only
when the industry has a linked caseStudy/testimonial (designed-in droppable
blocks); T3 renders tiers only when pricing `confirmed`, else the
"scoped individually" card; M10 renders coming-soon state from caseStudy
status; M21 stats support a placeholder flag (never render dashed placeholder
styling in production — require real values).

---

## 6. Image inventory (for the content-gathering track)

People imagery is required on every page (brand rule). Slots the prototypes
define: Home hero (team at work, ~1200×420 area), About (11 slots: hero
team/Sean 480px, 2 candid pillar photos 400px, 3 circular headshots 132px +
Bailey's missing, 4 culture photos 280×320, founding-story photo 560px),
Our Work hero (4:5 portrait), Insight Hub hero + featured + 5 post images +
author avatars, per-case-study photos (~214px cards + proof panels 380px+),
Contact hero (5:4 team photo), client logos (permission check pending per
About prototype note), video stills ×3. Reviewer avatars ×4 (Services hero).

---

## 7. Open items blocking later phases

Resolved 24 Jul 2026: D1 (locked nav IA in pill style), D2 (no prices on
Services landing cards), D3 (fix "Ten services" copy), D4 (strict
orange-on-Deep-Blue-only — recolour prototype's light-background orange
accents to Deep Blue/Sky Blue), D5 (case study detail template derived from
the module library, reviewed in-browser).

Still open:
1. D6 About video decision; D10 real contact details; M34 chat decision
2. Careers/Events card-sorts; Aircall + Resources page designs (Priority 3–4)
3. Video testimonial assets (3 in production)
4. Client logo permissions; candid team photography; Bailey's profile content
5. Real stat values (brands count "TBC+", verify 23/11/40+ figures at launch)
6. Individual service pricing gaps per route table (audit, marketing
   automation reconciliation, websites & integrations, landing page package,
   post-sales scope)
