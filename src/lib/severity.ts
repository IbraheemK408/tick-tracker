import { CITY_COORDINATES } from "@/lib/cities";
import type { Sighting } from "@/lib/sightings";

export type Severity = "low" | "medium" | "high";

export const SEVERITY_LEVELS: Severity[] = ["low", "medium", "high"];

// Yellow, orange, dark red. More sightings = darker. These colours can still
// be told apart by people with red/green colour blindness.
export const SEVERITY_COLOURS = {
  low: "#fecc5c",
  medium: "#fd8d3c",
  high: "#bd0026",
};

// Everything the map needs to know about one city.
export type CitySummary = {
  city: string;
  lat: number;
  lng: number;
  count: number;
  severity: Severity;
  topSpecies: string;
  latestDate: string;
};

// Groups the sightings by city and gives each city a severity.
//
// The API doesn't have a severity field, so I made my own rule by
// comparing each city with the average city:
//   more than 120% of the average = high
//   less than 80% of the average  = low
//   anything in between           = medium
// It uses the filtered sightings, so it changes when the filters change.
export function summariseByCity(sightings: Sighting[]): CitySummary[] {
  // Step 1: put each city's sightings into its own list.
  const sightingsByCity: Record<string, Sighting[]> = {};
  for (const sighting of sightings) {
    const city = sighting.location;
    if (!CITY_COORDINATES[city]) continue; // skip cities we can't put on the map
    if (!sightingsByCity[city]) sightingsByCity[city] = [];
    sightingsByCity[city].push(sighting);
  }

  const cityNames = Object.keys(sightingsByCity);

  // Step 2: work out the average number of sightings per city.
  // e.g. 1000 sightings across 14 cities = about 71 each
  let total = 0;
  for (const city of cityNames) total += sightingsByCity[city].length;
  const average = total / cityNames.length;

  // Step 3: build a summary for each city.
  const summaries: CitySummary[] = [];
  for (const city of cityNames) {
    const citySightings = sightingsByCity[city];
    const count = citySightings.length;

    // e.g. average 71: more than 85 sightings = high, fewer than 57 = low
    let severity: Severity = "medium";
    if (count > average * 1.2) severity = "high";
    else if (count < average * 0.8) severity = "low";

    summaries.push({
      city,
      lat: CITY_COORDINATES[city].lat,
      lng: CITY_COORDINATES[city].lng,
      count,
      severity,
      topSpecies: mostCommonSpecies(citySightings),
      latestDate: latestDate(citySightings),
    });
  }

  return summaries;
}

// The species that appears most often in a list of sightings.
function mostCommonSpecies(sightings: Sighting[]): string {
  const counts: Record<string, number> = {};
  for (const sighting of sightings) {
    counts[sighting.species] = (counts[sighting.species] || 0) + 1;
  }

  let best = "";
  for (const species in counts) {
    if (best === "" || counts[species] > counts[best]) best = species;
  }
  return best;
}

// The date of the most recent sighting in a list.
function latestDate(sightings: Sighting[]): string {
  let latest = "";
  for (const sighting of sightings) {
    if (sighting.date > latest) latest = sighting.date;
  }
  return latest;
}
