import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-07-01",
  // Pages are static/ISR — fetches happen at build/revalidate time, so read
  // uncached from the API to avoid stale CDN content baking into builds.
  useCdn: false,
  stega: { studioUrl: "https://zippily.sanity.studio" },
});
