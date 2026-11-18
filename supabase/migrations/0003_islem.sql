-- Adım 3 (İşlem): Stok girişi/çıkışını uçtan uca, atomik ve güvenli şekilde
-- işleyen fonksiyon. SECURITY DEFINER kullanılır ama yetki kontrolünü
-- (auth.uid() boş olamaz) fonksiyonun kendisi yapar — bkz.
-- docs/00-kritik-kurallar-checklist.md madde E.

create or replace function public.kayit_stok_hareketi(
  p_product_code text,
  p_movement_type text, -- 'GIRIS' | 'CIKIS'
  p_quantity numeric,
  p_warehouse_code text,
  p_location_code text,
  p_note text default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_location_id uuid;
  v_current_qty numeric;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  if p_movement_type not in ('GIRIS', 'CIKIS') then
    raise exception 'Geçersiz işlem türü: %', p_movement_type;
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Miktar sıfırdan büyük olmalıdır';
  end if;

  select id into v_product_id from public.products where code = p_product_code;
  if v_product_id is null then
    raise exception 'Ürün bulunamadı: %', p_product_code;
  end if;

  select l.id into v_location_id
  from public.locations l
  join public.warehouses w on w.id = l.warehouse_id
  where l.code = p_location_code and w.code = p_warehouse_code;

  if v_location_id is null then
    raise exception 'Depo/konum bulunamadı: % / %', p_warehouse_code, p_location_code;
  end if;

  -- Satır yoksa 0 ile oluştur, varsa dokunma (idempotent).
  insert into public.stock_levels (product_id, location_id, quantity)
  values (v_product_id, v_location_id, 0)
  on conflict (product_id, location_id) do nothing;

  -- Eşzamanlı işlemlerde (S5 senaryosu) ikinci isteğin ilkinin bitmesini
  -- beklemesi için satır kilidi.
  select quantity into v_current_qty
  from public.stock_levels
  where product_id = v_product_id and location_id = v_location_id
  for update;

  if p_movement_type = 'CIKIS' and v_current_qty < p_quantity then
    raise exception 'Yetersiz stok: mevcut %, girilen %', v_current_qty, p_quantity;
  end if;

  update public.stock_levels
  set quantity = quantity + case when p_movement_type = 'GIRIS' then p_quantity else -p_quantity end
  where product_id = v_product_id and location_id = v_location_id
  returning quantity into v_current_qty;

  insert into public.stock_movements (
    product_id, movement_type, quantity,
    source_location_id, target_location_id, user_id, status, note
  ) values (
    v_product_id, p_movement_type, p_quantity,
    case when p_movement_type = 'CIKIS' then v_location_id else null end,
    case when p_movement_type = 'GIRIS' then v_location_id else null end,
    v_user_id, 'tamamlandi', p_note
  );

  return v_current_qty;
end;
$$;

grant execute on function public.kayit_stok_hareketi(text, text, numeric, text, text, text) to authenticated;

-- Kullanıcı kayıt olduğunda kendi profil satırını oluşturabilmesi için.
create policy "kullanici kendi profilini olusturabilir" on public.users
  for insert with check (auth.uid() = id);

grant insert on public.users to authenticated;
