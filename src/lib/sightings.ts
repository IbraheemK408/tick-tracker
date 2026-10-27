import { cacheLife } from "next/cache";

// Base URL of Elanco's tick sightings API (docs: https://dev-task.elancoapps.com/)
const API_BASE = "https://dev-task.elancoapps.com/data";

// The shape of one record returned by the API.
export type Sighting = {
  id: string;
  date: string; // ISO date-time, e.g. "2022-08-01T06:40:31"
  location: string; // UK city name, e.g. "Manchester"
  species: string; // common name, e.g. "Marsh tick"
  latinName: string; // scientific name, e.g. "Ixodes apronophorus"
};

// Fetches every sighting from the API, newest first.
// The result is cached for hours so we don't hit the API's rate limit
// on every page view (the dataset only has ~1000 historical records).
export async function getSightings(): Promise<Sighting[]> {
  "use cache";
  cacheLife("hours");

  const res = await fetch(`${API_BASE}/tick-sightings`);
  if (!res.ok) {
    throw new Error(`Tick API responded with ${res.status}`);
  }

  const sightings: Sighting[] = await res.json();
  return sightings.sort((a, b) => b.date.localeCompare(a.date));
}
