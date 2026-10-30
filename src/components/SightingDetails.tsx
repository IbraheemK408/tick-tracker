"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import type { YearCount } from "@/components/CityTimeline";
import type { Sighting } from "@/lib/sightings";
import { SEVERITY_COLOURS, type CitySummary } from "@/lib/severity";

// Charts measure the space they're drawn in, which only works in the browser.
const CityTimeline = dynamic(() => import("@/components/CityTimeline"), {
  ssr: false,
  loading: () => <div className="h-[180px]" />,
});

type Props = {
  cityNames: string[];
  selectedCity: string | null;
  summary: CitySummary | undefined;
  citySightings: Sighting[]; // this city's sightings that match the filters
  years: string[]; // every year in the current date range, for the timeline
  onSelect: (city: string | null) => void;
};

// The panel beside the map showing details about the selected city.
export default function SightingDetails({
  cityNames,
  selectedCity,
  summary,
  citySightings,
  years,
  onSelect,
}: Props) {
  // A dropdown as well as map clicks, so keyboard and screen-reader users can pick a city too.
  const cityPicker = (
    <label className="block text-sm">
      Choose a city
      <select
        value={selectedCity ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5"
      >
        <option value="">Select…</option>
        {cityNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );

  if (!selectedCity) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sighting details</h2>
        <p className="text-sm opacity-70">Click a city on the map to see its sightings.</p>
        {cityPicker}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        <PanelHeader city={selectedCity} onClose={() => onSelect(null)} />
        <p className="text-sm">No sightings in {selectedCity} match the current filters.</p>
        {cityPicker}
      </div>
    );
  }

  const timeline: YearCount[] = years.map((year) => ({
    year,
    sightings: citySightings.filter((s) => s.date.startsWith(year)).length,
  }));
  const speciesCounts = countSpecies(citySightings);

  return (
    <div className="flex flex-col gap-5">
      <PanelHeader city={summary.city} onClose={() => onSelect(null)} />

      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-medium capitalize"
          style={{
            backgroundColor: SEVERITY_COLOURS[summary.severity],
            color: summary.severity === "high" ? "#ffffff" : "#111827",
          }}
        >
          {summary.severity} severity
        </span>
        <span className="text-sm">{summary.count} sightings</span>
      </div>

      {/* key resets the share message when a different city is picked */}
      <QuickActions key={summary.city} city={summary.city} lat={summary.lat} lng={summary.lng} />

      <section>
        <h3 className="font-semibold">Activity over time</h3>
        <p className="text-xs opacity-70">Sightings per year</p>
        <CityTimeline data={timeline} />
      </section>

      <section>
        <h3 className="font-semibold">Species seen</h3>
        <ul className="mt-1 text-sm">
          {speciesCounts.map((item) => (
            <li key={item.name} className="flex justify-between border-b border-current/10 py-1">
              <span>{item.name}</span>
              <span>{item.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">Latest sightings</h3>
        <ul className="mt-1 text-sm">
          {citySightings.slice(0, 5).map((s) => (
            <li key={s.id} className="border-b border-current/10 py-1">
              <span className="block">{s.species}</span>
              <span className="text-xs opacity-70">
                {new Date(s.date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {cityPicker}
    </div>
  );
}

function PanelHeader({ city, onClose }: { city: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <h2 className="text-lg font-semibold">{city}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close details"
        className="rounded px-2 text-xl leading-none hover:bg-current/10"
      >
        ×
      </button>
    </div>
  );
}

function QuickActions({ city, lat, lng }: { city: string; lat: number; lng: number }) {
  const [shareMessage, setShareMessage] = useState("");
  const [manualLink, setManualLink] = useState("");

  // Tries three ways to share, in order:
  // 1. the phone's share menu, 2. copy the link, 3. show the link to copy by hand.
  async function share() {
    const url = `${window.location.origin}/?city=${encodeURIComponent(city)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Tick sightings in ${city}`, url });
      } catch {
        // The user closed the share menu, so do nothing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied!");
    } catch {
      // Some browsers block copying.
      setManualLink(url);
    }
  }

  const buttonClass =
    "rounded border border-current/30 px-3 py-1.5 text-center text-sm hover:bg-current/10";

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Link
          href={`/report?city=${encodeURIComponent(city)}`}
          className="rounded bg-teal-700 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-teal-800"
        >
          Report
        </Link>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          Directions
        </a>
        <button type="button" onClick={share} className={buttonClass}>
          Share
        </button>
      </div>
      <p className="mt-1 h-4 text-xs" aria-live="polite">
        {shareMessage}
      </p>
      {manualLink && (
        <label className="block text-xs">
          Copy this link to share:
          <input
            readOnly
            value={manualLink}
            onFocus={(e) => e.target.select()}
            autoFocus
            className="mt-1 block w-full rounded border border-current/30 bg-transparent p-1.5"
          />
        </label>
      )}
    </div>
  );
}

// How many sightings of each species, most common first.
function countSpecies(sightings: Sighting[]) {
  const counts: Record<string, number> = {};
  for (const s of sightings) {
    counts[s.species] = (counts[s.species] || 0) + 1;
  }

  const list = Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  list.sort((a, b) => b.count - a.count);
  return list;
}
