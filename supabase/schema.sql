-- CarCare — Supabase schema
-- Paste new statements at the bottom when the schema grows; re-run the whole
-- file (or just the new part) in Supabase SQL Editor after every change.

-- ============ PHASE 1: cars, owner notes, booking blocks ============

create table public.cars (
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

create table public.car_owner_notes (
  car_id uuid primary key references public.cars(id) on delete cascade,
  owner_name text,
  owner_phone text,
  note text,
  updated_at timestamptz not null default now()
);

create table public.booking_blocks (
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
create policy "cars_select_public" on public.cars for select using (true);
create policy "cars_insert_auth" on public.cars for insert to authenticated with check (true);
create policy "cars_update_auth" on public.cars for update to authenticated using (true) with check (true);
create policy "cars_delete_auth" on public.cars for delete to authenticated using (true);

-- car_owner_notes: admin-only, never public (owner name/phone)
create policy "owner_notes_select_auth" on public.car_owner_notes for select to authenticated using (true);
create policy "owner_notes_insert_auth" on public.car_owner_notes for insert to authenticated with check (true);
create policy "owner_notes_update_auth" on public.car_owner_notes for update to authenticated using (true) with check (true);
create policy "owner_notes_delete_auth" on public.car_owner_notes for delete to authenticated using (true);

-- booking_blocks: public reads (calendar needs it), only admin writes
create policy "booking_select_public" on public.booking_blocks for select using (true);
create policy "booking_insert_auth" on public.booking_blocks for insert to authenticated with check (true);
create policy "booking_update_auth" on public.booking_blocks for update to authenticated using (true) with check (true);
create policy "booking_delete_auth" on public.booking_blocks for delete to authenticated using (true);

-- ============ PHASE 1 SEED DATA (run once — re-running duplicates rows) ============
-- The 8 cars that used to be hardcoded in js/main.js. engine specs are placeholders —
-- edit them for real from the admin panel once it's live.

insert into public.cars (name, year, category, engine, gearbox, fuel, seats, price_1day, price_multiday, image_url, featured, popularity) values
('BMW 3 Series', 2022, 'sedan', '2.0 TwinPower Turbo', 'ავტომატი', 'ბენზინი', 5, 180, 140, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70', false, 80),
('Tesla Model 3', 2023, 'sedan', 'Long Range Dual Motor', 'ავტომატი', 'ელექტრო', 5, 210, 170, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=70', true, 98),
('Honda CR-V', 2022, 'suv', '1.5 VTEC Turbo Hybrid', 'ავტომატი', 'ჰიბრიდი', 5, 190, 150, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=70', false, 75),
('Ford Expedition', 2022, 'suv', '3.5 EcoBoost V6', 'ავტომატი', 'ბენზინი', 7, 260, 220, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=70', false, 60),
('Porsche 911 Turbo', 2022, 'sport', '3.8 Twin-Turbo Flat-6', 'ავტომატი', 'ბენზინი', 2, 500, 450, 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=70', true, 92),
('Ford Mustang GT', 2021, 'sport', '5.0 V8', 'ავტომატი', 'ბენზინი', 4, 320, 280, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=70', false, 70),
('Mercedes-Benz CLA', 2022, 'premium', '2.0 Turbo', 'ავტომატი', 'ბენზინი', 5, 230, 190, 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=800&q=70', false, 65),
('Mercedes-AMG GT', 2021, 'premium', '4.0 Biturbo V8', 'ავტომატი', 'ბენზინი', 2, 450, 400, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=70', false, 84);
