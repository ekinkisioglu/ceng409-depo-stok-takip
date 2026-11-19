# 0. Kritik Kurallar ve Kontrol Listesi (proje boyunca referans)

> Bu dosya, dönem projesi dokümanındaki **en kritik bölümlerin** (3, 6, 7.1, 7.4, 8, 14) birleştirilmiş özetidir. Her geliştirme adımından önce ve her teslimden önce bu listeye bakılacaktır. Buradaki hiçbir madde "sonra hallederiz" denip atlanmayacak.

## A. Kapsam ve Varsayımlar (Bölüm 3)

**Kapsam içi — asgari, atlanamaz:**
- [x] Kullanıcı girişi + en az 2 rol (Depo Personeli, Depo Sorumlusu) — rol ayrımı ve depo bazlı yetki fiilen çalışıyor
- [x] Ürün kartı + kod/ad ile arama (barkod/karekod **zorunlu değil**, isteğe bağlı)
- [x] Stok girişi, stok çıkışı
- [x] Depo/raf transferi (başlat/teslim al/iptal, S8 senaryosu dahil)
- [x] Güncel stok/konum sorgulama
- [x] Stok hareket geçmişi + işlemi yapan kullanıcı izi (filtre + rol bazlı görünürlük)
- [x] En az 1 kritik stok seviyesi uyarı mekanizması
- [x] En az 1 sayım/düzeltme/stok farkı senaryosu (S7 — onay akışıyla)
- [x] Mobil uyumlu arayüz (gerçek cihaz testi Adım 6'da) + kalıcı veri saklama
- [x] İnternet üzerinden canlı erişim — https://ceng409-depo-stok-takip.vercel.app

**Kapsam dışı — bunlara zaman HARCANMAYACAK:**
- Muhasebe / tam ERP / satın alma entegrasyonu
- App Store / Google Play yayını (mobil uyumlu web yeterli)
- Gerçek işletme verisi (sentetik/örnek veri kullanılacak)

**⚠️ Tasarım önceliği (çok kritik, sık yapılan hata):** Önce ürün arama, stok giriş/çıkış, transfer, rol yönetimi, kalıcı veritabanı ve kötü durumların **güvenli çalışması**. Barkod/QR okutma bunlardan **sonra** eklenir ve **tek başına puan getirmez**. Yani çekirdek akış tamamlanmadan barkoda zaman harcanmayacak.

## B. Çalışan Sistem ve Canlıya Alma Koşulları (Bölüm 6)

- [ ] Uygulama telefon/tablet ekranında kullanılabilir — *mobil genişlikte tasarlandı, gerçek cihaz testi Adım 6'da*
- [x] Gerçek, kalıcı veritabanı; kapat-aç sonrası veri korunuyor
- [x] En az 2 kullanıcı rolü + rol bazlı yetkilendirme fiilen çalışıyor (2 test hesabıyla doğrulandı: canlıda ve veritabanı seviyesinde)
- [x] Stok girişi + çıkışı + transfer **uçtan uca** çalışıyor (demo edilebilir)
- [x] Kritik iş kuralları ve veri doğrulama kontrolleri uygulanmış (S2, S5, S7, S8, S9, S11 — veritabanı tarafında)
- [x] En az 4 kötü/alternatif durum **çalışan uygulamada gerçekten** ele alınmış — S1 (ürün bulunamadı), S2 (yetersiz stok), S5 (eşzamanlılık/satır kilidi), S7 (sayım farkı/onay), S8 (transfer beklemede/iptal), S9 (yetkisiz/depo dışı erişim), S11 (kritik stok uyarısı) — 7 senaryo, istenen 4'ü aşıyor
- [x] Sistem, öğretim elemanının **kendi cihazından** internet üzerinden erişebileceği canlı bir adreste — https://ceng409-depo-stok-takip.vercel.app
- [x] Canlı demo için çalışan test hesabı / erişim bilgisi hazır (bkz. README)
- [x] Kaynak kod GitHub deposunda, öğretim elemanının erişimine açık — repo **public**, herkes erişebilir
- [x] GitHub'da **en az 5 anlamlı commit** (final dosyayı tek seferde yüklemek YETERSİZ) — şu an 13+ commit
- [x] README mevcut: canlı bağlantı + kurulum/çalıştırma notu + kullanılan teknoloji + test hesabı

## C. Yol A Geliştirme Adımları (Bölüm 7.1)

1. [x] GitHub'da yeni proje deposu oluştur
2. [x] Önce minimum iskelet: giriş ekranı + ürün listesi + tek bir temel stok işlemi
3. [x] Veri modelini Supabase'de kur — **AI'nın önerdiği şemayı değil, bizim teslim ettiğimiz veri modelini** kullan (sıra önemli: önce veri modeli dokümanı, sonra şema)
4. [x] AI destekli editörde küçük görevlerle ilerle; her adımdan sonra çalıştır ve test et
5. [x] Her çalışan değişikliği anlamlı commit mesajıyla GitHub'a gönder
6. [ ] GitHub deposunu Vercel'e bağla; her güncellemede canlı sürümün yeniden oluştuğunu kontrol et — *deploy manuel olarak canlı, otomatik git bağlantısı için kullanıcının vercel.com'da GitHub'ı "Login Connection" olarak eklemesi gerekiyor*
7. [ ] Son aşamada **gerçek telefondan** test et — ekran görüntüsüne değil canlı URL'ye göre doğrula

## D. Geliştirme Sırası (Bölüm 7.4) — bu sırayı atlama

| Adım | Hedef | Kontrol |
|---|---|---|
| 1 | İskelet | ✅ Canlı URL açılıyor, boş ana ekran + temel gezinme çalışıyor (yerel; Vercel bağlantısı Adım 6) |
| 2 | Veri | ✅ Ürün/stok verisi kalıcı veritabanından okunuyor |
| 3 | İşlem | ✅ Stok girişi ve çıkışı uçtan uca çalışıyor (atomik, S2+S5 kontrollü) |
| 4 | Rol | ✅ İki kullanıcı rolünün erişim farkı (depo bazlı + Yönetim Paneli) uygulandı |
| 5 | İstisna | ✅ 7 kötü/alternatif durum güvenli biçimde ele alındı (S1,S2,S5,S7,S8,S9,S11) |
| 6 | Doğrulama | ✅ 19 test senaryosu (eşzamanlılık dahil) çalıştırıldı; gerçek cihaz testi ekip tarafından yapılacak |

**Önemli:** Her adım bir öncekini çalışır halde bırakmalı — "önce hepsini kodla sonra test et" YAKLAŞIMI KULLANILMAYACAK.

## E. Güvenlik ve Anahtar Yönetimi — Zorunlu Kurallar (Bölüm 8)

🔴 **KIRMIZI ÇİZGİ:** AI aracına, tarayıcı/istemci koduna veya GitHub deposuna veritabanında **tam yetki veren gizli/secret/service-role anahtar KONULMAYACAK**. "AI veritabanında sınırsız işlem yapabilsin" kabul edilemez.

- [ ] Frontend'de **sadece** istemci için tasarlanmış, yayınlanabilir (public/anon) anahtar kullanılacak
- [ ] Tam yetkili gizli anahtarlar yalnızca güvenli sunucu tarafında
- [ ] Supabase'de **Row Level Security (RLS)** + rol bazlı en az yetki politikaları yapılandırılacak
- [ ] API anahtarı/şifre/bağlantı dizesi **GitHub'a commit edilmeyecek** — ortam değişkeni / secret yönetimi kullanılacak (`.env` dosyası `.gitignore`'da olacak!)
- [ ] AI'ya gerçek kullanıcı şifresi, kişisel veri veya üretim ortamının tam yetkili anahtarı **verilmeyecek**
- [ ] Geliştirmede sentetik veri + ayrı test hesabı kullanılacak
- [ ] Bir anahtar yanlışlıkla sızarsa: **silmek yetmez, anahtar iptal edilip yenilenecek**
- [ ] AI'nın ürettiği silme/güncelleme/yetki/şema değişikliği içeren veritabanı komutları, uygulanmadan önce **ekip tarafından okunacak**, mümkünse test ortamında denenecek

