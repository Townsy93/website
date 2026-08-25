import Image from "next/image";

// The two leaf clusters from the brand stone background, extracted to
// transparent PNGs. The source texture positions them at its own corners,
// so bg-cover crops them to slivers on any section whose aspect ratio
// differs from the image — Sean's note (19 Aug 2026): "we should see the
// full sapling as per the mock-up". Pinned to the section corners the
// stems still run off the edge, but every leaf stays visible at every
// viewport. Parent must be relative + overflow-hidden; content that
// should sit above them needs its own positioning.
export function LeafCorners() {
  const shared =
    "pointer-events-none absolute hidden w-40 select-none lg:block xl:w-52";
  return (
    <>
      <Image
        src="/leaf-top-left.png"
        alt=""
        aria-hidden
        width={500}
        height={396}
        className={`${shared} left-0 top-0`}
      />
      <Image
        src="/leaf-bottom-right.png"
        alt=""
        aria-hidden
        width={510}
        height={404}
        className={`${shared} bottom-0 right-0`}
      />
    </>
  );
}
