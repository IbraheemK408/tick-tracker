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

// Chart of sightings per month, for a chosen city and year.
export default function SeasonalActivity({ sightings }: { sightings: Sighting[] }) {
  const [city, setCity] = useState("all");
  const [year, setYear] = useState("all");

  // Every year in the data, newest first, for the Year dropdown.
  const years: string[] = [];
  for (const s of sightings) {
    const y = s.date.slice(0, 4);
    if (!years.includes(y)) years.push(y);
  }
  years.sort().reverse();

  // Only the sightings for the chosen city and year.
  const matching = sightings.filter((s) => {
    const cityMatches = city === "all" || s.location === city;
    const yearMatches = year === "all" || s.date.startsWith(year);
    return cityMatches && yearMatches;
  });

  // Count the sightings in each month. Dates look like "2022-08-01T06:40:31",
  // so characters 5 to 6 are the month ("08" = August).
  const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const s of matching) {
    const month = Number(s.date.slice(5, 7)); // 1 to 12
    monthCounts[month - 1]++;
  }

  const data: MonthCount[] = MONTHS.map((month, i) => ({ month, sightings: monthCounts[i] }));

  // Find the month with the most sightings.
  let busiest = 0;
  for (let i = 1; i < 12; i++) {
    if (monthCounts[i] > monthCounts[busiest]) busiest = i;
  }

  const place = city === "all" ? "all cities" : city;
  const when = year === "all" ? "2012–2024" : year;

  let summary = `No sightings recorded in ${place} in ${when}.`;
  if (matching.length > 0) {
    summary = `${matching.length} sightings in ${place}, ${when}. Busiest month: ${MONTH_NAMES[busiest]} (${monthCounts[busiest]}).`;
  }

  const selectClass = "mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <label className="block text-sm">
          City
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
            <option value="all">All cities</option>
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
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm" aria-live="polite">
        {summary}
      </p>

      <div className="mt-2" role="img" aria-label={`Bar chart of tick sightings per month in ${place}, ${when}`}>
        <MonthlyChart data={data} />
      </div>
    </div>
  );
}
