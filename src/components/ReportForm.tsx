"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { CITY_OPTIONS, MAX_NOTES_LENGTH, SPECIES_OPTIONS, checkReport, today, type Report } from "@/lib/report";
import { supabase } from "@/lib/supabase";

export default function ReportForm() {
  // If the user came from a city's "Report" button (e.g. /report?city=Leeds),
  // start with that city chosen.
  const cityFromLink = useSearchParams().get("city") || "";

  // One piece of state for each field.
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [location, setLocation] = useState(CITY_OPTIONS.includes(cityFromLink) ? cityFromLink : "");
  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // "editing" → "sending" → "sent" (or "failed" if something went wrong)
  const [status, setStatus] = useState("editing");
  // Errors only show after the user presses Send, so they aren't told off while typing.
  const [triedToSend, setTriedToSend] = useState(false);

  const report: Report = { date, time, location, species, notes, photo };
  const { errors, warnings } = checkReport(report);
  const errorMessages = Object.values(errors);
  const show = triedToSend ? errors : {};

  function choosePhoto(file: File | null) {
    setPhoto(file);
    // A temporary link to the file on the user's computer, used for the preview.
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // stop the browser reloading the page
    setTriedToSend(true);
    if (errorMessages.length > 0 || !supabase) return;

    setStatus("sending");
    try {
      // 1. Upload the photo (if there is one) with a random name,
      //    so two photos called "tick.jpg" don't overwrite each other.
      let photoPath = null;
      if (photo) {
        const extension = photo.type.split("/")[1]; // "image/png" → "png"
        photoPath = `${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from("sighting-photos").upload(photoPath, photo);
        if (upload.error) throw upload.error;
      }

      // 2. Save the sighting as a new row in the database.
      const { error } = await supabase.from("reported_sightings").insert({
        sighted_at: new Date(`${date}T${time}`).toISOString(),
        location,
        species,
        notes: notes.trim() || null,
        photo_path: photoPath,
      });
      if (error) throw error;

      setStatus("sent");
    } catch (err) {
      console.error("Failed to send report", err);
      setStatus("failed");
    }
  }

  function startAgain() {
    setDate(today());
    setTime("");
    setLocation("");
    setSpecies("");
    setNotes("");
    choosePhoto(null);
    setTriedToSend(false);
    setStatus("editing");
  }

  // No database connected (e.g. someone ran the project without a .env.local file)
  if (!supabase) {
    return (
      <p role="alert" className="rounded-lg border border-amber-600/50 bg-amber-600/10 p-4 text-sm">
        Reporting isn&apos;t set up on this copy of the site yet. To turn it on, add Supabase keys to a
        .env.local file (see the README).
      </p>
    );
  }

  // Success message
  if (status === "sent") {
    const when = new Date(`${date}T${time}`).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
    return (
      <div role="status" className="rounded-lg border border-green-700/50 bg-green-700/10 p-4">
        <h2 className="font-semibold">Thank you, your sighting has been sent</h2>
        <p className="mt-2 text-sm">
          {species === "Not sure" ? "A tick" : `A ${species.toLowerCase()}`} in {location} on {when}
          {photo && ", with a photo"}.
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
            href={`/?city=${encodeURIComponent(location)}`}
            className="rounded border border-current/30 px-3 py-1.5 hover:bg-current/10"
          >
            See {location} on the map
          </Link>
        </div>
      </div>
    );
  }

  // The form
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {triedToSend && errorMessages.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-700/50 bg-red-700/10 p-4 text-sm">
          <p className="font-semibold">Please fix these before sending:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="date" label="Date seen" error={show.date} warning={warnings.date}>
          <input
            id="date"
            type="date"
            max={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass(show.date, warnings.date)}
          />
        </Field>

        <Field id="time" label="Time seen" hint="Roughly is fine." error={show.time}>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass(show.time)}
          />
        </Field>
      </div>

      <Field id="location" label="Nearest city" error={show.location}>
        <select
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass(show.location)}
        >
          <option value="">Choose a city</option>
          {CITY_OPTIONS.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </Field>

      <Field
        id="species"
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
        error={show.species}
        warning={warnings.species}
      >
        <select
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className={inputClass(show.species, warnings.species)}
        >
          <option value="">Choose a species</option>
          {SPECIES_OPTIONS.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </Field>

      <Field
        id="notes"
        label="Notes (optional)"
        hint={`Where exactly, what you were doing, or whether it bit a person or pet. ${notes.length}/${MAX_NOTES_LENGTH} characters.`}
        error={show.notes}
      >
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass(show.notes)}
        />
      </Field>

      <Field id="photo" label="Photo (optional)" hint="JPG, PNG or WebP, up to 5 MB." error={errors.photo}>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => choosePhoto(e.target.files?.[0] || null)}
          className={`${inputClass(errors.photo)} text-sm file:mr-3 file:rounded file:border-0 file:bg-current/10 file:px-3 file:py-1`}
        />
        {photoPreview && !errors.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="Preview of your photo" className="mt-2 max-h-48 rounded border border-current/20" />
        )}
      </Field>

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

// Red border for an error, orange for a warning, grey otherwise.
function inputClass(error?: string, warning?: string) {
  let border = "border-current/30";
  if (error) border = "border-red-600";
  else if (warning) border = "border-amber-500";
  return `mt-1 block w-full rounded border bg-transparent p-1.5 ${border}`;
}

// A label, the input itself, an optional hint, and an error or warning message underneath.
function Field(props: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  warning?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium">
        {props.label}
      </label>
      {props.children}
      {props.hint && <p className="mt-1 text-xs opacity-70">{props.hint}</p>}
      {props.error && <p className="text-sm text-red-600">{props.error}</p>}
      {!props.error && props.warning && <p className="text-sm text-amber-600">⚠ {props.warning}</p>}
    </div>
  );
}
