"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CITY_OPTIONS,
  MAX_NOTES_LENGTH,
  SPECIES_OPTIONS,
  checkReport,
  todayString,
  type Field,
  type ReportValues,
} from "@/lib/report";
import { PHOTO_BUCKET, supabase } from "@/lib/supabase";

type Status = "editing" | "sending" | "sent" | "failed";

const FIELD_ORDER: Field[] = ["date", "time", "location", "species", "notes", "photo"];
const inputClass = "mt-1 block w-full rounded border bg-transparent p-1.5";

function emptyForm(city: string | null): ReportValues {
  return {
    date: todayString(),
    time: "",
    location: city && CITY_OPTIONS.includes(city) ? city : "",
    species: "",
    notes: "",
    photo: null,
  };
}

export default function ReportForm() {
  // Coming from a city's "Report" button on the map pre-fills the location.
  const cityFromLink = useSearchParams().get("city");

  const [values, setValues] = useState<ReportValues>(() => emptyForm(cityFromLink));
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [triedToSend, setTriedToSend] = useState(false);
  const [status, setStatus] = useState<Status>("editing");
  const [sentReport, setSentReport] = useState<ReportValues | null>(null);
  // Changing this key clears the file picker, which React can't reset directly.
  const [fileInputKey, setFileInputKey] = useState(0);

  const { errors, warnings } = checkReport(values);
  const errorList = FIELD_ORDER.filter((f) => errors[f]);
  // Only show a field's error once the user has left it or tried to send,
  // so they aren't told off before they've had a chance to type.
  const showError = (field: Field) => (triedToSend || touched[field]) && errors[field];

  // Show a small preview of the chosen photo, and free the memory when it changes.
  const photoPreview = useMemo(() => (values.photo ? URL.createObjectURL(values.photo) : null), [values.photo]);
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function update<K extends Field>(field: K, value: ReportValues[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (status === "failed") setStatus("editing");
  }

  const leave = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTriedToSend(true);
    if (errorList.length > 0) {
      document.getElementById(errorList[0])?.focus();
      return;
    }

    setStatus("sending");
    try {
      // Upload the photo first (if there is one), so the sighting can point to it.
      let photoPath: string | null = null;
      if (values.photo) {
        const extension = values.photo.type.split("/")[1];
        photoPath = `${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from(PHOTO_BUCKET).upload(photoPath, values.photo);
        if (upload.error) throw upload.error;
      }

      const { error } = await supabase.from("reported_sightings").insert({
        sighted_at: new Date(`${values.date}T${values.time}`).toISOString(),
        location: values.location,
        species: values.species,
        notes: values.notes.trim() || null,
        photo_path: photoPath,
      });
      if (error) throw error;

      setSentReport(values);
      setStatus("sent");
    } catch (err) {
      console.error("Failed to send report", err);
      setStatus("failed");
    }
  }

  function startAgain() {
    setValues(emptyForm(null));
    setTouched({});
    setTriedToSend(false);
    setSentReport(null);
    setFileInputKey((k) => k + 1);
    setStatus("editing");
  }

  if (status === "sent" && sentReport) {
    return (
      <div role="status" className="rounded-lg border border-green-700/50 bg-green-700/10 p-4">
        <h2 className="font-semibold">Thank you, your sighting has been sent</h2>
        <p className="mt-2 text-sm">
          {sentReport.species === "Not sure" ? "A tick" : `A ${sentReport.species.toLowerCase()}`} in{" "}
          {sentReport.location} on{" "}
          {new Date(`${sentReport.date}T${sentReport.time}`).toLocaleString("en-GB", {
            dateStyle: "long",
            timeStyle: "short",
          })}
          {sentReport.photo && ", with a photo"}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={startAgain}
            className="rounded border border-current/30 px-3 py-1.5 hover:bg-current/10"
          >
            Report another sighting
          </button>
          <Link
            href={`/?city=${encodeURIComponent(sentReport.location)}`}
            className="rounded border border-current/30 px-3 py-1.5 hover:bg-current/10"
          >
            See {sentReport.location} on the map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {triedToSend && errorList.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-700/50 bg-red-700/10 p-4 text-sm">
          <p className="font-semibold">Please fix {errorList.length === 1 ? "this" : "these"} before sending:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorList.map((f) => (
              <li key={f}>
                <a href={`#${f}`} className="underline">
                  {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField field="date" label="Date seen" error={showError("date")} warning={warnings.date}>
          <input
            id="date"
            type="date"
            max={todayString()}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            onBlur={leave("date")}
            {...fieldProps("date", showError("date"), warnings.date)}
          />
        </FormField>

        <FormField field="time" label="Time seen" hint="Roughly is fine." error={showError("time")}>
          <input
            id="time"
            type="time"
            value={values.time}
            onChange={(e) => update("time", e.target.value)}
            onBlur={leave("time")}
            {...fieldProps("time", showError("time"))}
          />
        </FormField>
      </div>

      <FormField field="location" label="Nearest city" error={showError("location")}>
        <select
          id="location"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          onBlur={leave("location")}
          {...fieldProps("location", showError("location"))}
        >
          <option value="">Choose a city</option>
          {CITY_OPTIONS.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </FormField>

      <FormField
        field="species"
        label="Species"
        hint={
          <>
            Not sure? See the{" "}
            <Link href="/learn#species" className="underline" target="_blank">
              species guide
            </Link>{" "}
            or choose &ldquo;Not sure&rdquo;.
          </>
        }
        error={showError("species")}
        warning={warnings.species}
      >
        <select
          id="species"
          value={values.species}
          onChange={(e) => update("species", e.target.value)}
          onBlur={leave("species")}
          {...fieldProps("species", showError("species"), warnings.species)}
        >
          <option value="">Choose a species</option>
          {SPECIES_OPTIONS.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </FormField>

      <FormField
        field="notes"
        label="Notes (optional)"
        hint={`Where exactly, what you were doing, or whether it bit a person or pet. ${values.notes.length}/${MAX_NOTES_LENGTH} characters.`}
        error={showError("notes")}
      >
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          onBlur={leave("notes")}
          {...fieldProps("notes", showError("notes"))}
        />
      </FormField>

      <FormField field="photo" label="Photo (optional)" hint="JPG, PNG or WebP, up to 5 MB." error={showError("photo")}>
        <input
          key={fileInputKey}
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            update("photo", e.target.files?.[0] ?? null);
            setTouched((t) => ({ ...t, photo: true }));
          }}
          {...fieldProps("photo", showError("photo"))}
          className={`${fieldProps("photo", showError("photo")).className} text-sm file:mr-3 file:rounded file:border-0 file:bg-current/10 file:px-3 file:py-1`}
        />
        {photoPreview && !errors.photo && (
          // A local preview of the user's own file, so next/image isn't needed.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="Preview of your photo" className="mt-2 max-h-48 rounded border border-current/20" />
        )}
      </FormField>

      {status === "failed" && (
        <p role="alert" className="rounded-lg border border-red-700/50 bg-red-700/10 p-4 text-sm">
          Sorry, we couldn&apos;t send your sighting. Please check your internet connection and try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send sighting"}
      </button>
    </form>
  );
}

// Shared attributes that link an input to its error/warning text for screen readers
// and colour its border to match.
function fieldProps(field: Field, error?: string | false, warning?: string) {
  const border = error ? "border-red-600" : warning ? "border-amber-500" : "border-current/30";
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": `${field}-hint ${field}-message`,
    className: `${inputClass} ${border}`,
  };
}

function FormField({
  field,
  label,
  hint,
  error,
  warning,
  children,
}: {
  field: Field;
  label: string;
  hint?: React.ReactNode;
  error?: string | false;
  warning?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={field} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${field}-hint`} className="mt-1 text-xs opacity-70">
          {hint}
        </p>
      )}
      <p id={`${field}-message`} aria-live="polite" className="text-sm">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          warning && <span className="text-amber-600">⚠ {warning}</span>
        )}
      </p>
    </div>
  );
}
