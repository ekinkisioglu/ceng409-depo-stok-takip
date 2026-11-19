# 8. Test ve Doğrulama

> Tüm testler gerçek Supabase projesi (`yvjuxxjmxfixdchdhxfk`) ve gerçek test hesaplarıyla, canlı REST API ve/veya canlı uygulama (`https://ceng409-depo-stok-takip.vercel.app`) üzerinde çalıştırılmıştır — simülasyon değildir. En az 8 istenen test senaryosunun üzerinde, 19 senaryo kayıt altına alınmıştır.

| # | Tür | Senaryo | Girdi | Beklenen Sonuç | Gerçekleşen Sonuç | Durum |
|---|---|---|---|---|---|---|
| T1 | Normal | Doğru bilgiyle giriş | Test hesabı e-posta/şifre | Oturum açılır, erişim token'ı döner | Oturum açıldı, `access_token` alındı | ✅ |
| T2 | Kötü durum | Yanlış şifreyle giriş | Geçerli e-posta + yanlış şifre | Giriş reddedilir, arayüzde "Kullanıcı adı veya şifre hatalı" | `{"error_code":"invalid_credentials","msg":"Invalid login credentials"}` döndü | ✅ |
| T3 | Normal | Ürün arama (geçerli) | "vida" | P-1001 Vida M6 listelenir | P-1001 doğru şekilde bulundu | ✅ |
| T4 | Kötü durum (S1) | Ürün arama (geçersiz kod) | "zzzz" | "Ürün bulunamadı" mesajı, işlem yarıda kalır | "Ürün bulunamadı" gösterildi, sistem durumu değişmedi | ✅ |
| T5 | Normal | Stok girişi | P-1001, DEPO-A/RAF-3, +1 | Miktar artar, hareket kaydedilir | 45→46, `stock_movements` kaydı oluştu | ✅ |
| T6 | Normal | Stok çıkışı (yeterli stok) | P-1003, DEPO-A/RAF-3, -3 | Miktar azalır | 13→10 | ✅ |
| T7 | Kötü durum (S2) | Stok çıkışı (yetersiz stok) | P-1003, 999999 birim çıkış | İşlem reddedilir: "Yetersiz stok: mevcut X, girilen Y" | "Yetersiz stok: mevcut 10, girilen 999999" ile reddedildi, stok değişmedi | ✅ |
| T8 | Kötü durum | Girişsiz (oturumsuz) işlem çağrısı | Token olmadan `kayit_stok_hareketi` | İşlem reddedilir | "Bu işlem için giriş yapmış olmanız gerekir" | ✅ |
| T9 | Kötü durum (S9) | Depo Personeli, yetkisiz depoda işlem | Personel (sadece DEPO-A yetkili) → DEPO-B'de giriş | Reddedilir: "Bu depo için yetkiniz yok" | Reddedildi, mesaj birebir eşleşti | ✅ |
| T10 | Normal | Depo Personeli, yetkili depoda işlem | Aynı kullanıcı → DEPO-A'da giriş | İşlem başarılı | Başarılı, miktar güncellendi | ✅ |
| T11 | Normal | Depo Sorumlusu, sınırsız depo erişimi | Sorumlu → DEPO-B'de giriş | Kısıtlama olmadan başarılı | Başarılı | ✅ |
| T12 | **Eşzamanlılık (S5)** | İki istek aynı anda aynı ürün/konum üzerinde çıkış yapmaya çalışıyor | P-1003 (mevcut: 10) için eşzamanlı 2× "6 birim çıkış" isteği | Toplam istenen (12) mevcuttan (10) fazla; yalnızca biri başarılı olmalı, stok asla negatif/yanlış olmamalı | İstek A: 10→4 başarılı. İstek B: güncel (4) miktarı görüp "Yetersiz stok: mevcut 4, girilen 6" ile reddedildi. Nihai stok: 4 (tutarlı) | ✅ |
| T13 | Kötü durum (S7) | Sayım farkı tespit edilmesi | Sistemde 41, sayılan 38 | Stok hemen değişmez; onay bekleyen düzeltme talebi oluşur | Fark -3 olarak hesaplandı, `correction_requests` kaydı `beklemede` durumunda oluştu, stok 41'de sabit kaldı | ✅ |
| T14 | Normal | Düzeltme talebinin Depo Sorumlusu tarafından onaylanması | Yukarıdaki talep, karar=onayla | Stok sayılan miktara güncellenir, SAYIM hareketi kaydedilir | Stok 38'e güncellendi, talep durumu "onaylandi" oldu | ✅ |
| T15 | Kötü durum (yetki) | Düzeltme talebinin Depo Personeli tarafından onaylanmaya çalışılması | Personel, karar=onayla | Reddedilir: yalnızca Depo Sorumlusu onaylayabilir | "Bu işlem yalnızca Depo Sorumlusu tarafından yapılabilir" ile reddedildi | ✅ |
| T16 | Kötü durum (S8) | Transfer teslim alma — yetkisiz hedef depo | Personel (DEPO-A yetkili) → DEPO-B'ye gelen transferi teslim almaya çalışıyor | Reddedilir | "Bu depo için yetkiniz yok" ile reddedildi | ✅ |
| T17 | Normal (S8) | Transfer tam akışı | DEPO-A/RAF-3 → DEPO-B/RAF-1, 5 birim, başlat + Sorumlu teslim alır | Kaynak azalır, transfer "beklemede" olur, teslim alınca hedef artar | Kaynak 46→41, teslim sonrası hedef 13→18, durum "tamamlandi" | ✅ |
| T18 | Kötü durum (rol) | Depo Personeli, Yönetim Paneli'ne erişim | Personel oturumuyla `/yonetim` | Erişim engellenir, `/ana-sayfa`'ya yönlendirilir | HTTP 307 → `/ana-sayfa` (hem yerelde hem canlıda) | ✅ |
| T19 | Normal (rol) | Depo Sorumlusu, Yönetim Paneli'ne erişim | Sorumlu oturumuyla `/yonetim` | Sayfa açılır, gerçek veriler gösterilir | HTTP 200, kritik stok/düzeltme/transfer sayıları doğru | ✅ |
| T20 | Kötü durum (S3) | Aynı istek, aynı idempotency anahtarıyla iki kez gönderiliyor | P-1004 GIRIS 5 birim, aynı anahtarla 2 kez | İkinci istek yeni hareket oluşturmamalı, aynı sonucu döndürmeli | İki çağrı da "5" döndürdü (10 değil); `stock_movements`'ta tek kayıt oluştu | ✅ |
| T21 | Normal (S6) | Stok çıkışı onay/özet ekranı | Form doldurulup "Devam Et" tıklanıyor | Göndermeden önce özet ekranı gösterilmeli | Canlı sitede "Lütfen kontrol edin" ekranı + Onayla/Vazgeç butonları doğrulandı | ✅ |

## Notlar

- **T12**, Bölüm 10'da istenen "en az bir eşzamanlılık/çift işlem veya veri tutarlılığı senaryosu" gereksinimini karşılar; test, veritabanı fonksiyonundaki `for update` satır kilidine dayanır (bkz. `supabase/migrations/0003_islem.sql`).
- AI tarafından üretilen tüm kritik kod (`kayit_stok_hareketi`, `baslat_transfer`, `teslim_al_transfer`, `iptal_transfer`, `kayit_sayim`, `karar_ver_duzeltme`) bu test setiyle doğrulanmıştır.
- Gerçek telefon/tarayıcı testi: Canlı adres (`https://ceng409-depo-stok-takip.vercel.app`) ekip üyeleri tarafından kendi telefonlarından ayrıca denenmelidir — bu adım Claude tarafından otomatik doğrulanamaz (tarayıcı/cihaz erişimi yok), ekip tarafından teslimden önce yapılmalıdır.
