"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Sighting } from "@/lib/sightings";
import {
  SEVERITY_COLOURS,
  SEVERITY_LEVELS,
  summariseByCity,
  type Severity,
} from "@/lib/severity";

// Leaflet needs the browser's `window`, so the map is only loaded in the browser.
const SightingsMap = dynamic(() => import("@/components/SightingsMap"), {
  ssr: false,
  loading: () => <p className="p-4">Loading map…</p>,
});

// Holds the filter choices and works out what the map should show.
export default function TickExplorer({ sightings }: { sightings: Sighting[] }) {
  // Sightings arrive sorted newest first.
  const earliest = sightings.at(-1)?.date.slice(0, 10) ?? "";
  const latest = sightings[0]?.date.slice(0, 10) ?? "";
  const allSpecies = useMemo(
    () => [...new Set(sightings.map((s) => s.species))].sort(),
    [sightings],
  );

  const [from, setFrom] = useState(earliest);
  const [to, setTo] = useState(latest);
  const [species, setSpecies] = useState<string[]>(allSpecies);
  const [severities, setSeverities] = useState<Severity[]>(SEVERITY_LEVELS);

  // 1. Keep only sightings inside the date range and chosen species.
  const filtered = useMemo(
    () =>
      sightings.filter((s) => {
        const day = s.date.slice(0, 10);
        return day >= from && day <= to && species.includes(s.species);
      }),
    [sightings, from, to, species],
  );

  // 2. Group by city and work out severity, then 3. hide unchosen severities.
  const cities = useMemo(
    () => summariseByCity(filtered).filter((c) => severities.includes(c.severity)),
    [filtered, severities],
  );
  const shownCount = cities.reduce((sum, c) => sum + c.count, 0);

  function resetFilters() {
    setFrom(earliest);
    setTo(latest);
    setSpecies(allSpecies);
    setSeverities(SEVERITY_LEVELS);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:flex-row">
      <aside className="flex w-full flex-col gap-5 md:w-72 md:shrink-0" aria-label="Map filters">
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
              className="mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5"
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
              className="mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend className="font-semibold">Species</legend>
          {allSpecies.map((name) => (
            <label key={name} className="mt-1.5 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={species.includes(name)}
                onChange={() => setSpecies(toggle(species, name))}
              />
              {name}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend className="font-semibold">Severity</legend>
          <p className="text-xs opacity-70">Based on how many sightings a city has compared with other cities.</p>
          {SEVERITY_LEVELS.map((level) => (
            <label key={level} className="mt-1.5 flex items-center gap-2 text-sm capitalize">
              <input
                type="checkbox"
                checked={severities.includes(level)}
                onChange={() => setSeverities(toggle(severities, level))}
              />
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

      <section className="h-[60vh] flex-1 md:h-auto md:min-h-[500px]" aria-label="Sightings map">
        <SightingsMap cities={cities} />
      </section>
    </div>
  );
}

// Adds the item to the list if it's missing, or removes it if it's there.
function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
