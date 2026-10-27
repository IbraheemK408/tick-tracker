"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { SEVERITY_COLOURS, type CitySummary } from "@/lib/severity";

const UK_CENTRE: [number, number] = [54.3, -2.5];

export default function SightingsMap({ cities }: { cities: CitySummary[] }) {
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

      {cities.map((c) => (
        <CircleMarker
          key={c.city}
          center={[c.lat, c.lng]}
          // Bigger circle = more sightings (square root so area grows with count)
          radius={8 + 16 * Math.sqrt(c.count / maxCount)}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: SEVERITY_COLOURS[c.severity],
            fillOpacity: 0.85,
          }}
        >
          <Tooltip>
            <strong>{c.city}</strong>
            <br />
            {c.count} sightings · {c.severity} severity
            <br />
            Most common: {c.topSpecies}
            <br />
            Latest: {new Date(c.latestDate).toLocaleDateString("en-GB", { dateStyle: "medium" })}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
