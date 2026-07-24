export default function Home() {
  return (
    <>
      {/* Light section — Off-White Tan. No Deep Orange allowed here. */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-caption uppercase">Token check — light section</p>
          <h1 className="mt-4 text-h1-mobile md:text-h1">
            HubSpot, set up the way your team actually works
          </h1>
          <h2 className="mt-6 text-h2">
            Heading two sits at 36 over 44
          </h2>
          <h3 className="mt-4 text-h3">Heading three sits at 24 over 32</h3>
          <h4 className="mt-4 text-h4">Heading four sits at 18 over 26</h4>
          <p className="mt-6 max-w-2xl text-body-lg">
            This is body-large at 18 over 28. We build CRMs that people enjoy
            using — clean pipelines, honest reporting, and automation that
            saves real hours instead of creating new admin.
          </p>
          <p className="mt-4 max-w-2xl text-body">
            This is body at 16 over 26. Every heading tracks at minus six
            percent and body copy tracks at minus three percent, so watch for
            letter collisions in the tight settings. Secondary accent{" "}
            <span className="text-sky-blue">sky blue</span> is fine on light
            backgrounds.
          </p>
          <p className="mt-4 text-caption">
            Caption at 13 over 18 — image credits, fine print, small labels.
          </p>
        </div>
      </section>

      {/* Dark section — Deep Blue. Deep Orange accents live here. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-caption uppercase text-sky-blue">
            Token check — dark section
          </p>
          <h1 className="mt-4 text-h1-mobile md:text-h1">
            The same scale on <span className="text-deep-orange">deep blue</span>
          </h1>
          <h2 className="mt-6 text-h2">Heading two sits at 36 over 44</h2>
          <h3 className="mt-4 text-h3">Heading three sits at 24 over 32</h3>
          <h4 className="mt-4 text-h4">Heading four sits at 18 over 26</h4>
          <p className="mt-6 max-w-2xl text-body-lg">
            This is body-large at 18 over 28 in white on Deep Blue. Deep Orange
            is only ever used on this background — never on white or tan.
          </p>
          <p className="mt-4 max-w-2xl text-body text-sky-blue">
            This is body at 16 over 26 in Sky Blue, the secondary accent.
          </p>
          <a
            href="/contact"
            className="mt-8 inline-block rounded-full bg-deep-orange px-6 py-3 text-body font-semibold text-deep-blue transition hover:bg-deep-orange/90"
          >
            Deep Orange button on Deep Blue
          </a>
        </div>
      </section>
    </>
  );
}
