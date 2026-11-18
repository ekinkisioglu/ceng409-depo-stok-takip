# 7. AI Development Log

> Format: AI aracı/amaç → istem özeti → AI çıktısı → ekip kararı → doğrulama. Bu dosya proje ilerledikçe güncellenir; "AI böyle önerdi" hiçbir kararın tek gerekçesi değildir — her madde ekip tarafından doğrulanmıştır.

## Kayıt 1 — Next.js 16 sürüm farklarının kontrolü

- **Araç / amaç:** Claude (Claude Code) — `create-next-app` ile üretilen iskeletin, modelin eğitim verisinden farklı davranabilecek yeni bir Next.js sürümü (16.4.6) kullandığını fark edip kod yazmadan önce kontrol etmek.
- **İstem özeti:** Scaffold'daki `AGENTS.md` dosyası "Bu sürüm eğitim verindeki Next.js'ten farklı olabilir, kod yazmadan önce `node_modules/next/dist/docs/` içindeki ilgili kılavuzu oku" uyarısı veriyordu; bu kılavuz okundu.
- **AI çıktısı:** Next.js 16'da "Cache Components" modelinin (`cacheComponents: true`) varsayılan olarak açık geldiği, bunun dinamik veriler için `use cache`/`Suspense` zorunluluğu getirdiği tespit edildi.
- **Ekip kararı:** Uygulamanın verisi (stok miktarı, kullanıcı oturumu) zaten tamamen dinamik olduğundan, `next.config.ts`'den `cacheComponents` ve `partialPrefetching` kaldırılarak önceki (klasik) caching modeline geçildi — ekip için daha basit ve öngörülebilir.
- **Doğrulama:** `npm run build` ve `npm run lint` hatasız tamamlandı; `next dev` ile tüm rotalar `curl` üzerinden 200 döndürdü.

## Kayıt 2 — Gereksinim analizi ve kötü durum senaryoları üretimi

- **Araç / amaç:** Claude — Bölüm 1 (Problem/Paydaş/Gereksinim) dokümanını, proje tanımındaki ana işleyiş ve örnek kötü durumlardan hareketle taslaklamak.
- **İstem özeti:** Proje tanım dosyasındaki Bölüm 2 (Ana İşleyiş), Bölüm 3 (Kapsam) ve Bölüm 4'teki 5 örnek kötü durum temel alınarak 12 senaryo (5 doküman kaynaklı + 7 ek) ve İG/İOG/İK listeleri üretildi.
- **AI çıktısı:** Her senaryo için tetikleyen/sistem bilgisi/kullanıcı görüşü/davranış/kayıt/bilgilendirilen/güvenli dönüş alanlarını içeren yapılandırılmış senaryo seti.
- **Ekip kararı:** Varsayılan iş bağlamı (çok depolu üretim işletmesi, sabit ölçü birimi) ekip tarafından onaylandı; senaryo sayısı istenen 10'u aşacak şekilde bilerek genişletildi.
- **Doğrulama:** Senaryoların iş akışı (`02`) ve süreç akışı (`03`) diyagramlarındaki karar noktalarıyla bire bir eşleştiği kontrol edildi (izlenebilirlik).

## Kayıt 3 — Veri modeli tasarımı

- **Araç / amaç:** Claude — Supabase şemasına temel olacak veri modelini DFD veri depolarından (D1–D5) türetmek.
- **İstem özeti:** Gereksinimler ve DFD esas alınarak tablo/alan/ilişki/bütünlük kuralı önerisi istendi; "hazır bir şablon kopyalama" açıkça yasaklandı (bkz. proje dokümanı Bölüm 5.5).
- **AI çıktısı:** 7 tablo (USERS, WAREHOUSES, LOCATIONS, WAREHOUSE_ASSIGNMENTS, PRODUCTS, STOCK_LEVELS, STOCK_MOVEMENTS, CORRECTION_REQUESTS) + 5 bütünlük kuralı (İK1–İK5).
- **Ekip kararı:** Kabul edildi. Supabase şeması kurulurken bu model esas alınacak; **AI'ya yeniden "bana bir şema öner" denmeyecek** (checklist madde C.3).
- **Doğrulama:** İzlenebilirlik tablosuyla her tablo/kural İG/İK kodlarına eşleştirildi.

## Kayıt 4 — GitHub deposu ve commit stratejisi

- **Araç / amaç:** Claude — proje reposunu oluşturmak ve "en az 5 anlamlı commit" şartını (checklist madde B) karşılamak.
- **İstem özeti:** Her analiz/kod adımının ayrı, anlamlı commit mesajlarıyla kaydedilmesi istendi; `gh repo create` ile private repo oluşturma onayı alındı.
- **AI çıktısı:** `ekinkisioglu/ceng409-depo-stok-takip` private repo'su oluşturuldu; her doküman/kod adımı kendi commit'i olarak push edildi.
- **Ekip kararı:** Kabul edildi. Teslimden önce öğretim elemanının collaborator olarak eklenmesi (ya da repo public yapılması) checklist'e not edildi.
- **Doğrulama:** `git log --oneline` ile commit geçmişi gözle kontrol edildi.

## Kayıt 5 — Güvenlik: ortam değişkeni / secret key yönetimi

