# Content patch scripts

Small scripts so Claude Code can read and edit live Sanity content (`production` dataset)
directly, without a Studio login each time — set up 2026-09-11 after a request to fix hero copy
that lives in Sanity, not in the repo.

## Setup

`studio/.env` (gitignored, never commit) holds:

```
SANITY_API_WRITE_TOKEN=<Editor-role token from sanity.io/manage/project/phzyp5b1/api>
```

Create the token at **sanity.io/manage → project phzyp5b1 → API → Tokens → Add API token**,
permission **Editor** (read + write to documents; never Administrator — this token should not be
able to touch project settings, members, or billing). Sanity shows the value once; if it's lost,
revoke it there and make a new one.

## Usage

```bash
npm run content:get -- <documentId>              # read a document before touching it
npm run content:patch -- <documentId> '<json>'    # set fields on a published document
```

`<documentId>` for the pinned singletons is just the schema type name (`homePage`,
`siteSettings`, …) — see `studio/structure.ts`. Everything else is the document's real `_id`
(look it up with a GROQ query in Vision, or `content:get` the type via `*[_type=="..."]`).

`content:patch` takes a JSON object of field-path → new value, applied as a plain `.set()`. For a
nested field use dotted/bracketed path syntax (`"hero.heading"`, `"modules[_key==\"abc\"].text"`)
— always `content:get` first to see the exact shape (portable-text/array fields need the matching
`_key`, not a bare index).

## Rules for using this

- **Always `content:get` first** and show the before/after to Sean before patching — this writes
  straight to the live, published document (no draft step), and per this repo's safety rules,
  modifying public content needs his explicit go-ahead each time, even though the token itself is
  already set up.
- Same-second edits in Studio's editor can conflict with a script patch — check nobody's mid-edit
  on that document first for anything non-trivial.
- Publishing fans out via the tag-based revalidation in `web/app/api/revalidate/route.ts` the same
  as a normal Studio publish (~52s to go live) — no different handling needed for scripted patches.
- Pricing fields are governed by `PRICING-CHANGELOG.md` in the AI Brain repo regardless of how the
  edit is made — see the repo root `CLAUDE.md`.
