// Canonical site origin. The live domain 301s apex → www, so www is canonical.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zippily.co.nz";

export const SITE_NAME = "zippily";