- **Araç / amaç:** Claude — Bölüm 8'deki "kırmızı çizgi" kuralını (service role key asla istemci/GitHub'a konulmayacak) kod yapısına baştan oturtmak.
- **İstem özeti:** `.env.local.example` şablonu ve Supabase client/server dosyaları (`src/lib/supabase/`) hazırlanırken, yalnızca public/anon key kullanılacak şekilde kodlanması istendi.
- **AI çıktısı:** `.gitignore`'daki `.env*` kuralına `.env.local.example` için istisna eklendi (şablon commit'lensin, gerçek `.env.local` asla commit'lenmesin); server client dosyasına güvenlik kuralını hatırlatan not eklendi.
- **Ekip kararı:** Kabul edildi.
- **Doğrulama:** `git status` ile `.env.local.example`'ın takip edildiği, `.env.local`'ın (henüz oluşturulmadıysa de) ignore listesinde kaldığı doğrulandı.

## Kayıt 6 — "permission denied for table products" hatasının teşhisi

- **Araç / amaç:** Claude — Ürün Arama ekranını canlı Supabase verisine bağladıktan sonra çıkan `permission denied for table products` hatasını teşhis etmek.
- **İstem özeti:** Hata mesajı analiz edildi; RLS politikalarının (`0001_init.sql`) doğru kurulu olmasına rağmen hatanın devam etmesi, Postgres'te RLS'den önce gelen temel `GRANT` izninin eksik olduğunu gösteriyordu.
- **AI çıktısı:** `0002_grants.sql` migration'ı önerildi — `anon`/`authenticated` rollerine ilgili tablolarda açık `grant select` izni veren ek bir script.
- **Ekip kararı:** Script incelendi, Supabase SQL Editor'de çalıştırıldı.
- **Doğrulama:** Çalıştırdıktan sonra `curl` ile Ürün Arama (`?q=vida` → P-1001 bulundu, `?q=zzzz` → "Ürün bulunamadı") ve Ürün Detay (`/urun/P-1001` → Depo A/Raf 3: 45 koli, Depo B/Raf 1: 12 koli ⚠ kritik uyarı) ekranları gerçek veriyle doğrulandı.

## Kayıt 7 — Atomik stok hareketi fonksiyonu ve giriş/yetki akışı (Adım 3 - İşlem)

- **Araç / amaç:** Claude — Stok girişi/çıkışının uçtan uca, eşzamanlılık (S5) ve yetersiz stok (S2) senaryolarına karşı güvenli şekilde çalışmasını sağlamak.
- **İstem özeti:** `IOG4`/`IK1` gereksinimleri (iş kuralı kontrolü veritabanı tarafında, negatif stok asla oluşmaz) temel alınarak, satır kilidi (`for update`) kullanan tek bir Postgres fonksiyonu (`kayit_stok_hareketi`) tasarlanması istendi; ayrıca Next.js 16'da `middleware.ts`'in `proxy.ts` olarak yeniden adlandırıldığı tespit edilip buna göre giriş koruması yazıldı.
- **AI çıktısı:** `security definer` + `auth.uid()` kontrolü + `for update` satır kilidi içeren SQL fonksiyonu; Supabase Auth ile gerçek giriş/kayıt ekranları; `src/proxy.ts` ile girişsiz kullanıcıların korumalı rotalara erişiminin engellenmesi.
- **Ekip kararı:** Kabul edildi. Rol bazlı kısıtlama (hangi depoya kimin erişebileceği) kasıtlı olarak Adım 4'e bırakıldı — şu an herhangi bir giriş yapmış kullanıcı her depoda işlem yapabiliyor.
- **Doğrulama:** Gerçek bir test hesabıyla (bkz. README) Supabase REST API üzerinden uçtan uca test edildi: (1) GIRIS 8→13, (2) CIKIS 13→10, (3) S2 senaryosu — 999999 birim çıkış denemesi "Yetersiz stok: mevcut 10, girilen 999999" ile reddedildi, (4) oturumsuz çağrı "Bu işlem için giriş yapmış olmanız gerekir" ile reddedildi, (5) `stock_movements` tablosunda yalnızca başarılı 2 işlemin append-only kaydedildiği, başarısız denemelerin iz bırakmadığı doğrulandı. Ayrıca `src/proxy.ts` için girişsiz `/ana-sayfa` isteğinin HTTP 307 ile `/`'ye yönlendirildiği `curl` ile teyit edildi.

## Kayıt 8 — Vercel'e canlıya alma

- **Araç / amaç:** Claude — projeyi internet üzerinden erişilebilir canlı bir adrese taşımak (checklist madde B).
- **İstem özeti:** Önce `vercel deploy --temporary` ile anonim/geçici bir deployment denendi; bu deployment'ın Vercel'in bot koruması (`x-vercel-mitigated: deny`) tarafından `curl` için (muhtemelen tarayıcı dışı istekler için genel olarak) engellendiği görüldü. Bunun üzerine kullanıcıdan `vercel login` ile kendi hesabına giriş yapması istendi; sonrasında proje gerçek bir Vercel projesine (`stockx4/ceng409-depo-stok-takip`) bağlanıp production'a deploy edildi.
- **AI çıktısı:** Canlı URL: `https://ceng409-depo-stok-takip.vercel.app`. GitHub ile otomatik deploy bağlantısı (`vercel git connect`) "GitHub Login Connection eksik" hatasıyla başarısız oldu — bu adımın kullanıcı tarafından vercel.com hesap ayarlarından tamamlanması gerekiyor.
- **Ekip kararı:** Kabul edildi; GitHub bağlantısı tamamlanana kadar her önemli push sonrası `vercel deploy --prod` manuel çalıştırılacak.
- **Doğrulama:** `curl` ile production alias URL'inin (Vercel girişi istemeden) açıldığı, girişsiz `/ana-sayfa` ve `/urun-ara` isteklerinin 307 ile `/`'ye yönlendirildiği, ham (alias olmayan) deployment URL'inin ise Vercel'in kendi koruması nedeniyle 302 döndürdüğü doğrulandı.
