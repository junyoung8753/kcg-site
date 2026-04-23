create extension if not exists pgcrypto;

create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  label text not null,
  value integer not null,
  unit text not null default '3.75g',
  announced_at timestamptz not null,
  note text,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  price_id uuid not null references prices(id) on delete cascade,
  category text not null,
  label text not null,
  previous_value integer not null,
  new_value integer not null,
  changed_at timestamptz not null default now(),
  changed_by text not null,
  note text
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null,
  is_pinned boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  image_url text,
  status text not null default 'coming_soon' check (status in ('active', 'coming_soon', 'hidden')),
  price_visible boolean not null default false,
  price_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prices_display_order on prices(display_order);
create index if not exists idx_price_history_changed_at on price_history(changed_at desc);
create index if not exists idx_announcements_published_at on announcements(published_at desc);
create index if not exists idx_products_category on products(category);
