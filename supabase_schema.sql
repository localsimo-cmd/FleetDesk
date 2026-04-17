-- FleetDesk Supabase Schema
-- This script will recreate the database structure. 
-- WARNING: Running this will delete existing data in these tables.

-- Drop existing tables (in reverse order of dependencies)
drop table if exists service_alerts cascade;
drop table if exists job_parts cascade;
drop table if exists job_cards cascade;
drop table if exists part_catalogue cascade;
drop table if exists vehicles cascade;
drop table if exists profiles cascade;

-- Drop existing triggers and functions that are not used in RLS policies yet
drop trigger if exists tr_generate_job_number on job_cards;
drop function if exists generate_job_number();

-- 1. Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('mechanic', 'manager', 'admin')),
  active boolean default true,
  created_at timestamptz default now()
);

-- 2. Vehicles table
create table vehicles (
  id uuid default gen_random_uuid() primary key,
  registration text not null unique,
  make text not null,
  model text not null,
  year integer not null,
  vin text,
  engine_no text,
  tax_expiry date,
  current_odometer integer not null default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. Part Catalogue table
create table part_catalogue (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  sku text,
  is_service_item boolean default false,
  service_interval_km integer,
  active boolean default true,
  created_at timestamptz default now()
);

-- 4. Job Cards table
create table job_cards (
  id uuid default gen_random_uuid() primary key,
  job_number text not null unique,
  vehicle_id uuid references vehicles(id) not null,
  mechanic_id uuid references profiles(id) not null,
  odometer_at_job integer not null,
  odometer_out integer,
  job_type text not null,
  complaint_details text,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz default now(),
  closed_at timestamptz
);

-- 5. Job Parts table (The accountability measure)
create table job_parts (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references job_cards(id) on delete cascade not null,
  part_id uuid references part_catalogue(id) not null,
  qty_ordered integer not null default 1,
  qty_fitted integer not null default 0,
  fitted boolean default false,
  fit_odometer integer,
  notes text,
  created_at timestamptz default now()
);

-- 6. Service Alerts table
create table service_alerts (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id) not null,
  part_id uuid references part_catalogue(id) not null,
  km_since_fit integer not null,
  threshold_km integer not null,
  status text not null check (status in ('due_soon', 'overdue', 'resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Helper functions for RLS (Security Definer to avoid recursion)
create or replace function is_admin()
returns boolean as $$
begin
  return (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
    or (auth.jwt() ->> 'email' = 'localsimo@gmail.com')
  );
end;
$$ language plpgsql security definer;

create or replace function is_manager()
returns boolean as $$
begin
  return (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('manager', 'admin')
    )
    or (auth.jwt() ->> 'email' = 'localsimo@gmail.com')
  );
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case 
      when new.email = 'localsimo@gmail.com' then 'admin'
      else 'mechanic'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table part_catalogue enable row level security;
alter table job_cards enable row level security;
alter table job_parts enable row level security;
alter table service_alerts enable row level security;

-- RLS Policies
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Admins can manage all profiles" on profiles for all using (is_admin());
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "Vehicles are viewable by everyone" on vehicles for select using (true);
create policy "Managers and admins can manage vehicles" on vehicles for all using (is_manager());

create policy "Catalogue is viewable by everyone" on part_catalogue for select using (true);
create policy "Managers and admins can manage catalogue" on part_catalogue for all using (is_manager());

create policy "Job cards viewable by everyone" on job_cards for select using (true);
create policy "Managers and admins can manage all job cards" on job_cards for all using (is_manager());
create policy "Mechanics can manage own job cards" on job_cards for all using (
  mechanic_id = auth.uid()
);

create policy "Job parts viewable by everyone" on job_parts for select using (true);
create policy "Managers and admins can manage all job parts" on job_parts for all using (is_manager());
create policy "Mechanics can manage parts on their jobs" on job_parts for all using (
  exists (select 1 from job_cards where id = job_id and mechanic_id = auth.uid())
);

create policy "Alerts viewable by everyone" on service_alerts for select using (true);
create policy "Managers and admins can manage alerts" on service_alerts for all using (is_manager());

-- Function to auto-generate job numbers
create or replace function generate_job_number()
returns trigger as $$
declare
  next_val bigint;
begin
  select count(*) + 1 into next_val from job_cards;
  new.job_number := 'JC-' || lpad(next_val::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger tr_generate_job_number
before insert on job_cards
for each row execute function generate_job_number();
