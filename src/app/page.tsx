import { Suspense } from "react";
import TickExplorer from "@/components/TickExplorer";
import { getSightings, type Sighting } from "@/lib/sightings";

export default async function Home() {
  let sightings: Sighting[];
  try {
    sightings = await getSightings();
  } catch {
    return (
      <main className="mx-auto w-full max-w-7xl p-6">
        <h1 className="text-2xl font-bold">UK Tick Sightings</h1>
        <p role="alert" className="mt-4 text-red-700">
          Sorry, we couldn&apos;t load sightings right now. Please try again in a minute.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold">UK Tick Sightings</h1>
      <p className="mb-4 mt-1 text-sm opacity-70">
        Click a city to see its sightings. Use the filters to narrow down by date, species or severity.
      </p>
      {/* TickExplorer reads the selected city from the page address, which is only known in the browser */}
      <Suspense fallback={<p>Loading map…</p>}>
        <TickExplorer sightings={sightings} />
      </Suspense>
    </main>
  );
}
