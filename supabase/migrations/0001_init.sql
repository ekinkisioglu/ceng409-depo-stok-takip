-- CENG409 Depo ve Stok Takip Sistemi — İlk şema (Adım 2: Veri)
-- Bu dosya docs/05-veri-modeli.md ile birebir eşleşir; AI'ya "şema öner" denmemiş,
-- doğrudan teslim edilen veri modeli uygulanmıştır (bkz. docs/00-kritik-kurallar-checklist.md - C.3).
--
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query > bu dosyayı yapıştır > Run.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('depo_personeli','depo_sorumlusu')),
  created_at timestamptz not null default now()
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  code text not null,
  name text not null,
  unique (warehouse_id, code)
);

create table if not exists public.warehouse_assignments (
  user_id uuid not null references public.users(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  primary key (user_id, warehouse_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  unit text not null check (unit in ('adet','koli','kg')),
  critical_level numeric not null default 0 check (critical_level >= 0),
  created_at timestamptz not null default now()
);

-- Her ürünün bir konumdaki güncel miktarı (İK1: negatif stok asla oluşamaz).
create table if not exists public.stock_levels (
  product_id uuid not null references public.products(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  quantity numeric not null default 0 check (quantity >= 0),
  primary key (product_id, location_id)
);

-- Append-only hareket geçmişi (İK2). UPDATE/DELETE politikası kasıtlı olarak yok.
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  movement_type text not null check (movement_type in ('GIRIS','CIKIS','TRANSFER','SAYIM')),
  quantity numeric not null check (quantity > 0),
  source_location_id uuid references public.locations(id),
  target_location_id uuid references public.locations(id),
  user_id uuid references public.users(id),
  status text not null default 'tamamlandi' check (status in ('tamamlandi','beklemede','iptal')),
  note text,
  created_at timestamptz not null default now()
);

-- Sayım farkı onay akışı (İK5). Onaylanana kadar stock_levels değişmez.
create table if not exists public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  location_id uuid not null references public.locations(id),
  system_quantity numeric not null,
  counted_quantity numeric not null,
  difference numeric generated always as (counted_quantity - system_quantity) stored,
  status text not null default 'beklemede' check (status in ('beklemede','onaylandi','reddedildi')),
  requested_by uuid references public.users(id),
  approved_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ── Row Level Security ──────────────────────────────────────────────────
-- Adım 2 (Veri) kapsamı: ürün/depo/konum/stok seviyesi senkron/referans veri
-- olduğundan okuma herkese (anon dahil) açıktır — henüz giriş ekranı canlı
-- veriye bağlı değil. Adım 4'te (Rol) bu politikalar depo bazlı yetkiye göre
-- sıkılaştırılacak; mutasyon (insert/update) politikaları Adım 3'te eklenecek.

alter table public.users enable row level security;
alter table public.warehouses enable row level security;
alter table public.locations enable row level security;
alter table public.warehouse_assignments enable row level security;
alter table public.products enable row level security;
alter table public.stock_levels enable row level security;
alter table public.stock_movements enable row level security;
alter table public.correction_requests enable row level security;

create policy "herkes urun okuyabilir" on public.products for select using (true);
create policy "herkes depo okuyabilir" on public.warehouses for select using (true);
create policy "herkes konum okuyabilir" on public.locations for select using (true);
create policy "herkes stok seviyesi okuyabilir" on public.stock_levels for select using (true);

create policy "giris yapan hareket gecmisini okuyabilir" on public.stock_movements
  for select using (auth.role() = 'authenticated');
create policy "giris yapan duzeltme taleplerini okuyabilir" on public.correction_requests
  for select using (auth.role() = 'authenticated');
create policy "kullanici kendi kaydini okuyabilir" on public.users
  for select using (auth.uid() = id);
