-- RLS politikaları yeterli değildir; rolün tabloya temel erişim izni de
-- (GRANT) olmalıdır. "permission denied for table products" hatasının düzeltmesi.

grant usage on schema public to anon, authenticated;

grant select on public.products to anon, authenticated;
grant select on public.warehouses to anon, authenticated;
grant select on public.locations to anon, authenticated;
grant select on public.stock_levels to anon, authenticated;

grant select on public.stock_movements to authenticated;
grant select on public.correction_requests to authenticated;
grant select on public.users to authenticated;
