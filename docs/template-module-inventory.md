# Zippily Website — Template & Module Inventory (Phase 1)

Produced from a full walk of the prototype repo (all 13 designed pages, desktop
1440 + mobile 390 variants, plus the `_ds` design system) cross-referenced
against the page tracker ("Zippily | New Website Tracker", 15 Jul 2026 version).

Source of truth note: the loose `*.dc.html` files + root `index.html` navigator
are the current prototype (22 Jul, 14:55). The `zippily-prototype/` directory
and `Prototype-bundle.html` are older snapshot bundles of the same screens —
do not treat them as a separate structure.

---

## 1. Page templates

14 templates cover every row in the page tracker.

| # | Template | Prototype source | Routes served | Notes |
|---|----------|------------------|---------------|-------|
| T1 | Home | `Homepage.dc.html` | `/` | Values-led variant is the approved one |
| T2 | Services landing | `Services Landing Page.dc.html` | `/services` | Discover/Build/Scale filter pills, 11-card grid |
| T3 | Service detail | `Individual Service Page.dc.html` | `/services/[slug]` ×10 | Has `pricingConfirmed` and `emphasisStyle` (circle/underline) toggles |
| T4 | Solutions | `Solutions Page.dc.html` | `/solutions` | 8-card Hub carousel incl. distinct Claude card |
| T5 | Partner integration | (no dedicated prototype) | `/solutions/aircall` | Build from T3 minus pricing tiers — flagged below |
| T6 | Industries hub | `Industries Hub Page.dc.html` | `/industries` | 7 industry cards + "Not on the list?" CTA cell |
| T7 | Industry detail | `Individual Industry Page.dc.html` | `/industries/[slug]` ×7 | Proof + Testimonial blocks are droppable (designed-in, see 1b variant) |
| T8 | Our Work hub | `Our Work Page.dc.html` | `/our-work` | Stat bar, case grid w/ "coming soon" card state, video testimonials, Google reviews |
| T9 | Case study detail | (no prototype) | `/our-work/[slug]` ×5 | Not designed yet — flagged below |
| T10 | Insight Hub (blog index) | `Insight Hub Page.dc.html` | `/insights` | Working Topic + Hub filters, search, load-more |
| T11 | Blog post | `Individual Blog Page.dc.html` | `/insights/[slug]` | Editorial template; "short version" callout, no TOC |
| T12 | About Us | `About Us Page.dc.html` | `/about-us` | Two-promise spine, team hover cards, no video module (flagged) |
| T13 | Contact | `Contact Us Page.dc.html` | `/contact` | Side-by-side form + details card |
| T14 | Conversion landing | `Landing Page.dc.html` | landing pages (e.g. free-audit) | Minimal chrome: logo-only header, slim footer, no nav |

Placeholder-only screens: `Downloadable Resources Page.dc.html` is explicitly
"not yet designed" (hero + back-to-blog CTA only). Careers and Events have no
prototypes (tracker: not yet card-sorted). Privacy Policy needs only a simple
rich-text legal template.

`*-print.dc.html` files are PDF-export variants of four pages (via
`doc-page.js`) — not separate templates.

---

## 2. Global modules (used on every standard page)

### M1 — Header / pill nav
Floating translucent Deep Blue pill (`rgba(10,33,54,0.94)`, blur, 999px
radius), sticky. Logo left (white sapling), link cluster centre, orange
"Let's talk" CTA right. Mobile: burger toggle with nested menu.
**The prototype's nav structure is outdated** — it shows Services▾ /
Industries▾ / Our work / Insights▾ / About / Contact with dropdowns that don't
match the locked IA (see Discrepancies D1). Build the locked nav (AGENTS.md)
in the pill visual style.

### M2 — Footer (full)
Deep Blue, 4-col grid (1.3fr 1fr 1fr 1fr): logo + tagline + newsletter signup
(email input, orange "Sign up", "No spam, ever") / Services links / Company
links / Resources links. Bottom bar: © line + LinkedIn & YouTube icons.
Mobile: 2-col link grid.
**Variant M2b — slim footer:** © line + Privacy/Terms only (Landing page,
Resources placeholder).

### M3 — CTA banner
Deep Blue, centred, H2 40px + 56×2px Sky Blue divider rule + paragraph +
outline-orange button that fills orange on hover. One per page maximum
(bottom). On Home the banner instead contains a live HubSpot meetings iframe
(`meetings-ap1.hubspot.com/stowson?embed=true`) inside a white card.

