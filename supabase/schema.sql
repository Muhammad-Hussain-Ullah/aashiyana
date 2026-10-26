-- =====================================================================
-- Aashiyana.pk - Supabase schema
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Run this file FIRST, then seed.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type public.user_role         as enum ('student', 'owner', 'admin');
create type public.gender_eligibility as enum ('Women', 'Men', 'All');
create type public.room_type         as enum ('Single', 'Shared', 'Studio');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');
create type public.enquiry_status    as enum ('new', 'contacted', 'closed');

-- ---------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------

-- One row per signed-up user (created automatically by a trigger below)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text,
  university  text,
  city        text,
  phone       text,
  avatar_url  text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.areas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  city        text not null default 'Karachi',
  image_url   text,
  is_popular  boolean not null default false
);

create table public.universities (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table public.hostels (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid default auth.uid() references public.profiles(id) on delete set null,
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null,
  description    text not null,
  gender         public.gender_eligibility not null default 'All',
  address        text not null,
  area_id        uuid not null references public.areas(id),
  university_id  uuid references public.universities(id) on delete set null,
  is_featured    boolean not null default false,
  is_verified    boolean not null default false,
  status         public.moderation_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.hostel_photos (
  id          uuid primary key default gen_random_uuid(),
  hostel_id   uuid not null references public.hostels(id) on delete cascade,
  url         text not null,
  alt_text    text,
  is_cover    boolean not null default false,
  sort_order  integer not null default 0
);

create table public.rooms (
  id           uuid primary key default gen_random_uuid(),
  hostel_id    uuid not null references public.hostels(id) on delete cascade,
  type         public.room_type not null,
  rent         integer not null check (rent > 0),          -- PKR per month
  total        integer not null check (total > 0),
  available    integer not null check (available >= 0),
  description  text not null default '',
  unique (hostel_id, type),
  check (available <= total)
);

create table public.amenities (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  icon  text not null                                      -- lucide icon name
);

create table public.hostel_amenities (
  hostel_id   uuid not null references public.hostels(id)   on delete cascade,
  amenity_id  uuid not null references public.amenities(id) on delete cascade,
  primary key (hostel_id, amenity_id)
);

create table public.hostel_rules (
  id          uuid primary key default gen_random_uuid(),
  hostel_id   uuid not null references public.hostels(id) on delete cascade,
  rule_text   text not null,
  sort_order  integer not null default 0
);

create table public.hostel_tags (
  hostel_id  uuid not null references public.hostels(id) on delete cascade,
  tag        text not null,
  primary key (hostel_id, tag)
);

create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  hostel_id      uuid not null references public.hostels(id) on delete cascade,
  user_id        uuid default auth.uid() references public.profiles(id) on delete set null,
  author_name    text not null,                            -- filled from profile by trigger
  rating         smallint not null check (rating between 1 and 5),
  title          text not null check (char_length(title) between 1 and 120),
  body           text not null check (char_length(body) between 10 and 2000),
  stay_duration  text,                                     -- e.g. 'Stayed 8 months'
  status         public.moderation_status not null default 'approved',
  created_at     timestamptz not null default now(),
  unique (hostel_id, user_id)                              -- one review per user per hostel
);

create table public.favorites (
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  hostel_id  uuid not null references public.hostels(id) on delete cascade,
  saved_at   timestamptz not null default now(),
  primary key (user_id, hostel_id)
);

create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  hostel_id   uuid not null references public.hostels(id) on delete cascade,
  user_id     uuid default auth.uid() references public.profiles(id) on delete set null,
  room_id     uuid references public.rooms(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null check (char_length(message) between 5 and 2000),
  status      public.enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. INDEXES (foreign keys + common filters)
-- ---------------------------------------------------------------------
create index hostels_area_idx       on public.hostels (area_id);
create index hostels_university_idx on public.hostels (university_id);
create index hostels_owner_idx      on public.hostels (owner_id);
create index hostels_status_idx     on public.hostels (status);
create index photos_hostel_idx      on public.hostel_photos (hostel_id);
create index rooms_hostel_idx       on public.rooms (hostel_id);
create index rules_hostel_idx       on public.hostel_rules (hostel_id);
create index reviews_hostel_idx     on public.reviews (hostel_id);
create index reviews_user_idx       on public.reviews (user_id);
create index favorites_hostel_idx   on public.favorites (hostel_id);
create index enquiries_hostel_idx   on public.enquiries (hostel_id);
create index hostel_amenities_amenity_idx on public.hostel_amenities (amenity_id);

-- ---------------------------------------------------------------------
-- 4. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_owner_or_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'admin'));
$$;

