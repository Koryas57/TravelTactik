-- TravelTactik: leads table (Neon Postgres)
-- Run this once in Neon (SQL Editor) or via your migration system.

create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  notes text not null default '',
  pack text not null check (pack in ('audit','itinerary','concierge')),
  speed text not null check (speed in ('standard','urgent')),
  price_eur int not null check (price_eur >= 0),
  brief jsonb not null,
  selected_plan text null check (selected_plan in ('eco','comfort','premium')),
  client_created_at timestamptz not null,
  user_agent text null,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_email_idx on leads (email);
