"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SightingDetails from "@/components/SightingDetails";
import { CITY_COORDINATES } from "@/lib/cities";
import type { Sighting } from "@/lib/sightings";
import { SEVERITY_COLOURS, SEVERITY_LEVELS, summariseByCity, type Severity } from "@/lib/severity";

// Leaflet only works in the browser, so the map isn't loaded on the server.
const SightingsMap = dynamic(() => import("@/components/SightingsMap"), {
  ssr: false,
  loading: () => <p className="p-4">Loading map…</p>,
});

const CITY_NAMES = Object.keys(CITY_COORDINATES).sort();

// The map page: filters on the left, map in the middle, details on the right.
export default function TickExplorer({ sightings }: { sightings: Sighting[] }) {
  // Sightings come in newest first, so the last one is the oldest.
  // .slice(0, 10) turns "2022-08-01T06:40:31" into "2022-08-01".
  const latest = sightings[0].date.slice(0, 10);
  const earliest = sightings[sightings.length - 1].date.slice(0, 10);

  // List of every species, without repeats.
  const allSpecies: string[] = [];
  for (const s of sightings) {
    if (!allSpecies.includes(s.species)) allSpecies.push(s.species);
  }
  allSpecies.sort();

  // The filter choices. Everything is selected to begin with.
  const [from, setFrom] = useState(earliest);
  const [to, setTo] = useState(latest);
  const [species, setSpecies] = useState(allSpecies);
  const [severities, setSeverities] = useState(SEVERITY_LEVELS);

  // The selected city is kept in the web address, e.g. /?city=Leeds,
  // so if someone shares the link it opens on the same city.
  const selectedCity = useSearchParams().get("city");

  function selectCity(city: string | null) {
    const newUrl = city ? `?city=${encodeURIComponent(city)}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }

  // Tick or untick a species / severity checkbox.
  function toggleSpecies(name: string) {
    if (species.includes(name)) setSpecies(species.filter((s) => s !== name));
    else setSpecies([...species, name]);
  }

  function toggleSeverity(level: Severity) {
    if (severities.includes(level)) setSeverities(severities.filter((s) => s !== level));
    else setSeverities([...severities, level]);
  }

  function resetFilters() {
    setFrom(earliest);
    setTo(latest);
    setSpecies(allSpecies);
    setSeverities(SEVERITY_LEVELS);
  }

  // 1. Keep only the sightings inside the date range and ticked species.
  const filtered = sightings.filter((s) => {
    const day = s.date.slice(0, 10);
    return day >= from && day <= to && species.includes(s.species);
  });

  // 2. Group them by city and work out each city's severity.
  // 3. Hide cities whose severity is unticked.
  const cities = summariseByCity(filtered).filter((c) => severities.includes(c.severity));

  let shownCount = 0;
  for (const c of cities) shownCount += c.count;

  // Details for the city that's been clicked (if any).
  const selectedSummary = cities.find((c) => c.city === selectedCity);
  const selectedSightings = filtered.filter((s) => s.location === selectedCity);

  // Every year in the date range, for the timeline chart, e.g. 2012 to 2024.
  const years: string[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) {
    years.push(String(y));
  }

  const inputClass = "mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5";

  return (
    // Phone: everything stacked. Laptop: filters | map, details under the map.
    // Wide screen: filters | map | details.
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] xl:grid-cols-[16rem_1fr_20rem]">
      <aside className="flex flex-col gap-5 lg:row-span-2 xl:row-span-1" aria-label="Map filters">
        <fieldset>
          <legend className="font-semibold">Date range</legend>
          <label className="mt-2 block text-sm">
            From
            <input
              type="date"
              value={from}
              min={earliest}
              max={to}
              onChange={(e) => setFrom(e.target.value || earliest)}
              className={inputClass}
            />
          </label>
          <label className="mt-2 block text-sm">
            To
            <input
              type="date"
              value={to}
              min={from}
              max={latest}
              onChange={(e) => setTo(e.target.value || latest)}
              className={inputClass}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend className="font-semibold">Species</legend>
          {allSpecies.map((name) => (
            <label key={name} className="mt-1.5 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={species.includes(name)} onChange={() => toggleSpecies(name)} />
              {name}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend className="font-semibold">Severity</legend>
          <p className="text-xs opacity-70">Based on how many sightings a city has compared with other cities.</p>
          {SEVERITY_LEVELS.map((level) => (
            <label key={level} className="mt-1.5 flex items-center gap-2 text-sm capitalize">
              <input type="checkbox" checked={severities.includes(level)} onChange={() => toggleSeverity(level)} />
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: SEVERITY_COLOURS[level] }}
              />
              {level}
            </label>
          ))}
        </fieldset>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/10"
        >
          Reset filters
        </button>

        <p className="text-sm" aria-live="polite">
          Showing {shownCount} sightings in {cities.length} cities.
        </p>
      </aside>

      {/* On wide screens the map stays in place while the side panels scroll */}
      <section
        className="h-[60vh] min-h-[400px] xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:self-start"
        aria-label="Sightings map"
      >
        <SightingsMap cities={cities} selectedCity={selectedCity} onSelect={selectCity} />
      </section>

      <aside className="lg:col-start-2 xl:col-start-3" aria-label="Sighting details">
        <SightingDetails
          cityNames={CITY_NAMES}
          selectedCity={selectedCity}
          summary={selectedSummary}
          citySightings={selectedSightings}
          years={years}
          onSelect={selectCity}
        />
      </aside>
    </div>
  );
}
