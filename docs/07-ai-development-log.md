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

## Kayıt 9 — Rol bazlı yetkilendirme (Adım 4 - Rol)

- **Araç / amaç:** Claude — Depo Personeli ve Depo Sorumlusu rollerinin erişim farkını hem veritabanı hem arayüz seviyesinde gerçekten uygulamak.
- **İstem özeti:** `kayit_stok_hareketi` fonksiyonuna, çağıranın rolünü `public.users`'dan okuyup Depo Personeli ise `warehouse_assignments` tablosuna karşı depo bazlı yetki kontrolü ekleyen bir adım eklendi; `src/proxy.ts`'e `/yonetim` rotası için rol kontrolü, `ana-sayfa`'ya gerçek rol/ad gösterimi ve role göre "Yönetim Paneli" linkinin koşullu gösterimi eklendi.
- **AI çıktısı:** Depo Personeli test hesabı yalnızca `DEPO-A`'ya atandı; `DEPO-B`'de işlem denemesi veritabanı tarafından reddediliyor. İkinci bir test hesabı (Depo Sorumlusu) oluşturuldu.
- **Ekip kararı:** Kabul edildi. Ürün/depo/konum/stok seviyesi okuma erişimi kasıtlı olarak herkese (her iki role) açık bırakıldı — kısıtlama yalnızca *yazma* (stok hareketi) işlemlerinde uygulanıyor; bu, gerçek depo senaryosunda personelin başka depolardaki stok durumunu sorgulayabilmesi ama orada işlem yapamaması mantığına dayanıyor.
- **Doğrulama:** Supabase REST API üzerinden üç senaryo test edildi: (1) Depo Personeli → DEPO-B'de giriş denemesi "Bu depo için yetkiniz yok: DEPO-B" ile reddedildi, (2) Depo Personeli → DEPO-A'da aynı işlem başarılı, (3) Depo Sorumlusu → DEPO-B'de kısıtlamasız başarılı. Ayrıca `@supabase/ssr`'ın `createServerClient` depolama arayüzü kullanılarak her iki hesap için gerçek oturum çerezleri Node ile üretildi ve bu çerezlerle hem yerel hem **canlı Vercel** ortamında `/yonetim`'e istek atıldı: Depo Personeli 307 ile `/ana-sayfa`'ya yönlendirildi, Depo Sorumlusu 200 aldı. `ana-sayfa` çıktısında doğru rol/ad etiketi ve "Yönetim Paneli" linkinin yalnızca Depo Sorumlusu'na göründüğü doğrulandı.

## Kayıt 10 — Transfer ve Sayım/Düzeltme akışları, Yönetim Paneli'nin gerçek verilerle bağlanması (Adım 5 - İstisna)

- **Araç / amaç:** Claude — hâlâ placeholder olan Transfer ve Sayım ekranlarını (ikisi de Bölüm 3'te zorunlu kapsam maddesi) uçtan uca çalışır hale getirmek; Yönetim Paneli'ni gerçek kritik stok/düzeltme/transfer verisiyle bağlamak.
- **İstem özeti:** Beş yeni Postgres fonksiyonu (`baslat_transfer`, `teslim_al_transfer`, `iptal_transfer`, `kayit_sayim`, `karar_ver_duzeltme`) tasarlanması istendi; her biri `kayit_stok_hareketi` ile aynı güvenlik desenini (SECURITY DEFINER + auth.uid() + rol/depo kontrolü + satır kilidi) izliyor. SQL uzun olduğu için kullanıcıya kopyalarken parçalara bölünerek verildi (bir kopyalama hatası fark edilip düzeltildi).
- **AI çıktısı:** Transfer "beklemede" ara durumuyla modellendi (S8); sayım farkı doğrudan stoğu değiştirmiyor, onay bekleyen bir talep oluşturuyor (S7); Yönetim Paneli artık gerçek kritik stok sayısı (S11), bekleyen düzeltme/transfer sayıları ve onay/teslim-al/iptal butonları içeriyor. Ayrıca fark edilen bir eksik (Stok Sorgulama/Geçmiş ekranının hâlâ placeholder olması, İG9 gereksinimi) de bu adımda kapatıldı; bunun için Depo Sorumlusu'nun tüm kullanıcı profillerini okuyabilmesini sağlayan ek bir RLS politikası (recursion'suz, SECURITY DEFINER yardımcı fonksiyonla) eklendi.
- **Ekip kararı:** Kabul edildi. Depo Personeli, geçmişte başka kullanıcıların yaptığı işlemleri görebiliyor ama kimliklerini göremiyor (yalnızca "?") — bu bilinçli bir en-az-yetki kararı, Depo Sorumlusu ise tam görünürlüğe sahip.
- **Doğrulama:** Supabase REST API üzerinden 9 senaryo tek tek test edildi: transfer başlatma (yetkili/yetkisiz kaynak depo), teslim alma (yetkili/yetkisiz hedef depo, zaten sonuçlanmış transfer), iptal (stok doğru geri dönüyor), sayım farkı var/yok, düzeltme onay (personel reddedilir, sorumlu onaylar, stok doğru güncellenir) ve reddetme (stok değişmez). Ardından hem yerel hem **canlı** ortamda `/transfer`, `/sayim`, `/yonetim` ve `/gecmis` sayfaları gerçek oturum çerezleriyle açılıp doğru verilerin (sayılar, etiketler, kullanıcı adları) render edildiği doğrulandı.

