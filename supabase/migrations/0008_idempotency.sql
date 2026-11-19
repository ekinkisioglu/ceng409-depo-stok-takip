-- S3 senaryosu (aynı işlem iki kez gönderilir) için sunucu taraflı
-- idempotency kontrolü: istemci her gönderimde bir kerelik bir anahtar
-- üretir; aynı anahtarla ikinci bir istek gelirse yeni bir hareket
-- oluşturulmaz, mevcut sonucu tekrar döndürülür.

alter table public.stock_movements add column if not exists idempotency_key uuid;

create unique index if not exists stock_movements_user_idem_key
  on public.stock_movements (user_id, idempotency_key)
  where idempotency_key is not null;

-- Eski 6 parametreli sürümü kaldır; aksi halde PostgREST iki fonksiyon
-- arasında hangisinin çağrılacağını seçemez ("ambiguous function" hatası).
drop function if exists public.kayit_stok_hareketi(text, text, numeric, text, text, text);

create or replace function public.kayit_stok_hareketi(
  p_product_code text,
  p_movement_type text,
  p_quantity numeric,
  p_warehouse_code text,
  p_location_code text,
  p_note text default null,
  p_idempotency_key uuid default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_product_id uuid;
  v_warehouse_id uuid;
  v_location_id uuid;
  v_current_qty numeric;
  v_existing_id uuid;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select id into v_product_id from public.products where code = p_product_code;
  if v_product_id is null then
    raise exception 'Ürün bulunamadı: %', p_product_code;
  end if;

  select w.id, l.id into v_warehouse_id, v_location_id
  from public.locations l
  join public.warehouses w on w.id = l.warehouse_id
  where l.code = p_location_code and w.code = p_warehouse_code;
  if v_location_id is null then
    raise exception 'Depo/konum bulunamadı: % / %', p_warehouse_code, p_location_code;
  end if;

  -- Aynı anahtarla daha önce işlenmiş bir istek mi? (S3 senaryosu)
  if p_idempotency_key is not null then
    select id into v_existing_id
    from public.stock_movements
    where user_id = v_user_id and idempotency_key = p_idempotency_key;

    if v_existing_id is not null then
      select quantity into v_current_qty
      from public.stock_levels
      where product_id = v_product_id and location_id = v_location_id;
      return v_current_qty;
    end if;
  end if;

  select role into v_role from public.users where id = v_user_id;
  if v_role is null then
    raise exception 'Kullanıcı profili bulunamadı';
  end if;

  if p_movement_type not in ('GIRIS', 'CIKIS') then
    raise exception 'Geçersiz işlem türü: %', p_movement_type;
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Miktar sıfırdan büyük olmalıdır';
  end if;

  if v_role = 'depo_personeli' and not exists (
    select 1 from public.warehouse_assignments
    where user_id = v_user_id and warehouse_id = v_warehouse_id
  ) then
    raise exception 'Bu depo için yetkiniz yok: %', p_warehouse_code;
  elsif v_role not in ('depo_personeli', 'depo_sorumlusu') then
    raise exception 'Tanımsız rol: %', v_role;
  end if;

  insert into public.stock_levels (product_id, location_id, quantity)
  values (v_product_id, v_location_id, 0)
  on conflict (product_id, location_id) do nothing;

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
    source_location_id, target_location_id, user_id, status, note, idempotency_key
  ) values (
    v_product_id, p_movement_type, p_quantity,
    case when p_movement_type = 'CIKIS' then v_location_id else null end,
    case when p_movement_type = 'GIRIS' then v_location_id else null end,
    v_user_id, 'tamamlandi', p_note, p_idempotency_key
  );

  return v_current_qty;
end;
$$;

grant execute on function public.kayit_stok_hareketi(text, text, numeric, text, text, text, uuid) to authenticated;
