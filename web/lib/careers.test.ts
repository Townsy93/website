import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { jobPostingJsonLd, salaryRange, vacancyMeta } from "./careers.ts";

const ORG = { name: "Zippily", url: "https://www.zippily.co.nz" };
const base = {
  title: "Senior HubSpot Consultant",
  slug: { current: "senior-hubspot-consultant" },
  status: "open",
  workArrangement: "hybrid",
  employmentType: "fullTime",
  location: "Auckland, New Zealand",
  publishedAt: "2026-07-01T00:00:00Z",
};

describe("salary", () => {
  test("shows a range only when both bounds are set", () => {
    assert.equal(salaryRange({ ...base, salaryMin: 90000 }), null);
    assert.equal(salaryRange({ ...base, salaryMax: 120000 }), null);
    assert.equal(salaryRange(base), null);
  });

  test("formats a complete range in NZD", () => {
    const text = salaryRange({ ...base, salaryMin: 90000, salaryMax: 120000 });
    assert.match(text ?? "", /90,000/);
    assert.match(text ?? "", /120,000/);
  });

  test("hourly and monthly rates say so", () => {
    assert.match(
      salaryRange({ ...base, salaryMin: 60, salaryMax: 80, salaryPeriod: "HOUR" }) ?? "",
      /an hour$/,
    );
  });
});

describe("metadata chips", () => {
  test("reads as labels, not stored values", () => {
    assert.deepEqual(vacancyMeta(base), [
      "Hybrid",
      "Full time",
      "Auckland, New Zealand",
    ]);
  });

  test("an unknown value is dropped rather than shown raw", () => {
    assert.deepEqual(vacancyMeta({ ...base, workArrangement: "moon" }), [
      "Full time",
      "Auckland, New Zealand",
    ]);
  });
});

describe("JobPosting markup", () => {
  test("carries what Google Jobs requires", () => {
    const json = jobPostingJsonLd(base, "<p>Role</p>", ORG);
    assert.equal(json["@type"], "JobPosting");
    assert.equal(json.title, "Senior HubSpot Consultant");
    assert.equal(json.datePosted, "2026-07-01T00:00:00Z");
    assert.equal(json.employmentType, "FULL_TIME");
    assert.match(String(json.url), /\/careers\/senior-hubspot-consultant$/);
  });

  test("baseSalary appears only with both bounds", () => {
    assert.equal(jobPostingJsonLd(base, "x", ORG).baseSalary, undefined);
    assert.equal(
      jobPostingJsonLd({ ...base, salaryMin: 90000 }, "x", ORG).baseSalary,
      undefined,
    );
    const withSalary = jobPostingJsonLd(
      { ...base, salaryMin: 90000, salaryMax: 120000 },
      "x",
      ORG,
    );
    assert.ok(withSalary.baseSalary);
  });

  test("a remote role is marked as telecommute", () => {
    const json = jobPostingJsonLd({ ...base, workArrangement: "remote" }, "x", ORG);
    assert.equal(json.jobLocationType, "TELECOMMUTE");
  });

  test("an on-site role is not", () => {
    assert.equal(jobPostingJsonLd(base, "x", ORG).jobLocationType, undefined);
  });

  test("a closed role expires rather than losing its markup", () => {
    // Dropping the markup makes the listing vanish; an expiry date in the
    // past tells Google what actually happened.
    const json = jobPostingJsonLd({ ...base, status: "closed" }, "x", ORG);
    assert.ok(json.validThrough);
    assert.ok(new Date(String(json.validThrough)).getTime() <= Date.now());
  });

  test("an explicit closing date is respected", () => {
    const json = jobPostingJsonLd(
      { ...base, validThrough: "2026-12-01T00:00:00Z" },
      "x",
      ORG,
    );
    assert.equal(json.validThrough, "2026-12-01T00:00:00Z");
  });
});
