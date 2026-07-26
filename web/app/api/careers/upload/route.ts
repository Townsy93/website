import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Receives a CV and returns a URL to hand to HubSpot.
 *
 * The R2 binding is not attached yet — the Cloudflare token in use has no R2
 * scope. Rather than fail with a stack trace, this reports the feature as
 * unavailable so the form can carry on and tell the applicant to email the
 * file. Losing someone's CV silently is the one outcome worth engineering
 * against here.
 */
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// The website worker has no generated Workers types, so the shape of the
// binding is declared here rather than pulling in the whole namespace.
type UploadBucket = {
  put: (
    key: string,
    value: ReadableStream,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ) => Promise<unknown>;
};
type MaybeR2 = { CAREERS_UPLOADS?: UploadBucket };

export async function POST(request: Request) {
  let bucket: UploadBucket | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    bucket = (env as unknown as MaybeR2).CAREERS_UPLOADS;
  } catch {
    // Not running on Workers (local dev without the binding).
  }

  if (!bucket) {
    return NextResponse.json(
      {
        ok: false,
        unavailable: true,
        message:
          "We can't attach files just yet — send your CV to hello@zippily.co.nz and we'll match it to your application.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That upload didn't arrive properly." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "No file was attached." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "That file is over 10MB." },
      { status: 413 },
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { ok: false, message: "CVs need to be a PDF or Word document." },
      { status: 415 },
    );
  }

  // Applicant-controlled names never reach the key.
  const extension = file.type === "application/pdf" ? "pdf" : "doc";
  const key = `applications/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

  try {
    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name.slice(0, 200) },
    });
  } catch (error) {
    console.error(`[careers] upload failed: ${String(error)}`);
    return NextResponse.json(
      { ok: false, message: "We couldn't store that file." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, key });
}
