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

create table if not exists price_auto_settings (
  id text primary key default 'default' check (id = 'default'),
  is_enabled boolean not null default false,
  source text not null default 'gold-api' check (source in ('gold-api', 'metals-dev')),
  interval_hours integer not null default 2 check (interval_hours in (1, 2)),
  check_interval_minutes integer not null default 60 check (check_interval_minutes in (30, 60, 120)),
  mode text not null default 'manual_review' check (mode in ('manual_review', 'auto_publish')),
  rounding_unit integer not null default 100,
  gold_sell_premium_rate numeric not null default 0.135,
  gold_buy_discount_rate numeric not null default 0.05,
  gold_18k_buy_rate numeric not null default 0.735,
  gold_14k_buy_rate numeric not null default 0.57,
  platinum_sell_premium_rate numeric not null default 0.1,
  platinum_buy_discount_rate numeric not null default 0.1,
  silver_sell_premium_rate numeric not null default 0.08,
  silver_buy_discount_rate numeric not null default 0.11,
  max_auto_change_percent numeric not null default 0.15,
  min_apply_change_won integer not null default 500,
  max_auto_publish_change_percent numeric not null default 0.05,
  business_hours_only boolean not null default true,
  last_checked_at timestamptz,
  last_auto_applied_at timestamptz,
  updated_by text not null default '관리자',
  updated_at timestamptz not null default now()
);

create table if not exists price_auto_suggestions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'applied', 'rejected', 'expired')),
  source text not null check (source in ('gold-api', 'metals-dev', 'mock')),
  provider_label text not null,
  source_updated_at timestamptz not null,
  generated_at timestamptz not null default now(),
  settings_snapshot jsonb not null,
  items jsonb not null,
  warnings text[] not null default '{}',
  applied_at timestamptz,
  applied_by text
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
  subcategory text,
  name text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  image_url text,
  specs text[] not null default '{}',
  status text not null default 'inquiry_required' check (status in ('active', 'inquiry_required', 'hidden')),
  display_order integer not null default 100,
  is_featured boolean not null default false,
  price_visible boolean not null default false,
  price_basis text not null default 'inquiry',
  weight_grams numeric,
  making_fee integer,
  manual_price integer,
  price_label text not null default '전화 문의',
  price_note text,
  public_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products add column if not exists subcategory text;
alter table products add column if not exists short_description text not null default '';
alter table products add column if not exists description text not null default '';
alter table products add column if not exists image_url text;
alter table products add column if not exists specs text[] not null default '{}';
alter table products add column if not exists status text;
alter table products add column if not exists display_order integer not null default 100;
alter table products add column if not exists is_featured boolean not null default false;
alter table products add column if not exists price_visible boolean not null default false;
alter table products add column if not exists price_basis text not null default 'inquiry';
alter table products add column if not exists weight_grams numeric;
alter table products add column if not exists making_fee integer;
alter table products add column if not exists manual_price integer;
alter table products add column if not exists price_label text not null default '전화 문의';
alter table products add column if not exists price_note text;
alter table products add column if not exists public_note text;
alter table products add column if not exists created_at timestamptz not null default now();
alter table products add column if not exists updated_at timestamptz not null default now();

alter table price_auto_settings add column if not exists check_interval_minutes integer not null default 60;
alter table price_auto_settings add column if not exists min_apply_change_won integer not null default 500;
alter table price_auto_settings add column if not exists max_auto_publish_change_percent numeric not null default 0.05;
alter table price_auto_settings add column if not exists business_hours_only boolean not null default true;
alter table price_auto_settings add column if not exists last_checked_at timestamptz;
alter table price_auto_settings add column if not exists last_auto_applied_at timestamptz;

alter table price_auto_settings drop constraint if exists price_auto_settings_mode_check;
update price_auto_settings
set mode = case
  when mode = 'emergency_publish' then 'auto_publish'
  when mode = 'draft' then 'manual_review'
  else mode
end
where mode in ('draft', 'emergency_publish');
alter table price_auto_settings alter column mode set default 'manual_review';
alter table price_auto_settings add constraint price_auto_settings_mode_check check (mode in ('manual_review', 'auto_publish'));

alter table price_auto_settings drop constraint if exists price_auto_settings_check_interval_minutes_check;
update price_auto_settings
set check_interval_minutes = case
  when check_interval_minutes = 30 then 30
  when check_interval_minutes = 120 then 120
  when interval_hours = 2 then 120
  else 60
end;
alter table price_auto_settings add constraint price_auto_settings_check_interval_minutes_check check (check_interval_minutes in (30, 60, 120));

alter table products drop constraint if exists products_status_check;

update products
set status = case
  when status in ('active', 'inquiry_required', 'hidden') then status
  when status in ('published', 'available') then 'active'
  when status in ('draft', 'archived', 'inactive') then 'hidden'
  else 'inquiry_required'
end
where status is null or status not in ('active', 'inquiry_required', 'hidden');

alter table products alter column status set default 'inquiry_required';
alter table products alter column status set not null;
alter table products add constraint products_status_check check (status in ('active', 'inquiry_required', 'hidden'));

create index if not exists idx_prices_display_order on prices(display_order);
create index if not exists idx_price_history_changed_at on price_history(changed_at desc);
create index if not exists idx_price_auto_suggestions_generated_at on price_auto_suggestions(generated_at desc);
create index if not exists idx_price_auto_suggestions_status on price_auto_suggestions(status);
create index if not exists idx_announcements_published_at on announcements(published_at desc);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_display_order on products(display_order);

insert into price_auto_settings (id)
values ('default')
on conflict (id) do nothing;
