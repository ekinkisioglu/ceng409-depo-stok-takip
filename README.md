# CENG 409 — Mobil Depo ve Stok Takip Sistemi

Pamukkale Üniversitesi Endüstri Mühendisliği, CENG 409 Sistem Analizi ve Tasarımı dönem projesi.

- **Canlı uygulama:** https://ceng409-depo-stok-takip.vercel.app
- **Test hesabı:** `depo.test.ceng409@mailinator.com` / `w63mehh1EIScU2!1` (tamamen sentetik, rol: depo_personeli)
- **Kullanılan teknolojiler:** Next.js (App Router, TypeScript, Tailwind CSS) · Supabase (veritabanı + auth) · Vercel (canlı yayın)

## Durum

Adım 3 (İşlem) tamamlandı: giriş/kayıt, ürün arama, ürün detay, stok girişi ve stok çıkışı gerçek Supabase verisiyle uçtan uca çalışıyor (atomik veritabanı fonksiyonu ile, eşzamanlılık ve yetersiz stok kontrolleri dahil). Geliştirme sırası için bkz. `docs/00-kritik-kurallar-checklist.md`.

## Kurulum / Çalıştırma

```bash
npm install
cp .env.local.example .env.local   # Supabase Project URL + anon key'i doldurun
npm run dev
```

Veritabanı şeması için `supabase/migrations/` klasöründeki SQL dosyalarını sırasıyla (0001 → 0002 → 0003) Supabase SQL Editor'de çalıştırın, ardından `supabase/seed.sql` ile örnek veri ekleyin.

> `.env.local` dosyasına **asla** Supabase service role key veya başka bir tam yetkili gizli anahtar konulmaz.

## Dokümantasyon

Sistem analizi ve tasarım çıktıları `docs/` klasöründedir (gereksinim analizi, iş akışı, süreç akışı, DFD, veri modeli, UX/UI, AI Development Log).

## Ekip

_(eklenecek)_