## F. Teslim Öncesi Hızlı Kontrol Listesi (Bölüm 14) — final demo öncesi son kontrol

- [ ] Canlı URL öğretim elemanının cihazından açılıyor
- [ ] GitHub deposu erişilebilir; README ve anlamlı commit geçmişi mevcut
- [x] Test hesabı çalışıyor; en az 2 rolün yetkileri gerçekten farklı
- [ ] Stok giriş/çıkış/transfer kalıcı veritabanına yazılıyor
- [ ] Uygulama kapat-aç sonrası veri korunuyor
- [x] En az 4 kötü/alternatif durum canlı uygulamada gösterilebiliyor (S1,S2,S5,S7,S8,S9,S11)
- [x] En az 8 test senaryosunun beklenen/gerçekleşen sonucu raporda var — 19 senaryo, bkz. `docs/08-test-senaryolari.md`
- [ ] GitHub deposunda veya istemci kodunda gizli/secret/tam yetkili anahtar YOK
- [ ] AI Development Log en az 5 önemli etkileşimi ve ekip doğrulamasını içeriyor
- [ ] Ekipteki herhangi bir üye veri modelini, iş kurallarını ve teknoloji akışını açıklayabiliyor

---
*Bu dosya proje ilerledikçe güncellenecek; yeni bölüm eklendikçe bu checklist'e karşı doğrulama yapılacaktır.*
