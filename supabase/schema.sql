-- CarCare — Supabase schema
-- Safe to re-run the WHOLE file anytime (every statement is idempotent) —
-- just paste the entire file into Supabase SQL Editor and hit Run. When the
-- schema grows, add new statements at the bottom following the same pattern
-- (create table if not exists, drop policy if exists + create policy, etc).

-- ============ PHASE 1: cars, owner notes, booking blocks ============

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year integer not null,
  category text not null check (category in ('sedan','suv','sport','premium')),
  engine text not null,
  gearbox text not null,
  fuel text not null,
  seats integer not null default 5,
  price_1day numeric not null,
  price_multiday numeric not null,
  image_url text,
  featured boolean not null default false,
  popularity integer not null default 50,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists cars_name_key on public.cars(name);

create table if not exists public.car_owner_notes (
  car_id uuid primary key references public.cars(id) on delete cascade,
  owner_name text,
  owner_phone text,
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_blocks (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.cars enable row level security;
alter table public.car_owner_notes enable row level security;
alter table public.booking_blocks enable row level security;

-- cars: public reads (site needs it), only logged-in admin writes
drop policy if exists "cars_select_public" on public.cars;
create policy "cars_select_public" on public.cars for select using (true);
drop policy if exists "cars_insert_auth" on public.cars;
create policy "cars_insert_auth" on public.cars for insert to authenticated with check (true);
drop policy if exists "cars_update_auth" on public.cars;
create policy "cars_update_auth" on public.cars for update to authenticated using (true) with check (true);
drop policy if exists "cars_delete_auth" on public.cars;
create policy "cars_delete_auth" on public.cars for delete to authenticated using (true);

-- car_owner_notes: admin-only, never public (owner name/phone)
drop policy if exists "owner_notes_select_auth" on public.car_owner_notes;
create policy "owner_notes_select_auth" on public.car_owner_notes for select to authenticated using (true);
drop policy if exists "owner_notes_insert_auth" on public.car_owner_notes;
create policy "owner_notes_insert_auth" on public.car_owner_notes for insert to authenticated with check (true);
drop policy if exists "owner_notes_update_auth" on public.car_owner_notes;
create policy "owner_notes_update_auth" on public.car_owner_notes for update to authenticated using (true) with check (true);
drop policy if exists "owner_notes_delete_auth" on public.car_owner_notes;
create policy "owner_notes_delete_auth" on public.car_owner_notes for delete to authenticated using (true);

-- booking_blocks: public reads (calendar needs it), only admin writes
drop policy if exists "booking_select_public" on public.booking_blocks;
create policy "booking_select_public" on public.booking_blocks for select using (true);
drop policy if exists "booking_insert_auth" on public.booking_blocks;
create policy "booking_insert_auth" on public.booking_blocks for insert to authenticated with check (true);
drop policy if exists "booking_update_auth" on public.booking_blocks;
create policy "booking_update_auth" on public.booking_blocks for update to authenticated using (true) with check (true);
drop policy if exists "booking_delete_auth" on public.booking_blocks;
create policy "booking_delete_auth" on public.booking_blocks for delete to authenticated using (true);

-- ============ PHASE 1 SEED DATA ============
-- The 8 cars that used to be hardcoded in js/main.js. engine specs are placeholders —
-- edit them for real from the admin panel. on conflict(name) do nothing = safe to re-run.

insert into public.cars (name, year, category, engine, gearbox, fuel, seats, price_1day, price_multiday, image_url, featured, popularity) values
('BMW 3 Series', 2022, 'sedan', '2.0 TwinPower Turbo', 'ავტომატი', 'ბენზინი', 5, 180, 140, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70', false, 80),
('Tesla Model 3', 2023, 'sedan', 'Long Range Dual Motor', 'ავტომატი', 'ელექტრო', 5, 210, 170, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=70', true, 98),
('Honda CR-V', 2022, 'suv', '1.5 VTEC Turbo Hybrid', 'ავტომატი', 'ჰიბრიდი', 5, 190, 150, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=70', false, 75),
('Ford Expedition', 2022, 'suv', '3.5 EcoBoost V6', 'ავტომატი', 'ბენზინი', 7, 260, 220, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=70', false, 60),
('Porsche 911 Turbo', 2022, 'sport', '3.8 Twin-Turbo Flat-6', 'ავტომატი', 'ბენზინი', 2, 500, 450, 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=70', true, 92),
('Ford Mustang GT', 2021, 'sport', '5.0 V8', 'ავტომატი', 'ბენზინი', 4, 320, 280, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=70', false, 70),
('Mercedes-Benz CLA', 2022, 'premium', '2.0 Turbo', 'ავტომატი', 'ბენზინი', 5, 230, 190, 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=800&q=70', false, 65),
('Mercedes-AMG GT', 2021, 'premium', '4.0 Biturbo V8', 'ავტომატი', 'ბენზინი', 2, 450, 400, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=70', false, 84)
on conflict (name) do nothing;

-- ============ PHASE 2: categories + site-wide editable text ============

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_ka text not null,
  label_en text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_texts (
  key text primary key,
  value_ka text not null,
  value_en text not null,
  section text not null default 'other',
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.site_texts enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories for select using (true);
drop policy if exists "categories_insert_auth" on public.categories;
create policy "categories_insert_auth" on public.categories for insert to authenticated with check (true);
drop policy if exists "categories_update_auth" on public.categories;
create policy "categories_update_auth" on public.categories for update to authenticated using (true) with check (true);
drop policy if exists "categories_delete_auth" on public.categories;
create policy "categories_delete_auth" on public.categories for delete to authenticated using (true);

drop policy if exists "site_texts_select_public" on public.site_texts;
create policy "site_texts_select_public" on public.site_texts for select using (true);
drop policy if exists "site_texts_insert_auth" on public.site_texts;
create policy "site_texts_insert_auth" on public.site_texts for insert to authenticated with check (true);
drop policy if exists "site_texts_update_auth" on public.site_texts;
create policy "site_texts_update_auth" on public.site_texts for update to authenticated using (true) with check (true);
drop policy if exists "site_texts_delete_auth" on public.site_texts;
create policy "site_texts_delete_auth" on public.site_texts for delete to authenticated using (true);

-- seed the 4 existing categories, then swap cars.category from a fixed CHECK
-- to a real FK so admin-added categories are actually usable by cars
insert into public.categories (slug, label_ka, label_en, sort_order) values
('sedan', 'სედანი', 'Sedan', 1),
('suv', 'ჯიპი / SUV', 'SUV', 2),
('sport', 'სპორტული', 'Sport', 3),
('premium', 'პრემიუმი', 'Premium', 4)
on conflict (slug) do nothing;

alter table public.cars drop constraint if exists cars_category_check;
alter table public.cars drop constraint if exists cars_category_fkey;
alter table public.cars add constraint cars_category_fkey foreign key (category) references public.categories(slug);
