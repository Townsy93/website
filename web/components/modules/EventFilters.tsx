"use client";

import { useEffect, useState, type ReactNode } from "react";

const DATE_FILTERS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "This month", value: "this-month" },
  { label: "Past", value: "past" },
] as const;

const TOPIC_FILTERS = [
  { label: "All", value: "All" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "AI", value: "AI" },
] as const;

// Date buckets are computed on the server so filtering stays a pure
// function of props — no clock reads during render.
export type FilterItem = {
  id: string;
  categories: string[];
  isPast: boolean;
  isThisMonth: boolean;
};

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-none whitespace-nowrap rounded-full border-[1.5px] px-5 py-2.5 text-[14.5px] font-semibold transition-colors ${
        active
          ? "border-deep-blue bg-deep-blue text-white"
          : "border-deep-blue/28 bg-white text-deep-blue hover:border-deep-blue"
      }`}
    >
      {label}
    </button>
  );
}

// Two independent single-select filters, AND logic, mirrored to the URL.
// Every card stays in the HTML — filtering only toggles display, so
// crawlers still see the full list (same approach as Services/Insights).
export function EventFilters({
  items,
  children,
}: {
  items: FilterItem[];
  children: ReactNode[];
}) {
  const [dateFilter, setDateFilter] = useState<string>("upcoming");
  const [topicFilter, setTopicFilter] = useState<string>("All");

  // Read filter state back from the URL on load. This deliberately syncs
  // state in an effect rather than using useSearchParams: that hook forces a
  // Suspense bailout on a statically rendered page, which would keep the
  // cards out of the prerendered HTML and break crawlability.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const date = params.get("date");
    const topic = params.get("topic");
    if (date && DATE_FILTERS.some((f) => f.value === date)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFilter(date);
    }
    const match = topic
      ? TOPIC_FILTERS.find(
          (f) => f.value.toLowerCase() === topic.toLowerCase(),
        )
      : undefined;
    if (match) setTopicFilter(match.value);
  }, []);

  // Mirror state to the URL without a navigation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (dateFilter === "upcoming") params.delete("date");
    else params.set("date", dateFilter);
    if (topicFilter === "All") params.delete("topic");
    else params.set("topic", topicFilter.toLowerCase());
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [dateFilter, topicFilter]);

  const matches = (item: FilterItem) => {
    if (topicFilter !== "All" && !item.categories.includes(topicFilter))
      return false;
    if (dateFilter === "past") return item.isPast;
    if (dateFilter === "this-month") return !item.isPast && item.isThisMonth;
    return !item.isPast;
  };

  const matchedIds = new Set(items.filter(matches).map((item) => item.id));
  const isEmptyResult = matchedIds.size === 0;

  return (
    <>
      <div className="mx-auto max-w-6xl pb-8 pt-16">
        {[
          {
            label: "Date",
            options: DATE_FILTERS,
            value: dateFilter,
            set: setDateFilter,
          },
          {
            label: "Topic",
            options: TOPIC_FILTERS,
            value: topicFilter,
            set: setTopicFilter,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
          >
            <p className="w-[58px] shrink-0 px-4 text-caption font-semibold uppercase tracking-[0.06em] text-[#767666] sm:px-6">
              {row.label}
            </p>
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
              {row.options.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  active={row.value === option.value}
                  onClick={() => row.set(option.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {isEmptyResult && (
          <p className="mb-6 rounded border-l-[3px] border-sky-blue bg-white px-5.5 py-4 text-body-lg text-deep-blue-80">
            No sessions match that — here&apos;s what&apos;s coming up
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {children.map((child, index) => {
            const item = items[index];
            // Empty result falls back to the full unfiltered grid.
            const visible = isEmptyResult || matchedIds.has(item?.id ?? "");
            return (
              <div key={item?.id ?? index} hidden={!visible}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
