import { draftMode } from "next/headers";
import { client } from "@/sanity/client";

const token = process.env.SANITY_API_READ_TOKEN;

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
  return client.fetch(query, params);
}
