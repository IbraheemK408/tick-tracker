import { getSightings, type Sighting } from "@/lib/sightings";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  });
}

export default async function Home() {
  let sightings: Sighting[];
  try {
    sightings = await getSightings();
  } catch {
    return (
      <main className="mx-auto w-full max-w-4xl p-6">
        <h1 className="text-2xl font-bold">UK Tick Sightings</h1>
        <p role="alert" className="mt-4 text-red-700">
          Sorry, we couldn&apos;t load sightings right now. Please try again in a minute.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-bold">UK Tick Sightings</h1>
      <p className="mt-1 text-sm opacity-70">
        Showing {sightings.length} sightings, newest first.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-current/20">
            <tr>
              <th scope="col" className="py-2 pr-4">Date</th>
              <th scope="col" className="py-2 pr-4">Location</th>
              <th scope="col" className="py-2 pr-4">Species</th>
            </tr>
          </thead>
          <tbody>
            {sightings.map((s) => (
              <tr key={s.id} className="border-b border-current/10">
                <td className="py-2 pr-4 whitespace-nowrap">{formatDate(s.date)}</td>
                <td className="py-2 pr-4">{s.location}</td>
                <td className="py-2 pr-4">
                  {s.species} <em className="opacity-60">({s.latinName})</em>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
