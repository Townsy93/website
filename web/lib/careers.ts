/** Display labels. The stored values are camelCase; these are what a human reads. */
export const WORK_ARRANGEMENT_LABEL: Record<string, string> = {
  onSite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  fullTime: "Full time",
  partTime: "Part time",
  contract: "Contract",
  internship: "Internship",
};

/** schema.org employmentType values. */
const SCHEMA_EMPLOYMENT_TYPE: Record<string, string> = {
  fullTime: "FULL_TIME",
  partTime: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export type VacancyLike = {
  title?: string | null;
  slug?: { current?: string | null } | null;
  summary?: string | null;
  status?: string | null;
  workArrangement?: string | null;
  employmentType?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  publishedAt?: string | null;
  validThrough?: string | null;
};

/**
 * A salary range, or null.
 *
 * Both bounds are required. A half-range ("from $90,000") reads as a floor
 * the employer has no intention of honouring, and Google rejects an
 * incomplete baseSalary anyway.
 */
export function salaryRange(vacancy: VacancyLike): string | null {
  const { salaryMin: min, salaryMax: max } = vacancy;
  if (typeof min !== "number" || typeof max !== "number") return null;
  const currency = vacancy.salaryCurrency ?? "NZD";
  const format = (value: number) =>
    new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  const period =
    vacancy.salaryPeriod === "HOUR"
      ? " an hour"
      : vacancy.salaryPeriod === "MONTH"
        ? " a month"
        : "";
  return `${format(min)} – ${format(max)}${period}`;
}

/** The metadata chips shown on cards and in the vacancy hero. */
export function vacancyMeta(vacancy: VacancyLike): string[] {
  return [
    WORK_ARRANGEMENT_LABEL[vacancy.workArrangement ?? ""],
    EMPLOYMENT_TYPE_LABEL[vacancy.employmentType ?? ""],
    vacancy.location ?? undefined,
  ].filter((value): value is string => Boolean(value));
}

/**
 * JobPosting JSON-LD — the highest-value thing on a vacancy page, because
 * it is what puts the role into Google Jobs.
 *
 * A closed role is emitted with validThrough in the past rather than
 * dropped, so Google is told the listing expired instead of finding the
 * markup vanish.
 */
export function jobPostingJsonLd(
  vacancy: VacancyLike,
  descriptionHtml: string,
  organisation: { name: string; url: string; logo?: string },
): Record<string, unknown> {
  const slug = vacancy.slug?.current ?? "";
  const closed = vacancy.status === "closed";
  const validThrough =
    vacancy.validThrough ??
    (closed ? (vacancy.publishedAt ?? new Date(0).toISOString()) : undefined);

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title ?? "",
    description: descriptionHtml,
    datePosted: vacancy.publishedAt ?? undefined,
    ...(validThrough ? { validThrough } : {}),
    employmentType: SCHEMA_EMPLOYMENT_TYPE[vacancy.employmentType ?? ""],
    hiringOrganization: {
      "@type": "Organization",
      name: organisation.name,
      sameAs: organisation.url,
      ...(organisation.logo ? { logo: organisation.logo } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Auckland",
        addressCountry: "NZ",
      },
    },
    url: `${organisation.url.replace(/\/$/, "")}/careers/${slug}`,
    directApply: true,
  };

  if (vacancy.workArrangement === "remote") {
    json.jobLocationType = "TELECOMMUTE";
    json.applicantLocationRequirements = {
      "@type": "Country",
      name: "New Zealand",
    };
  }

  // Only when both bounds exist — Google drops an incomplete baseSalary and
  // can flag the whole listing.
  if (typeof vacancy.salaryMin === "number" && typeof vacancy.salaryMax === "number") {
    json.baseSalary = {
      "@type": "MonetaryAmount",
      currency: vacancy.salaryCurrency ?? "NZD",
      value: {
        "@type": "QuantitativeValue",
        minValue: vacancy.salaryMin,
        maxValue: vacancy.salaryMax,
        unitText: vacancy.salaryPeriod ?? "YEAR",
      },
    };
  }

  return json;
}
