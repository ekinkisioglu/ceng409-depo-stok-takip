# CENG 409 — Mobil Depo ve Stok Takip Sistemi

Pamukkale Üniversitesi Endüstri Mühendisliği, CENG 409 Sistem Analizi ve Tasarımı dönem projesi.

- **Canlı uygulama:** _(eklenecek — Vercel'e bağlandığında)_
- **Test hesabı:** _(eklenecek)_
- **Kullanılan teknolojiler:** Next.js (App Router, TypeScript, Tailwind CSS) · Supabase (veritabanı + auth) · Vercel (canlı yayın)

## Durum

İskelet aşaması: navigasyon ekranları kuruldu, veritabanı bağlantısı henüz yok. Geliştirme sırası için bkz. `docs/00-kritik-kurallar-checklist.md`.

## Kurulum / Çalıştırma

```bash
npm install
cp .env.local.example .env.local   # Supabase Project URL + anon key'i doldurun
npm run dev
```

> `.env.local` dosyasına **asla** Supabase service role key veya başka bir tam yetkili gizli anahtar konulmaz.

## Dokümantasyon

Sistem analizi ve tasarım çıktıları `docs/` klasöründedir (gereksinim analizi, iş akışı, süreç akışı, DFD, veri modeli, UX/UI).

## Ekip

_(eklenecek)_
