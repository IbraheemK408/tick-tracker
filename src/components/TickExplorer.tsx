"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import SightingDetails from "@/components/SightingDetails";
import { CITY_COORDINATES } from "@/lib/cities";
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

const CITY_NAMES = Object.keys(CITY_COORDINATES).sort();

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

  // The selected city lives in the page address (e.g. /?city=Leeds),
  // so a shared link opens with that city already selected.
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city");

  function selectCity(city: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (city) params.set("city", city);
    else params.delete("city");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

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

  const selectedSummary = cities.find((c) => c.city === selectedCity);
  const selectedSightings = useMemo(
    () => filtered.filter((s) => s.location === selectedCity),
    [filtered, selectedCity],
  );
  const years = yearsBetween(from, to);

  function resetFilters() {
    setFrom(earliest);
    setTo(latest);
    setSpecies(allSpecies);
    setSeverities(SEVERITY_LEVELS);
  }

  return (
    // Phones: everything stacked. Medium screens: filters | map, details under the map.
    // Wide screens: filters | map | details side by side.
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

      {/* On wide screens the map fills the screen height and stays put while the side panels scroll */}
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

// Adds the item to the list if it's missing, or removes it if it's there.
function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

// Every year from one date to another, e.g. "2012", "2013", … "2024".
function yearsBetween(from: string, to: string): string[] {
  const years: string[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) years.push(String(y));
  return years;
}
