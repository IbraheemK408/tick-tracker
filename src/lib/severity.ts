import { CITY_COORDINATES } from "@/lib/cities";
import type { Sighting } from "@/lib/sightings";

export type Severity = "low" | "medium" | "high";

export const SEVERITY_LEVELS: Severity[] = ["low", "medium", "high"];

// Yellow → orange → dark red: reads as "more = worse" and stays
// distinguishable for people with red/green colour blindness.
export const SEVERITY_COLOURS: Record<Severity, string> = {
  low: "#fecc5c",
  medium: "#fd8d3c",
  high: "#bd0026",
};

export type CitySummary = {
  city: string;
  lat: number;
  lng: number;
  count: number;
  severity: Severity;
  topSpecies: string;
  latestDate: string;
};

// Groups sightings by city and gives each city a severity.
// The API has no severity field, so we define it ourselves: cities are
// ranked by how many sightings they have, and split into thirds
// (bottom third = low, middle = medium, top third = high).
// Because it's based on whatever sightings are passed in, severity
// updates when the user changes the date or species filters.
export function summariseByCity(sightings: Sighting[]): CitySummary[] {
  const byCity = new Map<string, Sighting[]>();
  for (const s of sightings) {
    if (!CITY_COORDINATES[s.location]) continue; // can't map a city we have no coordinates for
    byCity.set(s.location, [...(byCity.get(s.location) ?? []), s]);
  }

  const counts = [...byCity.values()].map((list) => list.length);

  return [...byCity.entries()].map(([city, list]) => {
    // Cities with the same count always get the same severity.
    const citiesBelow = counts.filter((c) => c < list.length).length;
    const rank = citiesBelow / counts.length;
    const severity: Severity = rank < 1 / 3 ? "low" : rank < 2 / 3 ? "medium" : "high";

    return {
      city,
      ...CITY_COORDINATES[city],
      count: list.length,
      severity,
      topSpecies: mostCommon(list.map((s) => s.species)),
      latestDate: list.reduce((latest, s) => (s.date > latest ? s.date : latest), ""),
    };
  });
}

function mostCommon(values: string[]): string {
  const tally = new Map<string, number>();
  for (const v of values) tally.set(v, (tally.get(v) ?? 0) + 1);
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
