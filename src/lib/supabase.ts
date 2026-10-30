import { createClient } from "@supabase/supabase-js";

// Connects to my Supabase database, using the address and key in .env.local.
// The key is safe to be public: the database's security rules
// (supabase/setup.sql) only let visitors add and read sightings.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
