import { createClient } from "@supabase/supabase-js";

// Connects to my Supabase database, using the address and key in .env.local.
// The key is safe to be public: the database's security rules
// (supabase/setup.sql) only let visitors add and read sightings.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// If someone runs the project without a .env.local file, there's no database
// to connect to. The report form checks this and shows a message instead of crashing.
export const supabase = url && key ? createClient(url, key) : null;
