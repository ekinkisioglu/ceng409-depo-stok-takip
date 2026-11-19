# CENG 409 — Mobil Depo ve Stok Takip Sistemi

Pamukkale Üniversitesi Endüstri Mühendisliği, CENG 409 Sistem Analizi ve Tasarımı dönem projesi.

- **Canlı uygulama:** https://ceng409-depo-stok-takip.vercel.app
- **Test hesapları (tamamen sentetik):**
  - Depo Personeli (sadece DEPO-A yetkili): `depo.test.ceng409@mailinator.com` / `w63mehh1EIScU2!1`
  - Depo Sorumlusu (tüm depolar + Yönetim Paneli): `depo.sorumlu.ceng409@mailinator.com` / `DexuuMLNZHS87n!2`
- **Kullanılan teknolojiler:** Next.js (App Router, TypeScript, Tailwind CSS) · Supabase (veritabanı + auth) · Vercel (canlı yayın)

## Durum

Adım 1-5 tamamlandı: giriş/kayıt, ürün arama/detay, stok girişi/çıkışı/transfer, sayım/düzeltme onayı, rol+depo bazlı yetkilendirme, hareket geçmişi ve Yönetim Paneli gerçek Supabase verisiyle uçtan uca çalışıyor. 7 kötü/alternatif durum (S1,S2,S5,S7,S8,S9,S11) güvenli biçimde ele alınmış durumda. Sırada Adım 6 (Doğrulama: mobil test, test senaryoları tablosu) var. Geliştirme sırası için bkz. `docs/00-kritik-kurallar-checklist.md`.

## Kurulum / Çalıştırma

```bash
npm install
cp .env.local.example .env.local   # Supabase Project URL + anon key'i doldurun
npm run dev
```

Veritabanı şeması için `supabase/migrations/` klasöründeki SQL dosyalarını sırasıyla (0001 → 0006) Supabase SQL Editor'de çalıştırın, ardından `supabase/seed.sql` ile örnek veri ekleyin.

> `.env.local` dosyasına **asla** Supabase service role key veya başka bir tam yetkili gizli anahtar konulmaz.

## Dokümantasyon

Sistem analizi ve tasarım çıktıları `docs/` klasöründedir (gereksinim analizi, iş akışı, süreç akışı, DFD, veri modeli, UX/UI, AI Development Log).

## Ekip

_(eklenecek)_