### M4 — Marker annotation (hand-drawn SVG)
One emphasised phrase per hero H1: irregular hand-drawn ellipse ("scribble
circle") or squiggle underline, inline SVG path, round caps,
`preserveAspectRatio="none"`. Colour by context: orange on Deep Blue, Sky Blue
or Deep Blue on light backgrounds. Service hero supports circle vs
double-underline via a prop. Never a solid highlight fill (brand rule).

### M5 — Badge / pill system
One component, five styles, used across the whole site:
- **Filled Deep Blue** — topic/category tags, confirmed price badges
- **Filled Sky Blue** — industry tags, secondary emphasis
- **Translucent Sky Blue** (`rgba(131,181,209,0.25)`) — Hub tags, hero
  industry badges on dark
- **Outline navy** — tertiary tags, "Contact for pricing" price badges
- **Dashed border** — internal "placeholder / verify before publish" notes
  (never ships to production; a Studio-preview affordance at most)

---

## 3. Hero modules

| Module | Layout | Used by |
|--------|--------|---------|
| H1a — Dark centred hero | Deep Blue, eyebrow + H1 (52px w/ marker) + sub, max-w 880–900 | Services landing, Solutions, Industries hub |
| H1b — Dark split hero | Deep Blue, 2-col text + image slot (420–480px), badge row, 2 CTAs | Home, About Us |
| H1c — Dark breadcrumb hero | Deep Blue, breadcrumb + (badge) + H1 + sub + CTA(s) + meta line | Service detail, Industry detail |
| H1d — Light split hero | Off-White Tan, 2-col text + image (4:5 or 420px), eyebrow + H1 + CTA | Our Work, Insight Hub, Contact |
| H1e — Landing hero | Tan, 2-col copy + white lead-form card, social-proof star row | Conversion landing |
| H1f — Article header | Tan, narrow measure: breadcrumb, pill row, H1, dek, byline + share icons | Blog post |

Hero extras seen: social-proof avatar row (4 overlapping circle slots + stars
+ "34+ five-star reviews"), HubSpot Gold Partner badge pill, in-page anchor
CTAs (About's two promise buttons; Solutions' anchor link to §optimise).

---

## 4. Content modules

### Cards
- **M6 — Icon value card**: white card on tan, circular Deep Blue icon chip,
  H3 + paragraph. Hover variant flips card to navy and reveals collapsed copy
  (Home "Why Zippily"). Static variant on Services landing. 4-up grid.
- **M7 — Service card** (Services landing grid): icon, price badge (filled =
  price, outline = "contact"), H3, description, hover-reveal "Who it's for"
  drawer, hover lift. Carries a `cat-*` category (discover/build/scale) for
  the filter pills. 11 cards, 2-col grid (prototype hints 3-col as a future
  try).
- **M8 — Service teaser card** (Home): fixed 340px cards in a drag-to-scroll
  row; hover flips navy, swaps description for an aspirational tag line,
  arrow slides in.
- **M9 — Industry card** (hub): white bordered card, tan icon tile, H3, body,
  "Explore →" with orange arrow, hover lift. Distinct 8th cell: navy "Not on
  the list?" CTA tile. Home uses an image-topped variant (M9b) with
  hover-reveal copy. Mobile collapses to icon-left rows.
- **M10 — Case study card**: image slot with corner category pill, H3, body,
  "Read the story →". States: live (link) and **"story coming soon"**
  (muted pill, grey clock placeholder, non-link). 3-up grids on Our Work,
  Services landing, Industries hub.
- **M11 — Blog post card** (`.post-card`): image slot, pill row (Topic +
  optional Hub pills), H3, date · read-time footer, hover lift. Used by
  Insight Hub grid and Blog "Keep reading".
- **M12 — Hub carousel card**: 340px white card — icon tile, eyebrow, H3, blurb,
  linked-service label + arrow. **Claude variant**: Deep Blue card, orange
  icon tile, orange "Connected AI partner" eyebrow, radial orange glow.
- **M13 — Team card** (About): circular 132px photo, name, role, short bio,
  hover-reveal panel with Skills / Favourite HubSpot feature / Why they love
  HubSpot / LinkedIn. Dashed-placeholder full-card state for missing members.
- **M14 — Review card** (Google reviews): star row, quote, initial-letter
  avatar circle + name + descriptor. Section header carries Google logo +
  aggregate "5.0 ★★★★★ · 23 reviews".
- **M15 — Video testimonial card**: video-still image slot + orange circular
  play button, quote, name + org. 3-up on Our Work.
- **M16 — Resource link card**: translucent card on dark, orange icon tile +
  title. 3-up teaser on Insight Hub.
- **M17 — Related service card**: icon, H3, blurb, "Learn more →", hover
  lift. "Often paired with" 3-up on Service detail.

### Bands & blocks
- **M18 — Pricing tiers**: 3-col stretch grid. Tier fields: name, descriptor,
  40px price + "fixed, ex GST", divider, checkmark feature list, full-width
  CTA. Middle tier featured: Deep Blue fill, elevated, orange "Most teams
  pick this" ribbon. **Alternate state** (pricing not confirmed): single
  dashed card "This one's scoped individually" + "Get a fixed quote" CTA.
  Mobile: stacked, never horizontal swipe (locked rule).
- **M19 — Process steps**: 4-col (or 3-col) columns with 3px orange top
  border, large numeral, H3, body. Mobile: numbered stacked list. Landing
  page variant: numbered circles on translucent dark cards.
- **M20 — Pain points ("Is this you / Sound familiar")**: 3-up cards — icon-chip
  variant (Service detail) or orange-top-border variant (Industry detail).
  Landing page variant: 5 cards + navy summary tile with "WE'LL FIND IT" tags.
- **M21 — Stat trio**: 3-col centred stats with hairline dividers. Big
  numerals (orange on Deep Blue sections; white/Sky Blue on Our Work) +
  caption. Appears on Services landing, Our Work, About (with "TBC+"
  placeholder state).
- **M22 — Numbered value props**: 3-col, oversized numerals 01/02/03 + H3 +
  body (Industries hub "Why it matters").
- **M23 — Checklist grid**: 3-col orange-checkmark + label rows (Industry
  detail "How we fix it"); prose block above with inline service cross-link.
- **M24 — Quote / testimonial block**: large orange quote mark, 26–28px
  pull-quote, avatar + name + role/company attribution. Centred single
  (Service + Industry detail); carousel of 5 × 520px cards with prev/next
  arrows + scroll-snap (About); 3-up static quote cards (Home, dark).
- **M25 — Trust bar**: variants — (a) logo strip: Gold Partner badge cluster +
  divider + horizontally scrolling client-logo slots (Industries hub);
  (b) inline stats: Gold Partner + "23 Google / 11 HubSpot reviews" + 3 logo
  slots (Contact); (c) credentials strip on pale blue `#DCE7EE` (Our Work);
  (d) Home trust bar: badge + 6 text wordmark logos on Deep Blue;
  (e) single Gold Partner credential card (About).
- **M26 — FAQ accordion**: native `<details name="…">` items (mutually
  exclusive, first open, rotating chevron). 3–5 items per page. Contact page
  prototype uses a JS-state accordion — standardise on the `<details>`
  pattern.
- **M27 — Newsletter band**: Deep Blue centred band — H2 "One good email a
  month.", email input + orange Submit + consent checkbox (Insight Hub, Blog).
  Distinct from the footer signup (M2).
- **M28 — Alternating image/text rows**: 2-col rows swapping image side
  (About "Why you'll trust us"); full-width proof card variant with big stat +
  image (Service/Industry detail case-study proof; Solutions related case
  study with 3 badge pills).
- **M29 — Before/After comparison**: two cards (grey ✕-list vs blue ✓-list)
  with circular arrow node between (Landing page).
- **M30 — Good fit / Not a fit**: 2-col ✓-card vs ✕-card (Landing page).
- **M31 — Editorial article blocks** (Blog body): "The short version"
  callout (white card, 4px Sky Blue left border, bullet list), 18px/1.75
  prose, H2 section headings, bold-lead bullet lists, figure + caption,
  pull-quote with Sky Blue left border, author bio card.
- **M32 — Culture photo strip**: horizontal scroll-snap row of 280×320 image
  slots (About).
- **M33 — Founding story**: 2-col image + multi-paragraph narrative (About).

### Forms
- **F1 — Contact form**: First name*, Last name*, Email*, Company*, Phone,
  "How can we help?" select* (10 options incl. first-time implementation,
  portal improvement, marketing automation, sales hub, service hub,
  integrations & RevOps, training, ongoing support, something else), free-text
  challenge textarea. 2×2 name/email/company grid on desktop. Success state
  with "Send another message" reset.
- **F2 — Lead capture form** (Landing hero): First name*, Email*, Company*,
  optional "biggest HubSpot headache" + submit → success card state.
- **F3 — Newsletter signup**: email + button (footer); band variant adds
  consent checkbox. Integration: HubSpot form (decision 24 Jul 2026 —
  all forms are HubSpot; no Klaviyo).
- **F4 — Meetings embed**: HubSpot meetings iframe (Home CTA). The Landing
  page's hand-built calendar mock should be replaced with this live embed
  (the prototype's own "try next" note says so).

### Floating
- **M34 — Chat bubble** (Landing page): fixed bottom-right orange bubble.
  Needs a decision — live chat integration (HubSpot chat?) or cut.

---

## 5. Design tokens — prototype vs production

The `_ds` design system confirms the production token set already in
`web/app/globals.css`: Archivo only, brand hexes identical (#0E2F4A,
#F1F1E4, #F77B23, #83B5D1), heading tracking -0.06em, body -0.03em.

Useful extras the prototype uses consistently (worth adding as derived tokens
in Phase 2/3 rather than hard-coding):
- Orange hover `#E06910`
- Deep Blue tints: 80% `#3A5870` (slate body text on light), 20% `#CDD8E0`
  (card borders), 10% `#E6ECF0`
- Shadows tinted with `rgba(14,47,74,…)`
- Icons: Lucide-style 2px line icons throughout

Divergences (production/locked spec wins):
- Prototype hero H1s run 50–52px at line-height ~1.1; locked scale is H1
  48/56. The DS README's "90% heading line-height" token is overridden
  everywhere in the prototype itself — ignore it.
- Prototype labels/nav sometimes use -0.02em tracking; locked spec has only
  -0.06em (headings) and -0.03em (body).

---

## 6. Discrepancies & decisions

D1–D5 ruled by Sean, 24 Jul 2026. D6–D11 still open.

- **D1 — Nav IA — RESOLVED: locked IA, pill visual style.** Build the
  AGENTS.md structure (Home, Services flat, Solutions, About Us▾
  About/Careers/Events, Industries, Our Work, Insight Hub + persistent
  "Let's talk") rendered in the prototype's floating translucent pill style.
  The prototype's own nav (Services▾/Industries▾/Insights▾/About/Contact,
  with non-tracker industries like Healthcare and Construction in the
  dropdown) is outdated — ignore its structure. Home's industries teaser
  (6 tiles) must also be re-pointed at the real 7 tracker industries.
- **D2 — Published prices on service cards — RESOLVED: no prices on the
  Services landing cards.** Matches the tracker/brief decision and the
  never-publish-blocked-pricing rule. The prototype's badges (e.g. CRM
  implementation "From $4,500" vs confirmed $7,500 tiers; badges on
  pricing-blocked audit/landing-page-package) do not ship. Pricing appears
  only on individual service pages, and only where confirmed (M18's
  `pricingConfirmed` toggle).
- **D3 — "Ten services" copy — RESOLVED: fix the copy.** 11 cards is correct
  per tracker v3 (Marketing Automation split into two cards); the H2 is
  stale.
- **D4 — Orange on light backgrounds — RESOLVED: strict rule stands.** Deep
  Orange only ever on Deep Blue. Prototype accents that use orange on
  white/tan (pain-point top borders and eyebrow, process-step borders,
  numbered value props 01/02/03, checkmarks, quote marks, stat numerals on
  tan) are recoloured to Deep Blue or Sky Blue in the build. AGENTS.md rule
  unchanged.
- **D5 — Missing templates — RESOLVED for T9: derive the case study detail
  template from the existing module library** (breadcrumb hero, stat trio,
  editorial prose blocks, pull-quote, video card, related work, CTA banner)
  and review it in the browser like any other page — no prototype round-trip.
  Still undesigned and deferred: Aircall/partner-integration (T5), Careers,
  Events, Downloadable Resources (all Priority 3–4 or card-sort-blocked).
- **D6 — About brand video**: tracker/brief expects a brand video on About;
  prototype has an image-slot hero and no video module anywhere on the page.
- **D7 — Blog TOC**: brief mentioned a table of contents; prototype uses a
  "short version" callout instead (arguably better) — confirm.
- **D8 — Homepage FAQ copy** says projects are "individually scoped — no
  off-the-shelf packages", which contradicts the fixed pricing tiers on
  service pages. Copy-level reconciliation.
- **D9 — Insight Hub route**: tracker uses `/insights`; nav label "Insight
  Hub". Fine — just fix the Phase 0 header placeholder link (`/insight-hub` →
  `/insights`).
