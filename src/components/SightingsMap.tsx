"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { SEVERITY_COLOURS, type CitySummary } from "@/lib/severity";

const UK_CENTRE: [number, number] = [54.3, -2.5];

type Props = {
  cities: CitySummary[];
  selectedCity: string | null;
  onSelect: (city: string) => void;
};

export default function SightingsMap({ cities, selectedCity, onSelect }: Props) {
  const maxCount = Math.max(1, ...cities.map((c) => c.count));

  return (
    <MapContainer
      center={UK_CENTRE}
      zoom={6}
      className="h-full w-full rounded-lg"
      aria-label="Map of UK tick sightings by city"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ResizeWatcher />

      {cities.map((c) => {
        const isSelected = c.city === selectedCity;
        return (
          <CircleMarker
            key={c.city}
            center={[c.lat, c.lng]}
            // Bigger circle = more sightings (square root so area grows with count)
            radius={8 + 16 * Math.sqrt(c.count / maxCount)}
            pathOptions={{
              // The selected city gets a thick dark outline so it stands out
              color: isSelected ? "#111827" : "#ffffff",
              weight: isSelected ? 4 : 2,
              fillColor: SEVERITY_COLOURS[c.severity],
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(c.city) }}
          >
            <Tooltip>
              <strong>{c.city}</strong>
              <br />
              {c.count} sightings · {c.severity} severity
              <br />
              Most common: {c.topSpecies}
              <br />
              Latest: {new Date(c.latestDate).toLocaleDateString("en-GB", { dateStyle: "medium" })}
              <br />
              <em>Click for details</em>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

// Leaflet measures its box once when it loads. If the layout changes size
// afterwards (e.g. the details panel opens), this tells it to re-measure,
// otherwise parts of the map are left blank.
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
