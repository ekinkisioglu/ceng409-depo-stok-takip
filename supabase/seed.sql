-- Sentetik örnek veri (gerçek işletme verisi kullanılmaz — bkz. proje dokümanı Bölüm 3).
-- Çalıştırma: 0001_init.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

insert into public.warehouses (code, name) values
  ('DEPO-A', 'Depo A'),
  ('DEPO-B', 'Depo B')
on conflict (code) do nothing;

insert into public.locations (warehouse_id, code, name)
select w.id, l.code, l.name
from public.warehouses w
join (values
  ('DEPO-A', 'RAF-3', 'Raf 3'),
  ('DEPO-A', 'RAF-4', 'Raf 4'),
  ('DEPO-B', 'RAF-1', 'Raf 1')
) as l(wcode, code, name) on w.code = l.wcode
on conflict (warehouse_id, code) do nothing;

insert into public.products (code, name, unit, critical_level) values
  ('P-1001', 'Vida M6', 'koli', 20),
  ('P-1002', 'Saç Levha 2mm', 'kg', 50),
  ('P-1003', 'Conta Seti', 'adet', 10)
on conflict (code) do nothing;

insert into public.stock_levels (product_id, location_id, quantity)
select p.id, l.id, s.qty
from (values
  ('P-1001', 'RAF-3', 45),
  ('P-1001', 'RAF-1', 12),
  ('P-1002', 'RAF-4', 300),
  ('P-1003', 'RAF-3', 8)
) as s(pcode, lcode, qty)
join public.products p on p.code = s.pcode
join public.locations l on l.code = s.lcode
on conflict (product_id, location_id) do update set quantity = excluded.quantity;
