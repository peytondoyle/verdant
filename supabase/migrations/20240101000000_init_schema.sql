-- Create custom types
create type public.plant_type as enum ('Perennial', 'Annual', 'Edible');
create type public.task_kind as enum ('water', 'prune', 'harvest', 'other');

-- Beds table
create table public.beds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  base_image_url text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.beds enable row level security;

-- Plants table
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid references public.beds(id) not null,
  name text not null,
  type public.plant_type not null,
  planted_on date,
  sprite_url text,
  z_layer integer not null default 0,
  x real not null,
  y real not null,
  notes text,
  photo_count integer not null default 0,
  deleted_at timestamptz
);
alter table public.plants enable row level security;

-- Tasks table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid references public.beds(id),
  plant_id uuid references public.plants(id),
  kind public.task_kind not null,
  due_on date not null,
  repeat_rule text, -- iCal RRULE format
  completed_on timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint check_bed_or_plant check (bed_id is not null or plant_id is not null)
);
alter table public.tasks enable row level security;

-- Monthly partitioned table for plant photos
create table public.plant_photos (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references public.plants(id) not null,
  captured_on timestamptz not null,
  image_url text not null,
  notes text
) partition by range (captured_on);
alter table public.plant_photos enable row level security;

-- Monthly partitioned table for bed photos
create table public.bed_photos (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid references public.beds(id) not null,
  captured_on timestamptz not null,
  image_url text not null,
  notes text
) partition by range (captured_on);
alter table public.bed_photos enable row level security;

-- Function and trigger to update plant photo count
create function public.increment_plant_photo_count()
returns trigger as $$
begin
  update public.plants
  set photo_count = photo_count + 1
  where id = new.plant_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_plant_photo_insert
  after insert on public.plant_photos
  for each row execute procedure public.increment_plant_photo_count();

create function public.decrement_plant_photo_count()
returns trigger as $$
begin
  update public.plants
  set photo_count = photo_count - 1
  where id = old.plant_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_plant_photo_delete
  after delete on public.plant_photos
  for each row execute procedure public.decrement_plant_photo_count();
