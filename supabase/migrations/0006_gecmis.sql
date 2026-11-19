-- Depo Sorumlusu, hareket geçmişinde "kim yaptı" bilgisini görebilmeli (İG9).
-- public.users'ın mevcut SELECT politikası (auth.uid() = id) kendi satırı
-- dışındakileri gizliyor; bu, recursion'a girmeyen bir SECURITY DEFINER
-- yardımcı fonksiyonla genişletiliyor.

create or replace function public.is_depo_sorumlusu()
returns boolean
language sql
security definer
set search_path = public
as $$
  select role = 'depo_sorumlusu' from public.users where id = auth.uid();
$$;

grant execute on function public.is_depo_sorumlusu() to authenticated;

create policy "sorumlu tum kullanicilari okuyabilir" on public.users
  for select using (public.is_depo_sorumlusu());
