import { draftMode } from "next/headers";
import { client } from "@/sanity/client";

const token = process.env.SANITY_API_READ_TOKEN;

/**
 * The document types a GROQ query reads.
 *
 * Derived from the query text so every call site is tagged without anyone
 * having to remember to. Publishing a service then only invalidates pages
 * that actually query services, rather than the whole site.
 *
 * Known limit: a dereference (`author->`) is not tagged, because the type
 * only appears in the referring document's schema. The webhook compensates
 * by also revalidating the tag for the published document's own type, which
 * covers the common case of editing the referenced document directly.
 */
export function tagsForQuery(query: string): string[] {
  const found = new Set<string>();
  // _type == "service"
  for (const [, type] of query.matchAll(/_type\s*==\s*["']([a-zA-Z0-9_]+)["']/g)) {
    found.add(`type:${type}`);
  }
  // _type in ["service", "industry"] — used by the sitemap and any query
  // spanning types. Without this it would tag nothing and never invalidate.
  for (const [, list] of query.matchAll(/_type\s+in\s*\[([^\]]*)\]/g)) {
    for (const [, type] of list.matchAll(/["']([a-zA-Z0-9_]+)["']/g)) {
      found.add(`type:${type}`);
    }
  }
  return [...found];
}

// Draft-aware fetch: normal requests read published content; inside the
// Studio's Presentation tool (draft mode cookie set) it reads drafts live,
// with stega encoding for click-to-edit overlays.
export async function sanityFetch<const QueryString extends string>(
  query: QueryString,
  params: Record<string, unknown> = {},
) {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft && token) {
    return client.fetch(query, params, {
      token,
      perspective: "drafts",
      useCdn: false,
      stega: true,
    });
  }
  return client.fetch(query, params, {
    next: { tags: tagsForQuery(query) },
  });
}
