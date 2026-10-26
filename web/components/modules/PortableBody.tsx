import { PortableText, type PortableTextComponents } from "next-sanity";
import { SanityImage } from "@/components/ui/SanityImage";
import { Marker } from "@/components/ui/Marker";

// Editorial rendering for blockContent (module M31): prose, H2/H3,
// pull quotes with Sky Blue left border, figures with captions.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body-lg leading-relaxed text-deep-blue-80">{children}</p>
    ),
    h2: ({ children }) => <h2 className="mt-10 text-h3">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-h4">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-sky-blue pl-6 text-h3 font-medium text-deep-blue">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 text-body-lg text-deep-blue-80">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 text-body-lg text-deep-blue-80">{children}</ol>
    ),
  },
  marks: {
    // Hand-drawn marker underline, applied by editors as an inline style.
    marker: ({ children }) => (
      <Marker style="underline" color="sky-blue">
        <span className="font-semibold text-deep-blue">{children}</span>
      </Marker>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="font-semibold text-deep-blue underline decoration-sky-blue decoration-2 underline-offset-4"
      >
        {children}
      </a>
    ),
  },
  types: {
    // `@sanity/table` data: rows[].cells[], the first row being the header.
    // The wrapper scrolls sideways on a phone so the page itself never does.
    table: ({ value }: { value?: { rows?: { cells?: string[] }[] } }) => {
      const [head, ...rows] = (value?.rows ?? []).filter((r) => r.cells?.length);
      if (!head) return null;
      return (
        <div className="my-4 overflow-x-auto rounded-xl ring-1 ring-deep-blue/15">
          <table className="w-full min-w-[34rem] border-collapse text-left text-body">
            <thead className="bg-deep-blue text-white">
              <tr>
                {head.cells!.map((cell, i) => (
                  <th key={i} scope="col" className="px-4 py-3 font-semibold">
                    {cell || <span className="sr-only">Item</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-deep-blue-80">
              {rows.map((row, r) => (
                <tr key={r} className="border-t border-deep-blue/15 align-top">
                  {row.cells!.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-4 py-3 font-semibold text-deep-blue">
                        {cell}
                      </th>
                    ) : (
                      <td key={c} className="px-4 py-3">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    figure: ({ value }) => (
      <figure className="my-4">
        <SanityImage
          image={value}
          width={720}
          height={400}
          className="w-full rounded-2xl object-cover"
          placeholderLabel="Article image"
        />
        {value?.caption && (
          <figcaption className="mt-2 text-center text-caption text-deep-blue-80">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export function PortableBody({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-5">
      <PortableText
        value={value as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
