import { CITY_COORDINATES } from "@/lib/cities";
import { SPECIES } from "@/lib/education";

// Rules for the Report a Sighting form. The same limits are enforced again
// by the database (supabase/setup.sql), so bad data can't get in either way.

export const CITY_OPTIONS = Object.keys(CITY_COORDINATES).sort();
export const NOT_SURE = "Not sure";
export const SPECIES_OPTIONS = [...SPECIES.map((s) => s.name), NOT_SURE];

export const MAX_NOTES_LENGTH = 500;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ReportValues = {
  date: string; // "2026-10-27"
  time: string; // "14:30"
  location: string;
  species: string;
  notes: string;
  photo: File | null;
};

export type Field = keyof ReportValues;

// Errors stop the form from sending. Warnings don't, but ask the user to double-check.
export type CheckResult = {
  errors: Partial<Record<Field, string>>;
  warnings: Partial<Record<Field, string>>;
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function checkReport(values: ReportValues, now = new Date()): CheckResult {
  const errors: CheckResult["errors"] = {};
  const warnings: CheckResult["warnings"] = {};

  // Date and time are checked together, because together they make one moment.
  const sightedAt = new Date(`${values.date}T${values.time || "00:00"}`);
  if (!values.date) {
    errors.date = "Please enter the date you saw the tick.";
  } else if (Number.isNaN(sightedAt.getTime())) {
    errors.date = "Please enter a valid date.";
  } else if (sightedAt > now) {
    errors.date = "The date and time can't be in the future.";
  } else if (sightedAt.getFullYear() < 2000) {
    errors.date = "Please enter a date from 2000 onwards.";
  } else if (now.getTime() - sightedAt.getTime() > ONE_YEAR_MS) {
    warnings.date = "This was over a year ago. Please check the date is right before sending.";
  }

  if (!values.time) errors.time = "Please enter roughly what time you saw the tick.";

  if (!CITY_OPTIONS.includes(values.location)) errors.location = "Please choose the nearest city.";

  if (!SPECIES_OPTIONS.includes(values.species)) {
    errors.species = "Please choose a species, or “Not sure”.";
  } else if (values.species === NOT_SURE && !values.photo) {
    warnings.species = "Not sure of the species? Adding a photo helps experts identify it.";
  }

  if (values.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes can be up to ${MAX_NOTES_LENGTH} characters.`;
  }

  if (values.photo) {
    if (!PHOTO_TYPES.includes(values.photo.type)) {
      errors.photo = "Photos must be JPG, PNG or WebP images.";
    } else if (values.photo.size > MAX_PHOTO_BYTES) {
      errors.photo = "Photos must be 5 MB or smaller.";
    }
  }

  return { errors, warnings };
}

// Today's date as "YYYY-MM-DD" in the user's own time zone (for the date picker's max).
export function todayString(now = new Date()): string {
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
