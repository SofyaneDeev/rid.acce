-- =====================================================================
--  RID ACCE — Packs & discounts (run AFTER stock.sql). Deployed 2026-11-08.
--
--  Discounts: each version (variants[].was) may carry the price BEFORE the
--  discount. The real price stays variants[].price, which is what
--  place_order() charges — so a discount can never be faked from the browser.
--
--  Packs: products with cat = 'Packs' and pack = [{pid, qty}, …] listing the
--  pieces inside. Selling a pack also takes its pieces out of stock (when
--  those pieces are counted); cancelling the order puts them back.
-- =====================================================================
alter table public.products drop constraint if exists products_cat_check;
alter table public.products add constraint products_cat_check
  check (cat = any (array['Watches', 'Jewellery', 'Leather goods', 'Eyewear', 'Packs']));

alter table public.products add column if not exists pack jsonb
  check (pack is null or (jsonb_typeof(pack) = 'array' and jsonb_array_length(pack) <= 12));

-- ---------------------------------------------------------------------
-- stock helper: lines = order lines [{pid, qty}, …]; pack pieces included.
--   dir = -1 take, +1 give back; strict = refuse when not enough (orders)
-- ---------------------------------------------------------------------
create or replace function private.apply_stock(lines jsonb, dir int, strict boolean)
returns void
language plpgsql
set search_path = ''
as $$
declare
  s record;
begin
  for s in
    with l as (
      select x ->> 'pid' as pid, greatest(0, coalesce((x ->> 'qty')::int, 0)) as q
      from jsonb_array_elements(coalesce(lines, '[]'::jsonb)) x
    ), d as (
      select pid, q from l
      union all
      select c ->> 'pid', l.q * least(5, greatest(1, coalesce((c ->> 'qty')::int, 1)))
      from l
      join public.products pr on pr.id = l.pid and pr.pack is not null
      cross join lateral jsonb_array_elements(pr.pack) c
    )
    select pid, sum(q)::int as q from d where pid is not null group by pid order by pid
  loop
    if dir > 0 then
      update public.products pr set stock = pr.stock + s.q where pr.id = s.pid and pr.stock is not null;
    elsif strict then
      update public.products pr set stock = pr.stock - s.q
        where pr.id = s.pid and pr.stock is not null and pr.stock >= s.q;
      if not found and exists (select 1 from public.products pr where pr.id = s.pid and pr.stock is not null) then
        raise exception 'out_of_stock';
      end if;
    else
      update public.products pr set stock = greatest(0, pr.stock - s.q) where pr.id = s.pid and pr.stock is not null;
    end if;
  end loop;
end;
$$;
revoke all on function private.apply_stock(jsonb, int, boolean) from public, anon, authenticated;

-- cancelling / un-cancelling an order
create or replace function private.orders_stock_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = old.status then return new; end if;
  if new.status = 'cancelled' then perform private.apply_stock(new.items, 1, false);
  elsif old.status = 'cancelled' then perform private.apply_stock(new.items, -1, false);
  end if;
  return new;
end;
$$;
revoke all on function private.orders_stock_sync() from public, anon, authenticated;

-- place_order: unchanged, except the stock step now uses apply_stock (packs included)
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

  v_ip := btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
  v_ip_hash := case when v_ip <> '' then md5('ridacce:' || v_ip) end;
  if (select count(*) from public.orders o where o.phone = v_phone and o.created_at > now() - interval '30 minutes') >= 3 then
    raise exception 'too_many_orders';
  end if;
  if v_ip_hash is not null and
     (select count(*) from public.orders o where o.ip_hash = v_ip_hash and o.created_at > now() - interval '30 minutes') >= 6 then
    raise exception 'too_many_orders';
  end if;

  for it in select value from jsonb_array_elements(items) loop
    select pr.id, pr.brand, pr.name, pr.price, pr.img, pr.variants, pr.chain
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
      'img', coalesce(v -> 'imgs' ->> 0, p.img),
      'size', v_size, 'qty', v_qty, 'unit_price', v_price, 'line_total', v_price * v_qty);
    v_sub := v_sub + v_price * v_qty;
  end loop;

  -- stock (pieces + pieces inside packs), row-locked: no overselling
  perform private.apply_stock(v_lines, -1, true);

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
