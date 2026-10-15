/**
 * Width / height of a Sanity image, read from its asset reference.
 *
 * A reference looks like `image-<hash>-<width>x<height>-<ext>`, so the
 * aspect ratio is already in the reference. Reading it there means a page
 * can choose a layout by the shape of an image without widening a GROQ query
 * to dereference the asset's metadata.
 *
 * Returns null for anything that is not a well-formed image reference, so a
 * caller falls back to its default layout instead of guessing.
 */
export function aspectFromRef(ref: string | null | undefined): number | null {
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref ?? "");
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return width / height;
}

/** Whether a logo is square enough that a wide strip would crop or shrink it. */
export function isSquareish(ref: string | null | undefined): boolean {
  const ratio = aspectFromRef(ref);
  return ratio !== null && ratio < 1.3;
}