- **D10 — Contact details**: prototype uses `hello@zippily.co.nz` and a
  placeholder phone `+64 21 000 000` — confirm real details before Contact
  ships.
- **D11 — Case study taxonomy**: case cards are tagged by *service* on Our
  Work/Services landing but by *industry* on Industries pages — schema needs
  both references on `caseStudy` (matches tracker's schema hints).

### Careers (Templates M and R) — added by the Careers brief

- **M35 — Vacancy card** (Careers hub, Related roles): role title, a wrapping
  metadata row of icon+label items (work arrangement / employment type /
  location), truncated summary, right-aligned filled "View role". The metadata
  row wraps rather than truncating — losing "Remote" off the end of a line is
  what makes a qualified person skip a role.
- **M36 — Video embed** (`vimeoEmbed`): facade-rendered Vimeo player — poster
  plus play button, iframe injected on click, fixed aspect ratio from the
  start. Landscape / portrait / square. Shared by careersPage.lifeVideo,
  aboutPage.brandVideo, caseStudy.videoTestimonial and blog post bodies, so it
  is one module, not four.
- **M37 — File upload field** (Application form): PDF/DOC/DOCX, 10MB cap,
  uploaded ahead of submission with only the key passed to HubSpot. Degrades
  to an inline "email it to us" message when storage is unavailable rather
  than blocking the application.

