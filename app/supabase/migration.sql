-- ============================================================
-- GeoMind MVP - Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Places table ─────────────────────────────────────────────────────────
create table if not exists places (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          varchar(255) not null,
  latitude      double precision not null,
  longitude     double precision not null,
  is_visited    boolean default false,
  price_level   varchar(10) default 'free' check (price_level in ('free', '$', '$$', '$$$', '$$$$')),
  notes_markdown text default '',
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table places enable row level security;

-- Users can only see/edit their own places
create policy "Users can view their own places"
  on places for select
  using (auth.uid() = user_id);

create policy "Users can insert their own places"
  on places for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own places"
  on places for update
  using (auth.uid() = user_id);

create policy "Users can delete their own places"
  on places for delete
  using (auth.uid() = user_id);

-- ── Index for geospatial queries ──────────────────────────────────────────
create index if not exists places_user_id_idx on places(user_id);
create index if not exists places_location_idx on places(latitude, longitude);
