-- =====================================================================
--  RID ACCE — Orders (cash on delivery)
--  Run AFTER schema.sql. Deployed on project rid.acce on 2026-11-07.
--
--  Visitors never touch public.orders directly: they can only call
--  public.place_order(), which validates everything, limits spam and
--  recomputes every price from public.products. Only admins can read /
--  update / delete orders.
--  Note: Supabase's linter flags place_order as "callable by anon" —
--  that is intentional (it is the shop's only way to create an order).
-- =====================================================================
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique,
  status        text not null default 'new'
                check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone         text not null check (phone ~ '^(\+212[5-7][0-9]{8}|0[5-7][0-9]{8})$'),
  city          text not null check (char_length(city) between 2 and 80),
  address       text not null check (char_length(address) between 5 and 300),
  note          text check (note is null or char_length(note) <= 500),
  lang          text not null default 'ar' check (lang in ('ar', 'fr', 'en')),
  items         jsonb not null,
  gift          jsonb,
  subtotal      numeric(12, 2) not null check (subtotal >= 0),
  wrap_price    numeric(12, 2) not null default 0 check (wrap_price >= 0),
  total         numeric(12, 2) not null check (total >= 0),
  consent       boolean not null default false,
  ip_hash       text,          -- md5 of the connection address, only used for anti-spam
  admin_note    text check (admin_note is null or char_length(admin_note) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx   on public.orders (phone, created_at);
create index if not exists orders_ip_idx      on public.orders (ip_hash, created_at);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders
  for select to authenticated using ((select private.is_admin()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders" on public.orders
  for delete to authenticated using ((select private.is_admin()));
-- (no INSERT policy: orders are only created through place_order)

-- ---------------------------------------------------------------------
-- place_order(customer, items, gift) → {ref, total}
-- ---------------------------------------------------------------------
create or replace function public.place_order(customer jsonb, items jsonb, gift jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name    text := btrim(coalesce(customer ->> 'name', ''));
  v_phone   text := regexp_replace(coalesce(customer ->> 'phone', ''), '[\s.()-]', '', 'g');
  v_city    text := btrim(coalesce(customer ->> 'city', ''));
  v_address text := btrim(coalesce(customer ->> 'address', ''));
  v_note    text := nullif(btrim(coalesce(customer ->> 'note', '')), '');
  v_lang    text := coalesce(customer ->> 'lang', 'ar');
  v_consent boolean := coalesce(customer ->> 'consent', 'false') = 'true';
  v_ip      text;
  v_ip_hash text;
  v_lines   jsonb := '[]'::jsonb;
  v_sub     numeric := 0;
  v_wrap    numeric := 0;
  v_gift    jsonb := null;
  v_ref     text;
  it        jsonb;
  p         record;
  v         jsonb;
  v_qty     int;
  v_price   numeric;
  v_size    text;
begin
  -- bots fill the hidden "website" field
  if coalesce(customer ->> 'website', '') <> '' then raise exception 'invalid_order'; end if;

  if char_length(v_name) not between 2 and 100 then raise exception 'invalid_name'; end if;
  if v_phone like '00212%' then v_phone := '+212' || substr(v_phone, 6); end if;
  if v_phone !~ '^(\+212[5-7][0-9]{8}|0[5-7][0-9]{8})$' then raise exception 'invalid_phone'; end if;
  if char_length(v_city) not between 2 and 80 then raise exception 'invalid_city'; end if;
  if char_length(v_address) not between 5 and 300 then raise exception 'invalid_address'; end if;
  if v_note is not null and char_length(v_note) > 500 then v_note := left(v_note, 500); end if;
  if v_lang not in ('ar', 'fr', 'en') then v_lang := 'ar'; end if;
  if not v_consent then raise exception 'consent_required'; end if;
  if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) not between 1 and 20 then
    raise exception 'invalid_items';
  end if;

  -- anti-spam: max 3 orders per phone and 6 per connection every 30 minutes
  v_ip := btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
  v_ip_hash := case when v_ip <> '' then md5('ridacce:' || v_ip) end;
  if (select count(*) from public.orders o where o.phone = v_phone and o.created_at > now() - interval '30 minutes') >= 3 then
    raise exception 'too_many_orders';
  end if;
  if v_ip_hash is not null and
     (select count(*) from public.orders o where o.ip_hash = v_ip_hash and o.created_at > now() - interval '30 minutes') >= 6 then
    raise exception 'too_many_orders';
  end if;

  -- prices always come from the catalogue, never from the browser
  for it in select value from jsonb_array_elements(items) loop
    select pr.id, pr.brand, pr.name, pr.price, pr.variants, pr.chain
      into p from public.products pr
      where pr.id = it ->> 'pid' and pr.active;
    if not found then raise exception 'product_unavailable'; end if;

    if jsonb_typeof(it -> 'qty') is distinct from 'number' then raise exception 'invalid_items'; end if;
    v_qty := (it ->> 'qty')::int;
    if v_qty not between 1 and 10 then raise exception 'invalid_items'; end if;

    v := null;
    if jsonb_array_length(p.variants) > 0 then
      if nullif(it ->> 'variant', '') is not null then
        select e into v from jsonb_array_elements(p.variants) e where e ->> 'key' = it ->> 'variant' limit 1;
        if v is null then raise exception 'invalid_option'; end if;
      else
        v := p.variants -> 0;
      end if;
    end if;
    v_price := coalesce((v ->> 'price')::numeric, p.price);

    v_size := nullif(it ->> 'size', '');
    if v_size is not null and not (p.chain ? v_size) then raise exception 'invalid_option'; end if;

    v_lines := v_lines || jsonb_build_object(
      'pid', p.id, 'brand', p.brand, 'name', p.name ->> 'en', 'name_ar', p.name ->> 'ar',
      'variant', v ->> 'key', 'variant_name', v -> 'name' ->> 'en',
      'size', v_size, 'qty', v_qty, 'unit_price', v_price, 'line_total', v_price * v_qty);
    v_sub := v_sub + v_price * v_qty;
  end loop;

  if gift is not null and coalesce(gift ->> 'on', 'false') = 'true' then
    v_wrap := case when gift ->> 'wrap' = 'coffret' then 500 else 0 end;
    v_gift := jsonb_build_object(
      'wrap', case when gift ->> 'wrap' = 'coffret' then 'coffret' else 'signature' end,
      'message', left(coalesce(gift ->> 'msg', ''), 200),
      'hide_prices', coalesce(gift ->> 'hide', 'false') = 'true');
  end if;

  v_ref := 'RA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (ref, customer_name, phone, city, address, note, lang, items, gift,
                             subtotal, wrap_price, total, consent, ip_hash)
  values (v_ref, v_name, v_phone, v_city, v_address, v_note, v_lang, v_lines, v_gift,
          v_sub, v_wrap, v_sub + v_wrap, v_consent, v_ip_hash);

  return jsonb_build_object('ref', v_ref, 'total', v_sub + v_wrap);
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb, jsonb) to anon, authenticated;
