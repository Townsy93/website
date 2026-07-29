// Generated from docs/launch-redirects.csv - the mapping Sean approved.
//
// Deliberately NOT imported from next.config.ts. The point of this check is to
// catch drift between what was agreed and what the site actually does; sharing
// one array would make the assertion tautological and it would pass forever.
// If a rule is edited in next.config without updating the CSV, this fails - which
// is the entire reason it exists.

export const EXPECTED_REDIRECTS: readonly (readonly [string, string])[] = [
  ["/home", "/"],
  ["/blog", "/insights"],
  ["/blog/best-crm-for-small-business-in-nz-2026", "/insights/best-crm-for-small-business-in-nz-2026"],
  ["/blog/best-crms-for-small-business-2026", "/insights/best-crms-for-small-business-2026"],
  ["/blog/designing-a-high-performing-email-automation-strategy-a-step-by-step-guide-for-growing-businesses", "/insights/designing-a-high-performing-email-automation-strategy-a-step-by-step-guide-for-growing-businesses"],
  ["/blog/do-i-need-a-crm-nz-checklist", "/insights/do-i-need-a-crm-nz-checklist"],
  ["/blog/how-much-does-hubspot-implementation-cost-in-nz", "/insights/how-much-does-hubspot-implementation-cost-in-nz"],
  ["/blog/how-to-choose-the-right-crm-for-your-business", "/insights/how-to-choose-the-right-crm-for-your-business"],
  ["/blog/hubspot-updates-whats-new", "/insights"],
  ["/blog/hubspot-xero-integration", "/insights/hubspot-xero-integration"],
  ["/blog/lead-quality-starts-with-process", "/insights/lead-quality-starts-with-process"],
  ["/blog/lead-scoring-with-hubspot", "/insights/lead-scoring-with-hubspot"],
  ["/blog/ownership-gaps-create-operational-chaos", "/insights/ownership-gaps-create-operational-chaos"],
  ["/blog/purpose-vs-proof-proving-not-for-profits-impact", "/insights/purpose-vs-proof-proving-not-for-profits-impact"],
  ["/blog/the-simple-crm-myth", "/insights/the-simple-crm-myth"],
  ["/blog/the-system-you-never-had-time-to-build", "/insights/the-system-you-never-had-time-to-build"],
  ["/blog/top-hubspot-features-from-inbound-2025", "/insights"],
  ["/blog/visibility-over-oversight-scaling-without-the-bottleneck", "/insights/visibility-over-oversight-scaling-without-the-bottleneck"],
  ["/blog/when-sales-and-marketing-align", "/insights/when-sales-and-marketing-align"],
  ["/blog/why-performance-agency-owners-should-be-encouraging-their-clients-to-get-a-crm", "/insights/why-performance-agency-owners-should-be-encouraging-their-clients-to-get-a-crm"],
  ["/blog/why-spreadsheets-dont-work-for-complex-financial-advice", "/insights/why-spreadsheets-dont-work-for-complex-financial-advice"],
  ["/blog/common-mistakes-when-onboarding-hubspot-and-how-to-prevent-them", "/insights"],
  ["/blog/top-hubspot-ai-features-to-accelerate-your-business-in-2025", "/insights"],
  ["/blog/why-your-business-needs-marketing-automation-in-2025-before-you-fall-behind", "/insights"],
  ["/blog/5yh0a2hi82nkj6y0w8sonvdqgqtl0e", "/insights/mapping-your-tech-ecosystem"],
  ["/blog/tag/Last+updated+April+2026", "/insights"],
  ["/case-studies", "/our-work"],
  ["/case-studies/accounting-for-nature", "/our-work/accounting-for-nature"],
  ["/case-studies/house-surveys", "/our-work/house-surveys"],
  ["/crm-for-finance", "/industries/financial-services"],
  ["/crm-for-non-profits", "/industries/non-profits"],
  ["/crm-for-property", "/industries/property-development"],
  ["/crm-for-startups-and-saas", "/industries/saas"],
  ["/hubspot-crm-implementation", "/services/crm-implementation"],
  ["/hubspot-ai-automation-advisory", "/services/ai-solutions"],
  ["/hubspot-training", "/services/hubspot-training"],
  ["/marketing-automation", "/services/marketing-automation"],
  ["/revops-retainer", "/services/revops-retainers"],
  ["/crm-audit", "/services/hubspot-audit"],
  ["/customer-journey-workshop", "/services/customer-journey-mapping"],
  ["/hubspot-integrations", "/services/websites-and-integrations"],
  ["/our-solutions", "/services"],
  ["/hubspot-integrations/xero", "/insights/hubspot-xero-integration"],
  ["/platforms", "/solutions"],
  ["/platforms/aircall", "/solutions/aircall"],
  ["/platforms/attio", "/insights/attio-vs-hubspot"],
  ["/platforms/folk", "/insights/folk-vs-hubspot"],
  ["/platforms/pandadoc", "/insights/pandadoc-hubspot-integration"],
  ["/faqs", "/contact"],
  ["/testimonials", "/our-work"],
  ["/buyer-journey-workshop", "/services/customer-journey-mapping"],
  ["/hubspot-health-check", "/services/hubspot-audit"],
  ["/blog/best-crms-for-small-business-2025", "/insights/best-crms-for-small-business-2026"],
];

/** Old URLs that keep their path. They must serve 200, not redirect. */
export const EXPECTED_UNCHANGED: readonly string[] = [
  "/about-us",
  "/contact",
  "/industries",
  "/privacy-policy",
  "/solutions",
];
