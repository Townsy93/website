"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SanityImage } from "@/components/ui/SanityImage";
import {
  PostPills,
  TOPIC_LABELS,
  formatDate,
  type PostCardData,
} from "@/components/modules/postCard";

const HUBS = [
  "Sales Hub",
  "Service Hub",
  "Marketing Hub",
  "Content Hub",
  "Revenue Hub",
  "Data Hub",
  "Breeze AI",
];

const PAGE_SIZE = 6;

// T10 filter system: Topic AND Hub AND title search, load-more paging.
export function InsightFilters({ posts }: { posts: PostCardData[] }) {
  const [topic, setTopic] = useState<string>("all");
  const [hub, setHub] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const matches = useMemo(
    () =>
      posts.filter((post) => {
        if (topic !== "all" && post.topic !== topic) return false;
        if (
          hub !== "all" &&
          !(post.hubs ?? []).some((h) => h?.name === hub)
        )
          return false;
        if (
          search &&
          !(post.title ?? "").toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [posts, topic, hub, search],
  );

  const filtersActive = topic !== "all" || hub !== "all" || search !== "";
  const selectClass =
    "rounded-full border border-deep-blue-20 bg-white px-4 py-2.5 text-body text-deep-blue focus:border-sky-blue focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="topic-filter">
          Topic
        </label>
        <select
          id="topic-filter"
          value={topic}
          onChange={(event) => {
            setTopic(event.target.value);
            setShown(PAGE_SIZE);
          }}
          className={selectClass}
        >
          <option value="all">All topics</option>
          {Object.entries(TOPIC_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="hub-filter">
          Hub
        </label>
        <select
          id="hub-filter"
          value={hub}
          onChange={(event) => {
            setHub(event.target.value);
            setShown(PAGE_SIZE);
          }}
          className={selectClass}
        >
          <option value="all">All hubs</option>
          {HUBS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setTopic("all");
              setHub("all");
              setSearch("");
              setShown(PAGE_SIZE);
            }}
            className="rounded-full border border-deep-blue-20 px-4 py-2.5 text-body text-deep-blue-80 hover:border-deep-blue"
          >
            Clear filters ✕
          </button>
        )}
        <div className="ms-auto">
          <label className="sr-only" htmlFor="post-search">
            Search the blog
          </label>
          <input
            id="post-search"
            type="search"
            value={search}
            placeholder="Search the blog"
            onChange={(event) => {
              setSearch(event.target.value);
              setShown(PAGE_SIZE);
            }}
            className="w-64 max-w-full rounded-full border border-deep-blue-20 bg-white px-5 py-2.5 text-body text-deep-blue placeholder:text-deep-blue-80/50 focus:border-sky-blue focus:outline-none"
          />
        </div>
      </div>

      <p className="mt-6 text-caption text-deep-blue-80">
        {matches.length} article{matches.length === 1 ? "" : "s"}
      </p>

      {matches.length === 0 ? (
        <p className="mt-10 text-body-lg text-deep-blue-80">
          No posts match those filters yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {matches.slice(0, shown).map((post) => (
            <Link
              key={post._id}
              href={`/insights/${post.slug?.current}`}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <SanityImage
                image={post.coverImage}
                width={400}
                height={200}
                className="h-44 w-full object-cover"
                placeholderLabel="Post image"
              />
              <div className="p-6">
                <PostPills post={post} />
                <h3 className="mt-3 text-h4">{post.title}</h3>
                <p className="mt-4 border-t border-deep-blue-10 pt-3 text-caption text-deep-blue-80">
                  {formatDate(post.publishedAt)} · {post.readTime} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {matches.length > shown && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown((count) => count + PAGE_SIZE)}
            className="rounded-full border-2 border-deep-blue px-6 py-3 text-body font-semibold text-deep-blue transition hover:bg-deep-blue hover:text-white"
          >
            Load more articles
          </button>
        </div>
      )}
    </div>
  );
}
