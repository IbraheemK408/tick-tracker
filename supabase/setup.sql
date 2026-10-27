-- Database setup for UK Tick Tracker.
-- Run this once in the Supabase SQL Editor to create everything the
-- report form needs.

-- 1. Table for sightings reported through the website.
create table public.reported_sightings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sighted_at timestamptz not null,
  location text not null check (location in (
    'Birmingham', 'Bristol', 'Cardiff', 'Edinburgh', 'Glasgow', 'Leeds', 'Leicester',
    'Liverpool', 'London', 'Manchester', 'Newcastle', 'Nottingham', 'Sheffield', 'Southampton'
  )),
  species text not null check (species in (
    'Fox/badger tick', 'Passerine tick', 'Tree-hole tick', 'Southern rodent tick', 'Marsh tick', 'Not sure'
  )),
  notes text check (char_length(notes) <= 500),
  photo_path text
);

-- 2. Row Level Security: block everything, then allow only what the site needs.
-- Visitors can add a sighting and read sightings, but never change or delete them.
alter table public.reported_sightings enable row level security;

create policy "Anyone can report a sighting"
  on public.reported_sightings for insert
  to anon
  with check (true);

create policy "Anyone can read reported sightings"
  on public.reported_sightings for select
  to anon
  using (true);

-- 3. Storage bucket for tick photos: images only, up to 5 MB each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sighting-photos', 'sighting-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Anyone can upload a sighting photo"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'sighting-photos');
