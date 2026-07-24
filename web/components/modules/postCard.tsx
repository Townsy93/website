export type PostCardData = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  topic?: string | null;
  excerpt?: string | null;
  coverImage?: { asset?: { _ref?: string } | null; alt?: string | null } | null;
  publishedAt?: string | null;
  readTime?: number | null;
  hubs?: ({ name?: string | null } | null)[] | null;
};

export const TOPIC_LABELS: Record<string, string> = {
  "feature-spotlights": "Feature spotlights",
  "best-practices": "Best practices",
  "news-and-events": "News and events",
  "our-approach": "Our approach",
  "ai-developments": "AI developments",
};

export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Topic pill (solid Deep Blue) + Hub pills (translucent Sky Blue) — the
// shared pill vocabulary from the prototype (module M5).
export function PostPills({ post }: { post: PostCardData }) {
  return (
    <div className="flex flex-wrap gap-2">
      {post.topic && (
        <span className="rounded-full bg-deep-blue px-3 py-1 text-caption font-semibold text-white">
          {TOPIC_LABELS[post.topic] ?? post.topic}
        </span>
      )}
      {post.hubs?.map(
        (hub) =>
          hub?.name && (
            <span
              key={hub.name}
              className="rounded-full bg-sky-blue/25 px-3 py-1 text-caption font-semibold text-deep-blue"
            >
              {hub.name}
            </span>
          ),
      )}
    </div>
  );
}
