import { createClient } from "@supabase/supabase-js";

// Our own database (Supabase) for sightings reported through the website.
// The publishable key is safe to use in the browser: Row Level Security in
// supabase/setup.sql only lets visitors add and read sightings.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export const PHOTO_BUCKET = "sighting-photos";
