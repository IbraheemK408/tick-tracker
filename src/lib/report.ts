import { CITY_COORDINATES } from "@/lib/cities";
import { SPECIES } from "@/lib/education";

// Rules for the Report a Sighting form. The database has the same rules
// (supabase/setup.sql), so bad data can't get in even without the form.

export const CITY_OPTIONS = Object.keys(CITY_COORDINATES).sort();
export const SPECIES_OPTIONS = [...SPECIES.map((s) => s.name), "Not sure"];

export const MAX_NOTES_LENGTH = 500;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// What the user typed into the form.
export type Report = {
  date: string; // e.g. "2026-10-27"
  time: string; // e.g. "14:30"
  location: string;
  species: string;
  notes: string;
  photo: File | null;
};

// A message for each field that has a problem (fields without one are left out).
export type Messages = {
  date?: string;
  time?: string;
  location?: string;
  species?: string;
  notes?: string;
  photo?: string;
};

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000; // in milliseconds

// Checks the form. Errors stop it from sending.
// Warnings still let it send, but ask the user to double-check.
export function checkReport(report: Report) {
  const errors: Messages = {};
  const warnings: Messages = {};
  const now = new Date();

  // Date (checked together with the time, as one moment)
  const seenAt = new Date(`${report.date}T${report.time || "00:00"}`);
  if (!report.date) {
    errors.date = "Please enter the date you saw the tick.";
  } else if (seenAt > now) {
    errors.date = "The date and time can't be in the future.";
  } else if (seenAt.getFullYear() < 2000) {
    errors.date = "Please enter a date from 2000 onwards.";
  } else if (now.getTime() - seenAt.getTime() > ONE_YEAR) {
    warnings.date = "This was over a year ago. Please check the date is right before sending.";
  }

  // Time
  if (!report.time) {
    errors.time = "Please enter roughly what time you saw the tick.";
  }

  // City
  if (!CITY_OPTIONS.includes(report.location)) {
    errors.location = "Please choose the nearest city.";
  }

  // Species
  if (!SPECIES_OPTIONS.includes(report.species)) {
    errors.species = "Please choose a species, or “Not sure”.";
  } else if (report.species === "Not sure" && !report.photo) {
    warnings.species = "Not sure of the species? Adding a photo helps experts identify it.";
  }

  // Notes
  if (report.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes can be up to ${MAX_NOTES_LENGTH} characters.`;
  }

  // Photo
  if (report.photo) {
    if (!PHOTO_TYPES.includes(report.photo.type)) {
      errors.photo = "Photos must be JPG, PNG or WebP images.";
    } else if (report.photo.size > MAX_PHOTO_SIZE) {
      errors.photo = "Photos must be 5 MB or smaller.";
    }
  }

  return { errors, warnings };
}

// Today's date as "YYYY-MM-DD", which is the format date inputs use.
export function today(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months start at 0
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
