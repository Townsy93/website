/**
 * Migrates the Squarespace blog into Sanity.
 *
 *   node --env-file=.env.local scripts/migrate-blog.mjs [--commit] [--limit N]
 *
 * Dry run by default. Nothing is written and no image is uploaded without
 * --commit.
 *
 * Source is the Squarespace RSS feed, which carries the full post HTML in
 * <description> rather than a truncated summary. Documents get a deterministic
 * _id derived from the slug, so re-running updates the same post instead of
 * creating a second copy.
 *
 * Two fields cannot be derived honestly and are flagged rather than guessed:
 * topic (a five-way editorial choice) and author for posts written by someone
 * without a teamMember record. Both are set to a safe default and printed at
 * the end so they can be corrected in Studio.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "phzyp5b1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const COMMIT = process.argv.includes("--commit");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : Infinity;
})();
const FEED = "https://www.zippily.co.nz/blog?format=rss";
const CACHE = "blog-feed.xml";

const DEFAULT_AUTHOR = "team-sean-towson";
const KNOWN_AUTHORS = { "Sean Towson": "team-sean-towson" };

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

// ---------- feed ----------------------------------------------------------

async function loadFeed() {
  if (existsSync(CACHE)) return readFileSync(CACHE, "utf8");
  const res = await fetch(FEED, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Feed ${res.status}`);
  const xml = await res.text();
  writeFileSync(CACHE, xml);
  return xml;
}

const un = (s) =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const tag = (item, name) => {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? un(m[1]).trim() : "";
};

function parseFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const link = tag(item, "link");
    const media = item.match(/<media:content[^>]*url="([^"]+)"/);
    return {
      title: tag(item, "title"),
      slug: link.split("/").filter(Boolean).pop() ?? "",
      publishedAt: new Date(tag(item, "pubDate")).toISOString(),
      creator: tag(item, "dc:creator"),
      html: tag(item, "description"),
      coverUrl: media ? media[1] : null,
      sourceUrl: link,
    };
  });
}

// ---------- html -> portable text ----------------------------------------

/** Inline runs, carrying bold/italic and links out as markDefs. */
function inlineSpans(html) {
  const markDefs = [];
  const spans = [];
  let marks = [];

  const push = (text) => {
    const clean = un(text).replace(/\s+/g, " ");
    if (!clean) return;
    const last = spans[spans.length - 1];
    if (last && JSON.stringify(last.marks) === JSON.stringify(marks)) {
      last.text += clean;
    } else {
      spans.push({ _type: "span", _key: key(), text: clean, marks: [...marks] });
    }
  };

  const re = /<(\/?)(strong|b|em|i|a)(\s[^>]*)?>|<[^>]+>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const [full, closing, name, attrs, text] = m;
    if (text) {
      push(text);
    } else if (name) {
      const lower = name.toLowerCase();
      const mark =
        lower === "strong" || lower === "b"
          ? "strong"
          : lower === "em" || lower === "i"
            ? "em"
            : null;
      if (closing) {
        marks = marks.slice(0, -1);
      } else if (mark) {
        marks.push(mark);
      } else if (lower === "a") {
        const href = (attrs ?? "").match(/href="([^"]+)"/);
        if (href) {
          const id = key();
          markDefs.push({ _type: "link", _key: id, href: href[1] });
          marks.push(id);
        } else {
          marks.push("noop");
        }
      }
    }
    // Any other tag is dropped; its text still arrives on the next pass.
    if (full === "") break;
  }
  return { spans, markDefs };
}

const block = (style, html, listItem) => {
  const { spans, markDefs } = inlineSpans(html);
  if (spans.length === 0) return null;
  return {
    _type: "block",
    _key: key(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs,
    children: spans,
  };
};

/**
 * Walks the post HTML block by block. Squarespace nests heavily, so this
 * matches the block-level elements it actually emits and ignores the wrappers
 * rather than trying to model the whole tree.
 */
function htmlToBlocks(html, images) {
  const blocks = [];
  const re =
    /<(h[1-6]|p|blockquote|li|img)([^>]*)>([\s\S]*?)<\/\1>|<img([^>]*)\/?>/gi;
  let m;
  while ((m = re.exec(html))) {
    const name = (m[1] ?? "img").toLowerCase();
    const attrs = m[2] ?? m[4] ?? "";
    const inner = m[3] ?? "";

    if (name === "img") {
      const src = attrs.match(/(?:data-src|src)="([^"]+)"/);
      const alt = attrs.match(/alt="([^"]*)"/);
      if (src && !src[1].startsWith("data:")) {
        images.push({ url: src[1], alt: alt ? un(alt[1]) : "" });
        blocks.push({ __image: src[1], alt: alt ? un(alt[1]) : "" });
      }
      continue;
    }

    // Squarespace uses h1 inside posts; the page already renders the title as
    // h1, so demote to keep one h1 per page.
    const style =
      name === "p"
        ? "normal"
        : name === "blockquote"
          ? "blockquote"
          : name === "li"
            ? "normal"
            : name === "h1" || name === "h2"
              ? "h2"
              : "h3";

    const listItem = name === "li" ? "bullet" : undefined;
    const b = block(style, inner, listItem);
    if (b) blocks.push(b);
  }
  return blocks;
}

