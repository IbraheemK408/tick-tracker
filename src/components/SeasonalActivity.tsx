"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MonthCount } from "@/components/MonthlyChart";
import { CITY_COORDINATES } from "@/lib/cities";
import type { Sighting } from "@/lib/sightings";

// Charts measure the space they're drawn in, which only works in the browser.
const MonthlyChart = dynamic(() => import("@/components/MonthlyChart"), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CITY_NAMES = Object.keys(CITY_COORDINATES).sort();
const ALL = "all";

// Seasonal activity chart: sightings per month, for a chosen city and year.
export default function SeasonalActivity({ sightings }: { sightings: Sighting[] }) {
  const years = [...new Set(sightings.map((s) => s.date.slice(0, 4)))].sort().reverse();
  const [city, setCity] = useState(ALL);
  const [year, setYear] = useState(ALL);

  const matching = sightings.filter(
    (s) => (city === ALL || s.location === city) && (year === ALL || s.date.startsWith(year)),
  );

  // Count sightings in each month. Dates look like "2022-08-01T06:40:31",
  // so characters 5–6 are the month number.
  const data: MonthCount[] = MONTHS.map((month, i) => ({
    month,
    sightings: matching.filter((s) => Number(s.date.slice(5, 7)) === i + 1).length,
  }));

  const busiest = data.reduce((top, m) => (m.sightings > top.sightings ? m : top), data[0]);
  const place = city === ALL ? "all cities" : city;
  const when = year === ALL ? "2012–2024" : year;

  const selectClass = "mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <label className="block text-sm">
          City
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
            <option value={ALL}>All cities</option>
            {CITY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Year
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
            <option value={ALL}>All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm" aria-live="polite">
        {matching.length === 0
          ? `No sightings recorded in ${place} in ${when}.`
          : `${matching.length} sightings in ${place}, ${when}. Busiest month: ${
              MONTH_NAMES[MONTHS.indexOf(busiest.month)]
            } (${busiest.sightings}).`}
      </p>

      <div className="mt-2" role="img" aria-label={`Bar chart of tick sightings per month in ${place}, ${when}`}>
        <MonthlyChart data={data} />
      </div>
    </div>
  );
}
