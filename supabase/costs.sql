-- =====================================================================
--  RID ACCE — Purchase costs & delivery costs (ADMIN ONLY). Deployed 2026-11-08.
--  Kept OUT of public.products on purpose: the shop reads products publicly,
--  so costs/margins live in their own table that visitors cannot read.
-- =====================================================================
create table if not exists public.product_costs (
  product_id    text primary key references public.products(id) on delete cascade on update cascade,
  cost          numeric(12, 2) check (cost is null or cost >= 0),             -- cost of the first version
  variant_costs jsonb not null default '{}'::jsonb check (jsonb_typeof(variant_costs) = 'object'), -- {versionKey: cost}
  delivery_cost numeric(12, 2) check (delivery_cost is null or delivery_cost >= 0),  -- what YOU pay the courier
  updated_at    timestamptz not null default now()
);

drop trigger if exists product_costs_touch on public.product_costs;
create trigger product_costs_touch before update on public.product_costs
  for each row execute function public.touch_updated_at();

alter table public.product_costs enable row level security;
revoke all on public.product_costs from anon, public;
grant select, insert, update, delete on public.product_costs to authenticated;

drop policy if exists "Admins can read costs" on public.product_costs;
create policy "Admins can read costs" on public.product_costs
  for select to authenticated using ((select private.is_admin()));
drop policy if exists "Admins can add costs" on public.product_costs;
create policy "Admins can add costs" on public.product_costs
  for insert to authenticated with check ((select private.is_admin()));
drop policy if exists "Admins can update costs" on public.product_costs;
create policy "Admins can update costs" on public.product_costs
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Admins can delete costs" on public.product_costs;
create policy "Admins can delete costs" on public.product_costs
  for delete to authenticated using ((select private.is_admin()));