const plainText = (html) =>
  un(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const readTime = (text) =>
  Math.max(1, Math.min(60, Math.round(text.split(/\s+/).length / 200)));

/** Best-effort topic. Printed for review — it is an editorial call. */
function guessTopic(title, text) {
  const s = `${title} ${text}`.toLowerCase();
  if (/\bai\b|breeze|chatgpt|claude/.test(s)) return "ai-developments";
  if (/inbound|what's new|update|release|event/.test(s)) return "news-and-events";
  if (/feature|spotlight|lead scoring|data hub/.test(s)) return "feature-spotlights";
  if (/why we|our approach|how we work/.test(s)) return "our-approach";
  return "best-practices";
}

// ---------- sanity --------------------------------------------------------

const uploaded = new Map();

async function uploadImage(url) {
  if (uploaded.has(url)) return uploaded.get(url);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`image ${res.status} ${url}`);
  const body = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") ?? "image/jpeg";
  const up = await fetch(
    `https://${PROJECT}.api.sanity.io/v2026-07-01/assets/images/${DATASET}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": type },
      body,
    },
  );
  if (!up.ok) throw new Error(`upload ${up.status}: ${await up.text()}`);
  const id = (await up.json()).document._id;
  uploaded.set(url, id);
  return id;
}

// ---------- run -----------------------------------------------------------

const posts = parseFeed(await loadFeed()).slice(0, LIMIT);
console.log(`\n${posts.length} post(s) in the feed\n`);

const existing = await (
  await fetch(
    `https://${PROJECT}.api.sanity.io/v2026-07-01/data/query/${DATASET}?query=${encodeURIComponent(
      '*[_type=="blogPost"]{"slug":slug.current}',
    )}`,
  )
).json();
const have = new Set((existing.result ?? []).map((d) => d.slug));

const review = { topic: [], author: [] };
const mutations = [];

for (const post of posts) {
  if (!post.slug || !post.title) continue;
  const text = plainText(post.html);
  const images = [];
  const raw = htmlToBlocks(post.html, images);

  const authorId = KNOWN_AUTHORS[post.creator] ?? DEFAULT_AUTHOR;
  if (!KNOWN_AUTHORS[post.creator]) review.author.push(`${post.slug} (${post.creator})`);
  const topic = guessTopic(post.title, text);
  review.topic.push(`${post.slug} -> ${topic}`);

  let body = raw;
  let coverRef = null;
  if (COMMIT) {
    if (post.coverUrl) coverRef = await uploadImage(post.coverUrl).catch(() => null);
    body = [];
    for (const b of raw) {
      if (!b.__image) { body.push(b); continue; }
      const ref = await uploadImage(b.__image).catch(() => null);
      if (ref) {
        body.push({
          _type: "image",
          _key: key(),
          asset: { _type: "reference", _ref: ref },
          ...(b.alt ? { alt: b.alt } : {}),
        });
      }
    }
  } else {
    body = raw.filter((b) => !b.__image);
  }

  mutations.push({
    createOrReplace: {
      _id: `blogPost-${post.slug}`,
      _type: "blogPost",
      title: post.title.slice(0, 120),
      slug: { _type: "slug", current: post.slug },
      topic,
      author: { _type: "reference", _ref: authorId },
      publishedAt: post.publishedAt,
      readTime: readTime(text),
      excerpt: text.slice(0, 280),
      ...(coverRef
        ? { coverImage: { _type: "image", asset: { _type: "reference", _ref: coverRef } } }
        : {}),
      body,
    },
  });

  console.log(
    `  ${have.has(post.slug) ? "update" : "create"}  ${post.slug.slice(0, 44).padEnd(46)} ` +
      `${raw.filter((b) => !b.__image).length} blocks, ${images.length} image(s), ${readTime(text)} min`,
  );
}

console.log(`\n${mutations.length} post(s) ready.`);
if (!COMMIT) {
  console.log("\nDry run — no documents written, no images uploaded.");
  console.log("Re-run with --commit.\n");
  process.exit(0);
}
if (!TOKEN) {
  console.error("\nNo SANITY_API_WRITE_TOKEN.\n");
  process.exit(1);
}

// Batched: one transaction of 20 posts plus their images is large enough to
// be refused outright.
for (let i = 0; i < mutations.length; i += 5) {
  const batch = mutations.slice(i, i + 5);
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/v2026-07-01/data/mutate/${DATASET}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ mutations: batch }),
    },
  );
  if (!res.ok) {
    console.error(`batch ${i / 5 + 1} failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log(`  wrote ${Math.min(i + 5, mutations.length)}/${mutations.length}`);
}

console.log(`\nDone. ${uploaded.size} image(s) uploaded.`);
console.log(`\nNeeds a human eye in Studio:`);
console.log(`  Topic was guessed for all ${review.topic.length} — it is an editorial call:`);
review.topic.forEach((r) => console.log(`    ${r}`));
if (review.author.length) {
  console.log(`\n  Author defaulted to Sean (no teamMember record for the writer):`);
  review.author.forEach((r) => console.log(`    ${r}`));
}
console.log();
