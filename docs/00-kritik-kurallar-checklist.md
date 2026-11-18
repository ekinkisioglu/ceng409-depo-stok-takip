# 0. Kritik Kurallar ve Kontrol Listesi (proje boyunca referans)

> Bu dosya, dönem projesi dokümanındaki **en kritik bölümlerin** (3, 6, 7.1, 7.4, 8, 14) birleştirilmiş özetidir. Her geliştirme adımından önce ve her teslimden önce bu listeye bakılacaktır. Buradaki hiçbir madde "sonra hallederiz" denip atlanmayacak.

## A. Kapsam ve Varsayımlar (Bölüm 3)

**Kapsam içi — asgari, atlanamaz:**
- [ ] Kullanıcı girişi + en az 2 rol (Depo Personeli, Depo Sorumlusu)
- [ ] Ürün kartı + kod/ad ile arama (barkod/karekod **zorunlu değil**, isteğe bağlı)
- [ ] Stok girişi, stok çıkışı
- [ ] Depo/raf transferi
- [ ] Güncel stok/konum sorgulama
- [ ] Stok hareket geçmişi + işlemi yapan kullanıcı izi
- [ ] En az 1 kritik stok seviyesi uyarı mekanizması
- [ ] En az 1 sayım/düzeltme/stok farkı senaryosu
- [ ] Mobil uyumlu arayüz + kalıcı veri saklama
- [ ] İnternet üzerinden canlı erişim

**Kapsam dışı — bunlara zaman HARCANMAYACAK:**
- Muhasebe / tam ERP / satın alma entegrasyonu
- App Store / Google Play yayını (mobil uyumlu web yeterli)
- Gerçek işletme verisi (sentetik/örnek veri kullanılacak)

**⚠️ Tasarım önceliği (çok kritik, sık yapılan hata):** Önce ürün arama, stok giriş/çıkış, transfer, rol yönetimi, kalıcı veritabanı ve kötü durumların **güvenli çalışması**. Barkod/QR okutma bunlardan **sonra** eklenir ve **tek başına puan getirmez**. Yani çekirdek akış tamamlanmadan barkoda zaman harcanmayacak.

## B. Çalışan Sistem ve Canlıya Alma Koşulları (Bölüm 6)

- [ ] Uygulama telefon/tablet ekranında kullanılabilir
- [ ] Gerçek, kalıcı veritabanı; kapat-aç sonrası veri korunuyor
- [ ] En az 2 kullanıcı rolü + rol bazlı yetkilendirme fiilen çalışıyor
- [ ] Stok girişi + çıkışı + transfer **uçtan uca** çalışıyor (demo edilebilir)
- [ ] Kritik iş kuralları ve veri doğrulama kontrolleri uygulanmış
- [ ] En az 4 kötü/alternatif durum **çalışan uygulamada gerçekten** ele alınmış (sadece raporda değil!)
- [ ] Sistem, öğretim elemanının **kendi cihazından** internet üzerinden erişebileceği canlı bir adreste
- [ ] Canlı demo için çalışan test hesabı / erişim bilgisi hazır
- [ ] Kaynak kod GitHub deposunda, öğretim elemanının erişimine açık
- [ ] GitHub'da **en az 5 anlamlı commit** (final dosyayı tek seferde yüklemek YETERSİZ)
- [ ] README mevcut: canlı bağlantı + kurulum/çalıştırma notu + kullanılan teknoloji + test hesabı

## C. Yol A Geliştirme Adımları (Bölüm 7.1)

1. [ ] GitHub'da yeni proje deposu oluştur
2. [ ] Önce minimum iskelet: giriş ekranı + ürün listesi + tek bir temel stok işlemi
3. [ ] Veri modelini Supabase'de kur — **AI'nın önerdiği şemayı değil, bizim teslim ettiğimiz veri modelini** kullan (sıra önemli: önce veri modeli dokümanı, sonra şema)
4. [ ] AI destekli editörde küçük görevlerle ilerle; her adımdan sonra çalıştır ve test et
5. [ ] Her çalışan değişikliği anlamlı commit mesajıyla GitHub'a gönder
6. [ ] GitHub deposunu Vercel'e bağla; her güncellemede canlı sürümün yeniden oluştuğunu kontrol et
7. [ ] Son aşamada **gerçek telefondan** test et — ekran görüntüsüne değil canlı URL'ye göre doğrula

## D. Geliştirme Sırası (Bölüm 7.4) — bu sırayı atlama

| Adım | Hedef | Kontrol |
|---|---|---|
| 1 | İskelet | Canlı URL açılıyor, boş ana ekran + temel gezinme çalışıyor |
| 2 | Veri | Ürün/stok verisi kalıcı veritabanından okunuyor |
| 3 | İşlem | Stok girişi veya çıkışı uçtan uca çalışıyor |
| 4 | Rol | İki kullanıcı rolünün erişim farkı uygulanıyor |
| 5 | İstisna | En az 4 kötü/alternatif durum güvenli biçimde ele alınıyor |
| 6 | Doğrulama | Mobil test, test senaryoları, README, canlı demo tamamlanıyor |

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
- [ ] Test hesabı çalışıyor; en az 2 rolün yetkileri gerçekten farklı
- [ ] Stok giriş/çıkış/transfer kalıcı veritabanına yazılıyor
- [ ] Uygulama kapat-aç sonrası veri korunuyor
- [ ] En az 4 kötü/alternatif durum canlı uygulamada gösterilebiliyor
- [ ] En az 8 test senaryosunun beklenen/gerçekleşen sonucu raporda var
- [ ] GitHub deposunda veya istemci kodunda gizli/secret/tam yetkili anahtar YOK
- [ ] AI Development Log en az 5 önemli etkileşimi ve ekip doğrulamasını içeriyor
- [ ] Ekipteki herhangi bir üye veri modelini, iş kurallarını ve teknoloji akışını açıklayabiliyor

---
*Bu dosya proje ilerledikçe güncellenecek; yeni bölüm eklendikçe bu checklist'e karşı doğrulama yapılacaktır.*
