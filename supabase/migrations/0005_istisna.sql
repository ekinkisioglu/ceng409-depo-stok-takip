-- Adım 5 (İstisna): Transfer (S8) ve Sayım/Düzeltme (S7) akışlarını, Yönetim
-- Paneli'nin kritik stok (S11) ve onay akışlarıyla birlikte tamamlar.

-- ── Transfer ────────────────────────────────────────────────────────────

create or replace function public.baslat_transfer(
  p_product_code text,
  p_quantity numeric,
  p_src_warehouse_code text,
  p_src_location_code text,
  p_dst_warehouse_code text,
  p_dst_location_code text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_product_id uuid;
  v_src_warehouse_id uuid;
  v_src_location_id uuid;
  v_dst_warehouse_id uuid;
  v_dst_location_id uuid;
  v_current_qty numeric;
  v_movement_id uuid;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;
  if v_role is null then
    raise exception 'Kullanıcı profili bulunamadı';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Miktar sıfırdan büyük olmalıdır';
  end if;

  select id into v_product_id from public.products where code = p_product_code;
  if v_product_id is null then
    raise exception 'Ürün bulunamadı: %', p_product_code;
  end if;

  select w.id, l.id into v_src_warehouse_id, v_src_location_id
  from public.locations l join public.warehouses w on w.id = l.warehouse_id
  where l.code = p_src_location_code and w.code = p_src_warehouse_code;
  if v_src_location_id is null then
    raise exception 'Kaynak depo/konum bulunamadı: % / %', p_src_warehouse_code, p_src_location_code;
  end if;

  select w.id, l.id into v_dst_warehouse_id, v_dst_location_id
  from public.locations l join public.warehouses w on w.id = l.warehouse_id
  where l.code = p_dst_location_code and w.code = p_dst_warehouse_code;
  if v_dst_location_id is null then
    raise exception 'Hedef depo/konum bulunamadı: % / %', p_dst_warehouse_code, p_dst_location_code;
  end if;

  if v_src_location_id = v_dst_location_id then
    raise exception 'Kaynak ve hedef konum aynı olamaz';
  end if;

  if v_role = 'depo_personeli' and not exists (
    select 1 from public.warehouse_assignments
    where user_id = v_user_id and warehouse_id = v_src_warehouse_id
  ) then
    raise exception 'Bu depo için yetkiniz yok: %', p_src_warehouse_code;
  end if;

  insert into public.stock_levels (product_id, location_id, quantity)
  values (v_product_id, v_src_location_id, 0)
  on conflict (product_id, location_id) do nothing;

  select quantity into v_current_qty
  from public.stock_levels
  where product_id = v_product_id and location_id = v_src_location_id
  for update;

  if v_current_qty < p_quantity then
    raise exception 'Yetersiz stok: mevcut %, girilen %', v_current_qty, p_quantity;
  end if;

  update public.stock_levels
  set quantity = quantity - p_quantity
  where product_id = v_product_id and location_id = v_src_location_id;

  insert into public.stock_movements (
    product_id, movement_type, quantity,
    source_location_id, target_location_id, user_id, status, note
  ) values (
    v_product_id, 'TRANSFER', p_quantity,
    v_src_location_id, v_dst_location_id, v_user_id, 'beklemede', p_note
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

create or replace function public.teslim_al_transfer(p_movement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_movement record;
  v_dst_warehouse_id uuid;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;

  select * into v_movement
  from public.stock_movements
  where id = p_movement_id and movement_type = 'TRANSFER' and status = 'beklemede'
  for update;

  if v_movement is null then
    raise exception 'Transfer bulunamadı veya zaten sonuçlandırılmış';
  end if;

  select warehouse_id into v_dst_warehouse_id
  from public.locations where id = v_movement.target_location_id;

  if v_role = 'depo_personeli' and not exists (
    select 1 from public.warehouse_assignments
    where user_id = v_user_id and warehouse_id = v_dst_warehouse_id
  ) then
    raise exception 'Bu depo için yetkiniz yok';
  end if;

  insert into public.stock_levels (product_id, location_id, quantity)
  values (v_movement.product_id, v_movement.target_location_id, 0)
  on conflict (product_id, location_id) do nothing;

  update public.stock_levels
  set quantity = quantity + v_movement.quantity
  where product_id = v_movement.product_id and location_id = v_movement.target_location_id;

  update public.stock_movements
  set status = 'tamamlandi'
  where id = p_movement_id;
end;
$$;

create or replace function public.iptal_transfer(p_movement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_movement record;
  v_src_warehouse_id uuid;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;

  select * into v_movement
  from public.stock_movements
  where id = p_movement_id and movement_type = 'TRANSFER' and status = 'beklemede'
  for update;

  if v_movement is null then
    raise exception 'Transfer bulunamadı veya zaten sonuçlandırılmış';
  end if;

  select warehouse_id into v_src_warehouse_id
  from public.locations where id = v_movement.source_location_id;

  if v_role = 'depo_personeli' and not exists (
    select 1 from public.warehouse_assignments
    where user_id = v_user_id and warehouse_id = v_src_warehouse_id
  ) then
    raise exception 'Bu depo için yetkiniz yok';
  end if;

  update public.stock_levels
  set quantity = quantity + v_movement.quantity
  where product_id = v_movement.product_id and location_id = v_movement.source_location_id;

  update public.stock_movements
  set status = 'iptal'
  where id = p_movement_id;
end;
$$;

-- ── Sayım / Düzeltme ────────────────────────────────────────────────────

create or replace function public.kayit_sayim(
  p_product_code text,
  p_warehouse_code text,
  p_location_code text,
  p_counted_quantity numeric,
  p_note text default null
)
returns numeric  -- fark (counted - system); 0 ise düzeltme talebi oluşturulmaz
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
  v_system_qty numeric;
  v_diff numeric;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;
  if v_role is null then
    raise exception 'Kullanıcı profili bulunamadı';
  end if;

  if p_counted_quantity is null or p_counted_quantity < 0 then
    raise exception 'Sayım miktarı negatif olamaz';
  end if;

  select id into v_product_id from public.products where code = p_product_code;
  if v_product_id is null then
    raise exception 'Ürün bulunamadı: %', p_product_code;
  end if;

  select w.id, l.id into v_warehouse_id, v_location_id
  from public.locations l join public.warehouses w on w.id = l.warehouse_id
  where l.code = p_location_code and w.code = p_warehouse_code;
  if v_location_id is null then
    raise exception 'Depo/konum bulunamadı: % / %', p_warehouse_code, p_location_code;
  end if;

  if v_role = 'depo_personeli' and not exists (
    select 1 from public.warehouse_assignments
    where user_id = v_user_id and warehouse_id = v_warehouse_id
  ) then
    raise exception 'Bu depo için yetkiniz yok: %', p_warehouse_code;
  end if;

  insert into public.stock_levels (product_id, location_id, quantity)
  values (v_product_id, v_location_id, 0)
  on conflict (product_id, location_id) do nothing;

  select quantity into v_system_qty
  from public.stock_levels
  where product_id = v_product_id and location_id = v_location_id
  for update;

  v_diff := p_counted_quantity - v_system_qty;

  if v_diff <> 0 then
    insert into public.correction_requests (
      product_id, location_id, system_quantity, counted_quantity, status, requested_by
    ) values (
      v_product_id, v_location_id, v_system_qty, p_counted_quantity, 'beklemede', v_user_id
    );
  end if;

  return v_diff;
end;
$$;

create or replace function public.karar_ver_duzeltme(
  p_request_id uuid,
  p_karar text -- 'onayla' | 'reddet'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_req record;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;
  if v_role <> 'depo_sorumlusu' then
    raise exception 'Bu işlem yalnızca Depo Sorumlusu tarafından yapılabilir';
  end if;

  if p_karar not in ('onayla', 'reddet') then
    raise exception 'Geçersiz karar: %', p_karar;
  end if;

  select * into v_req
  from public.correction_requests
  where id = p_request_id and status = 'beklemede'
  for update;

  if v_req is null then
    raise exception 'Düzeltme talebi bulunamadı veya zaten sonuçlandırılmış';
  end if;

  if p_karar = 'onayla' then
    update public.stock_levels
    set quantity = v_req.counted_quantity
    where product_id = v_req.product_id and location_id = v_req.location_id;

    insert into public.stock_movements (
      product_id, movement_type, quantity,
      source_location_id, target_location_id, user_id, status, note
    ) values (
      v_req.product_id, 'SAYIM', abs(v_req.counted_quantity - v_req.system_quantity),
      case when v_req.counted_quantity < v_req.system_quantity then v_req.location_id else null end,
      case when v_req.counted_quantity >= v_req.system_quantity then v_req.location_id else null end,
      v_user_id, 'tamamlandi',
      format('Sayım düzeltmesi onaylandı (talep: %s)', v_req.id)
    );

    update public.correction_requests
    set status = 'onaylandi', approved_by = v_user_id, resolved_at = now()
    where id = p_request_id;
  else
    update public.correction_requests
    set status = 'reddedildi', approved_by = v_user_id, resolved_at = now()
    where id = p_request_id;
  end if;
end;
$$;

grant execute on function public.baslat_transfer(text, numeric, text, text, text, text, text) to authenticated;
grant execute on function public.teslim_al_transfer(uuid) to authenticated;
grant execute on function public.iptal_transfer(uuid) to authenticated;
grant execute on function public.kayit_sayim(text, text, text, numeric, text) to authenticated;
grant execute on function public.karar_ver_duzeltme(uuid, text) to authenticated;
