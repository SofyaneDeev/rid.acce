-- =====================================================================
--  RID ACCE — Supabase setup
--  Run this ONCE in the Supabase dashboard of the shop's project:
--  SQL Editor → New query → paste everything → Run.
--  It is safe to run again (it only creates what is missing).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Products
--    Texts are stored per language as JSON: {"ar": "...", "fr": "...", "en": "..."}
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,                         -- url-friendly id, e.g. "cartier-baignoire"
  brand       text not null default '',
  name        jsonb not null default '{}'::jsonb,
  cat         text not null default 'Watches'
              check (cat in ('Watches', 'Jewellery', 'Leather goods', 'Eyewear')),
  gender      text not null default 'women'
              check (gender in ('men', 'women', 'unisex')),
  price       numeric(12, 2) not null default 0 check (price >= 0),   -- in MAD (dirhams)
  img         text,                                     -- main photo URL (first photo of first version)
  variants    jsonb not null default '[]'::jsonb,       -- [{key, name{ar,fr,en}, price, swatch, imgs[]}]
  chain       jsonb not null default '[]'::jsonb,       -- e.g. ["40 cm","42 cm","45 cm"]
  sub         jsonb not null default '{}'::jsonb,       -- short subtitle under the name
  description jsonb not null default '{}'::jsonb,
  specs       jsonb not null default '{}'::jsonb,       -- {"en": {"Case": "..."}, "fr": {...}, "ar": {...}}
  occasions   text[] not null default '{}',             -- anniversary, wedding, graduation, justbecause
  limited     jsonb,                                    -- optional "limited edition" label per language
  active      boolean not null default true,            -- false = hidden from the shop
  sort        integer not null default 0,               -- display order (small first)
  updated_at  timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 2. Admins — only these e-mails can change products and photos
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);

-- The admin check lives in a private schema so it is not exposed by the REST API.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Admin = a CONFIRMED account whose e-mail is listed in public.admins (checked against auth.users).
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and u.deleted_at is null
      and coalesce(u.is_anonymous, false) = false
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Row Level Security
--    Visitors: can only READ active products.
--    Admins:   can read, add, edit and delete everything.
-- ---------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products
  for select using (active or (select private.is_admin()));

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products
  for insert to authenticated with check ((select private.is_admin()));

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins can see their own admin row" on public.admins;
create policy "Admins can see their own admin row" on public.admins
  for select using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------------------------------------------------------------------
-- 4. Photo storage (public bucket "product-images")
-- ---------------------------------------------------------------------
-- Images only (no HTML/SVG/scripts), max 5 MB each
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- No SELECT policy: files stay viewable through their public URLs, but nobody can list the bucket.
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));

-- =====================================================================
-- 5. LAST STEP — make yourself admin (change the e-mail, then run):
--
--    insert into public.admins (email) values ('admin@your-shop.ma');
--
--    Then in Authentication → Users → "Add user", create that same e-mail
--    with a strong password (tick "Auto confirm user").
--    And in Authentication → Sign In / Providers, turn OFF "Allow new users
--    to sign up" so nobody else can create an account.
-- =====================================================================
