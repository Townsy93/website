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
