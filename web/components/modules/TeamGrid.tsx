"use client";

import { useEffect, useRef, useState } from "react";
import { SanityImage } from "@/components/ui/SanityImage";

export type TeamMember = {
  _id: string;
  name?: string | null;
  role?: string | null;
  pronouns?: string | null;
  photo?: Parameters<typeof SanityImage>[0]["image"];
  bio?: string | null;
  outsideWork?: string | null;
  skills?: string[] | null;
  favouriteHubSpotFeature?: string | null;
  whyTheyLoveHubSpot?: string | null;
  linkedIn?: string | null;
};

/**
 * Team cards that open a bio dialog — the About v2 designer request:
 * "a pop-up for the bios of each team member for those who WANT to read
 * them". The card face carries only photo, name and role; everything else
 * lives behind the click.
 *
 * This replaces the old hover-reveal, which was unreachable on touch
 * devices — a phone visitor could never see the bios at all.
 *
 * Built on the native <dialog>: showModal() gives focus containment, Esc to
 * close, and inert background for free, which is most of what makes a modal
 * accessible. Backdrop clicks close it via the click-outside-content check.
 *
 * Roles are Deep Blue at 80% rather than the design's orange italic: orange
 * text on the white card face is ~2.7:1, failing WCAG AA — the same ruling
 * Sean made for the section headings.
 */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  const [open, setOpen] = useState<TeamMember | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <button
            key={member._id}
            type="button"
            onClick={() => setOpen(member)}
            aria-haspopup="dialog"
            className="group overflow-hidden rounded-xl bg-white text-left transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-blue"
          >
            <SanityImage
              image={member.photo}
              width={400}
              height={360}
              className="aspect-10/9 w-full object-cover"
              placeholderLabel="Headshot"
            />
            <span className="block p-5 text-deep-blue">
              <span className="block text-h4">{member.name}</span>
              <span className="mt-1 block text-caption text-deep-blue-80">
                {member.role}
              </span>
              {/* The open affordance from the design — a quiet circle that
                  fills on hover, so the card reads as pressable without
                  shouting about it. */}
              <span
                aria-hidden
                className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-deep-blue/30 text-deep-blue transition group-hover:bg-deep-blue group-hover:text-white"
              >
                +
              </span>
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={open?.name ? `About ${open.name}` : "Team member bio"}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          // A click on the backdrop lands on the <dialog> element itself;
          // clicks inside land on its children.
          if (event.target === dialogRef.current) setOpen(null);
        }}
        className="m-auto w-[min(92vw,34rem)] rounded-2xl p-0 shadow-xl backdrop:bg-deep-blue/60"
      >
        {open && (
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div className="flex items-center gap-4">
                <SanityImage
                  image={open.photo}
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-full object-cover"
                  placeholderLabel=""
                />
                <div>
                  <h3 className="text-h3 text-deep-blue">{open.name}</h3>
                  <p className="text-caption text-deep-blue-80">
                    {open.role}
                    {open.pronouns ? ` · ${open.pronouns}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-deep-blue-80 transition hover:bg-off-white-tan hover:text-deep-blue"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 p-6 text-deep-blue">
              {open.bio && <p className="text-body-lg">{open.bio}</p>}
              {open.outsideWork && (
                <p className="text-body text-deep-blue-80">
                  <span className="font-semibold text-deep-blue">
                    Outside work:
                  </span>{" "}
                  {open.outsideWork}
                </p>
              )}
              {(open.skills?.length ?? 0) > 0 && (
                <p className="text-body text-deep-blue-80">
                  <span className="font-semibold text-deep-blue">Skills:</span>{" "}
                  {open.skills?.join(", ")}
                </p>
              )}
              {open.favouriteHubSpotFeature && (
                <p className="text-body text-deep-blue-80">
                  <span className="font-semibold text-deep-blue">
                    Favourite HubSpot feature:
                  </span>{" "}
                  {open.favouriteHubSpotFeature}
                </p>
              )}
              {open.whyTheyLoveHubSpot && (
                <p className="text-body text-deep-blue-80">
                  <span className="font-semibold text-deep-blue">
                    Why they love HubSpot:
                  </span>{" "}
                  {open.whyTheyLoveHubSpot}
                </p>
              )}
              {open.linkedIn && (
                <a
                  href={open.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body font-semibold text-deep-blue underline decoration-sky-blue decoration-2 underline-offset-4"
                >
                  Connect on LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
