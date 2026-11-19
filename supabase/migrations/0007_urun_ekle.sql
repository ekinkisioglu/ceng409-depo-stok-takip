-- Depo Sorumlusu'nun yeni ürün tanımlayabilmesi için.

create or replace function public.ekle_urun(
  p_code text,
  p_name text,
  p_unit text,
  p_critical_level numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'Bu işlem için giriş yapmış olmanız gerekir';
  end if;

  select role into v_role from public.users where id = v_user_id;
  if v_role <> 'depo_sorumlusu' then
    raise exception 'Bu işlem yalnızca Depo Sorumlusu tarafından yapılabilir';
  end if;

  if p_code is null or trim(p_code) = '' then
    raise exception 'Ürün kodu boş olamaz';
  end if;

  if p_unit not in ('adet', 'koli', 'kg') then
    raise exception 'Geçersiz ölçü birimi: %', p_unit;
  end if;

  if p_critical_level is null or p_critical_level < 0 then
    raise exception 'Kritik seviye negatif olamaz';
  end if;

  if exists (select 1 from public.products where code = p_code) then
    raise exception 'Bu ürün kodu zaten kullanılıyor: %', p_code;
  end if;

  insert into public.products (code, name, unit, critical_level)
  values (trim(p_code), trim(p_name), p_unit, p_critical_level)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.ekle_urun(text, text, text, numeric) to authenticated;