## Kayıt 11 — Test senaryoları ve eşzamanlılık testi (Adım 6 - Doğrulama)

- **Araç / amaç:** Claude — projenin Bölüm 10 gereksinimini (en az 8 test senaryosu + en az 1 eşzamanlılık senaryosu) somut, çalıştırılmış kanıtlarla belgelemek.
- **İstem özeti:** Önceki adımlarda zaten tek tek doğrulanmış davranışlar, tutarlı bir test tablosu olarak toplanması istendi; ayrıca gerçek bir eşzamanlılık testi (S5) — önceden sıralı olarak test edilmişti — bu kez **gerçekten paralel** iki arka plan isteğiyle (`curl ... &` + `wait`) tekrar koşuldu.
- **AI çıktısı:** `docs/08-test-senaryolari.md` — 19 test senaryosu (istenen 8'in üzerinde), her biri gerçek girdi/beklenen/gerçekleşen sonuç ile.
- **Ekip kararı:** Kabul edildi. Gerçek telefon/tarayıcı testi dokümanda açıkça "Claude tarafından otomatik doğrulanamaz" olarak işaretlendi — bu adım ekip tarafından tamamlanacak.
- **Doğrulama:** Eşzamanlılık testi: P-1003/DEPO-A/RAF-3 stoğu tam 10'a sabitlendi, aynı anda 6+6 (12 > 10) birim çıkış isteği gönderildi. İstek A 0.41s'de bitip 10→4 başarılı oldu; İstek B 0.45s'de bitip güncel (4) miktarı görerek "Yetersiz stok: mevcut 4, girilen 6" ile reddedildi. Nihai stok 4 — negatif stok veya çift düşüş oluşmadığı doğrulandı. Ayrıca yanlış şifreyle giriş denemesi gerçekten çalıştırılıp `invalid_credentials` hatası teyit edildi.

## Kayıt 12 — Ürün Ekle ekranı (ekip testi sırasında istenen ek özellik)

- **Araç / amaç:** Claude — canlı sitede manuel test yaparken kullanıcı yeni ürün ekleme ihtiyacı fark etti; çekirdek kapsamda olmayan ama kullanışlı bir özellik olarak eklendi.
- **İstem özeti:** Depo Sorumlusu'na özel bir "Ürün Ekle" ekranı ve buna karşılık gelen `ekle_urun` fonksiyonu istendi (rol kontrolü + tekrarlı kod reddi dahil).
- **AI çıktısı:** `/urun-ekle` sayfası (yalnızca Depo Sorumlusu, `proxy.ts`'e eklenen rota koruması ile), Yönetim Paneli'nden link, `supabase/migrations/0007_urun_ekle.sql`.
- **Ekip kararı:** Kabul edildi.
- **Doğrulama:** REST üzerinden üç senaryo: Depo Personeli reddedildi, Depo Sorumlusu başarılı şekilde P-1004 ekledi, aynı kodun tekrar eklenmesi reddedildi. Yeni ürünün Ürün Ara ekranında göründüğü ve canlı sitede `/urun-ekle` rotasının rol bazlı doğru şekilde (Personel: 307, Sorumlu: 200) korunduğu doğrulandı.
