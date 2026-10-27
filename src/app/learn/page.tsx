import type { Metadata } from "next";
import SeasonalActivity from "@/components/SeasonalActivity";
import {
  REMOVAL_STEPS,
  SPECIES,
  TIPS_FOR_PEOPLE,
  TIPS_FOR_PETS,
  WHEN_TO_GET_HELP,
  type Tip,
} from "@/lib/education";
import { getSightings, type Sighting } from "@/lib/sightings";

export const metadata: Metadata = {
  title: "Learn about ticks | UK Tick Tracker",
};

export default async function LearnPage() {
  // The guide still works without the API; only the counts and chart need it.
  let sightings: Sighting[] = [];
  try {
    sightings = await getSightings();
  } catch {
    // Leave the list empty; the chart section shows an error message instead.
  }

  const countFor = (species: string) => sightings.filter((s) => s.species === species).length;

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Learn about ticks</h1>
      <p className="mt-1 text-sm opacity-70">
        How to recognise the species in our data, protect yourself and your pets, and when ticks are most active.
      </p>

      <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href="#species" className="rounded-full border border-current/30 px-3 py-1 hover:bg-current/10">
          Species guide
        </a>
        <a href="#prevention" className="rounded-full border border-current/30 px-3 py-1 hover:bg-current/10">
          Prevention tips
        </a>
        <a href="#seasonal" className="rounded-full border border-current/30 px-3 py-1 hover:bg-current/10">
          Seasonal activity
        </a>
      </nav>

      {/* ---------- Species guide ---------- */}
      <section id="species" className="mt-10 scroll-mt-6">
        <h2 className="text-xl font-semibold">Species identification guide</h2>
        <p className="mt-2 text-sm">
          Adult ticks are small, about the size of a sesame seed before feeding, with eight legs. They swell to
          the size of a pea once they&apos;ve fed. Telling species apart usually needs a magnifying glass, so if
          you find one, you can send it to the{" "}
          <a
            href="https://www.gov.uk/guidance/tick-surveillance-scheme"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            UKHSA Tick Surveillance Scheme
          </a>{" "}
          to be identified.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SPECIES.map((s) => (
            <article key={s.name} className="rounded-lg border border-current/20 p-4">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm italic opacity-70">
                {s.latinName}
                {s.alsoKnownAs && <span className="not-italic"> · {s.alsoKnownAs}</span>}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-medium">Feeds on</dt>
                  <dd>{s.hosts}</dd>
                </div>
                <div>
                  <dt className="font-medium">Lives in</dt>
                  <dd>{s.habitat}</dd>
                </div>
                <div>
                  <dt className="font-medium">Where in the UK</dt>
                  <dd>{s.ukRange}</dd>
                </div>
                <div>
                  <dt className="font-medium">Risk to people and pets</dt>
                  <dd>{s.riskToPeopleAndPets}</dd>
                </div>
              </dl>
              {sightings.length > 0 && (
                <p className="mt-3 text-sm font-medium text-teal-600">{countFor(s.name)} sightings in our data</p>
              )}
            </article>
          ))}

          <article className="rounded-lg border-2 border-teal-600 p-4">
            <h3 className="font-semibold">Not in our data: the sheep tick</h3>
            <p className="text-sm italic opacity-70">Ixodes ricinus · also called the castor bean tick</p>
            <p className="mt-3 text-sm">
              The tick people and pets in the UK are most likely to find. It lives in woodland, moorland and long
              grass, especially where there are deer and sheep, and is the main carrier of Lyme disease.
            </p>
          </article>
        </div>

        <p className="mt-4 text-xs opacity-70">
          The ranges above come from published records (ESCCAP UK; Provisional Atlas of the Ticks of the British
          Isles). The sightings data comes from Elanco&apos;s practice API, so its locations don&apos;t always
          match where these species are usually found.
        </p>
      </section>

      {/* ---------- Prevention tips ---------- */}
      <section id="prevention" className="mt-12 scroll-mt-6">
        <h2 className="text-xl font-semibold">Prevention tips</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <TipList heading="Protect yourself" tips={TIPS_FOR_PEOPLE} source="NHS" />
          <TipList heading="Protect your pets" tips={TIPS_FOR_PETS} source="ESCCAP UK" />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-current/20 p-4">
            <h3 className="font-semibold">How to remove a tick</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {REMOVAL_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-red-700/50 bg-red-700/5 p-4">
            <h3 className="font-semibold">When to get medical help</h3>
            <p className="mt-2 text-sm">{WHEN_TO_GET_HELP}</p>
          </div>
        </div>
      </section>

      {/* ---------- Seasonal activity ---------- */}
      <section id="seasonal" className="mt-12 scroll-mt-6">
        <h2 className="text-xl font-semibold">Seasonal activity</h2>
        <p className="mt-2 text-sm">
          Choose a city and year to see which months had the most sightings.
        </p>
        <div className="mt-4">
          {sightings.length > 0 ? (
            <SeasonalActivity sightings={sightings} />
          ) : (
            <p role="alert" className="text-sm text-red-700">
              Sorry, we couldn&apos;t load sightings for the chart right now. Please try again in a minute.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function TipList({ heading, tips, source }: { heading: string; tips: Tip[]; source: string }) {
  return (
    <div>
      <h3 className="font-semibold">{heading}</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {tips.map((tip) => (
          <li key={tip.title}>
            <span className="font-medium">{tip.title}:</span> {tip.detail}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs opacity-70">Source: {source}</p>
    </div>
  );
}