create function public.can_manage_hostel(hid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin()
      or exists (select 1 from public.hostels h where h.id = hid and h.owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 5. TRIGGERS
-- ---------------------------------------------------------------------

-- 5a. updated_at
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger hostels_updated_at before update on public.hostels
  for each row execute function public.set_updated_at();

-- 5b. create a profile whenever someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, university, city)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Student'),
    nullif(new.raw_user_meta_data->>'university', ''),
    nullif(new.raw_user_meta_data->>'city', '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5c. reviews: author name always comes from the real profile (no spoofing)
create function public.set_review_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id is not null then
    new.author_name := coalesce(
      (select full_name from public.profiles where id = new.user_id),
      new.author_name,
      'Student'
    );
  end if;
  return new;
end $$;

create trigger reviews_set_author before insert on public.reviews
  for each row execute function public.set_review_author();

-- 5d. hostels: only admins may change status / verified / featured / owner
--     (auth.uid() is null in the SQL editor, so your own SQL is never blocked)
create function public.guard_hostel_admin_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'UPDATE' then
      new.status      := old.status;
      new.is_verified := old.is_verified;
      new.is_featured := old.is_featured;
      new.owner_id    := old.owner_id;
    else
      new.status      := 'pending';
      new.is_verified := false;
      new.is_featured := false;
    end if;
  end if;
  return new;
end $$;

create trigger hostels_guard before insert or update on public.hostels
  for each row execute function public.guard_hostel_admin_fields();

-- ---------------------------------------------------------------------
-- 6. VIEWS (what the listing pages read; RLS still applies to the caller)
-- ---------------------------------------------------------------------
create view public.hostel_summary with (security_invoker = true) as
select
  h.id, h.slug, h.name, h.description, h.gender, h.address,
  h.is_featured, h.is_verified, h.status, h.created_at,
  a.id   as area_id,  a.name as area_name, a.city,
  u.id   as university_id, u.name as university_name,
  (select p.url from public.hostel_photos p
    where p.hostel_id = h.id order by p.is_cover desc, p.sort_order limit 1)       as cover_image_url,
  (select min(r.rent) from public.rooms r where r.hostel_id = h.id)                 as starting_rent,
  coalesce((select round(avg(v.rating)::numeric, 1) from public.reviews v
             where v.hostel_id = h.id and v.status = 'approved'), 0)                as rating,
  (select count(*)::int from public.reviews v
    where v.hostel_id = h.id and v.status = 'approved')                             as review_count,
  coalesce((select array_agg(t.tag order by t.tag) from public.hostel_tags t
             where t.hostel_id = h.id), '{}'::text[])                               as tags,
  coalesce((select array_agg(am.name order by am.name)
              from public.hostel_amenities ha
              join public.amenities am on am.id = ha.amenity_id
             where ha.hostel_id = h.id), '{}'::text[])                              as amenities
from public.hostels h
join public.areas a on a.id = h.area_id
left join public.universities u on u.id = h.university_id;

create view public.area_summary with (security_invoker = true) as
select
  a.id, a.name, a.slug, a.city, a.image_url, a.is_popular,
  (select count(*)::int from public.hostels h
    where h.area_id = a.id and h.status = 'approved') as hostel_count
from public.areas a;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

-- 7a. profiles: you see/edit only yourself (admins see everyone)
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- users may only touch these columns (role / email can never be changed from the app)
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, university, city, avatar_url) on public.profiles to authenticated;

-- 7b. lookup tables: everyone can read, only admins can write
do $$
declare t text;
begin
  foreach t in array array['areas', 'universities', 'amenities'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_read', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', t || '_admin', t);
  end loop;
end $$;

-- 7c. hostels
alter table public.hostels enable row level security;

create policy hostels_read on public.hostels for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy hostels_insert on public.hostels for insert to authenticated
  with check (public.is_owner_or_admin() and (owner_id = auth.uid() or public.is_admin()));
create policy hostels_update on public.hostels for update to authenticated
  using (public.can_manage_hostel(id)) with check (public.can_manage_hostel(id));
create policy hostels_delete on public.hostels for delete to authenticated
  using (public.can_manage_hostel(id));

-- 7d. child tables of a hostel: readable if the hostel is readable, writable by owner/admin
do $$
declare t text;
begin
  foreach t in array array['hostel_photos', 'rooms', 'hostel_amenities', 'hostel_rules', 'hostel_tags'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (exists (select 1 from public.hostels h where h.id = hostel_id))', t || '_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.can_manage_hostel(hostel_id)) with check (public.can_manage_hostel(hostel_id))', t || '_manage', t);
  end loop;
end $$;

-- 7e. reviews: approved ones are public; you can add/delete your own; admins moderate
alter table public.reviews enable row level security;

create policy reviews_read on public.reviews for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy reviews_insert on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and status = 'approved');   -- change to 'pending' for pre-moderation
create policy reviews_delete_own on public.reviews for delete to authenticated
  using (user_id = auth.uid());
create policy reviews_admin on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 7f. favorites: private to each user
alter table public.favorites enable row level security;

create policy favorites_own on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 7g. enquiries: anyone can send one; sender, hostel owner and admins can read
alter table public.enquiries enable row level security;

create policy enquiries_insert on public.enquiries for insert
  with check (user_id is null or user_id = auth.uid());
create policy enquiries_read on public.enquiries for select to authenticated
  using (user_id = auth.uid() or public.can_manage_hostel(hostel_id));
create policy enquiries_update on public.enquiries for update to authenticated
  using (public.can_manage_hostel(hostel_id)) with check (public.can_manage_hostel(hostel_id));

-- ---------------------------------------------------------------------
-- 8. STORAGE BUCKETS (optional for now - mock photos are Unsplash URLs)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('hostel-photos', 'hostel-photos', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "hostel photos: public read" on storage.objects for select
  using (bucket_id = 'hostel-photos');
create policy "hostel photos: owners upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'hostel-photos' and public.is_owner_or_admin());
create policy "hostel photos: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'hostel-photos' and public.is_admin());

create policy "avatars: public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars: own folder" on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
