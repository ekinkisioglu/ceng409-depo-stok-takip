# 1. Problem, Paydaş ve Gereksinim Analizi

> Taslak. Ekip bilgileri, varsayımlar ve senaryo detayları ekip tarafından gözden geçirilip kesinleştirilecektir.

## 1.1 Problem Tanımı

Bir üretim işletmesi/dağıtım deposunda stok hareketleri (giriş, çıkış, transfer, sayım) günümüzde kağıt üzerinde, sözlü iletişimle veya farklı sorumlular tarafından tutulan tutarsız kayıtlarla yönetilmektedir. Bu durum; stok miktarlarının fiziksel durumla uyuşmamasına, hangi kullanıcının hangi işlemi ne zaman yaptığının izlenememesine, kritik seviyenin altına düşen ürünlerin fark edilmemesine ve depolar/raflar arası transferlerin takip edilememesine yol açar.

**Varsayılan iş bağlamı (örnek vaka):** Birden fazla deposu/ambarı olan orta ölçekli bir üretim işletmesi. Depoda hem hammadde/yarı mamul hem de ürün adedi bazında (adet/koli/kg gibi farklı ölçü birimlerinde) takip edilen kalemler bulunur. Veriler sentetik/örnek olacaktır (gerçek işletme verisi kullanılmayacaktır).

## 1.2 Amaç

Stok giriş, çıkış, transfer, sayım ve sorgulama işlemlerinin bir mobil arayüz üzerinden, rol bazlı yetkilendirmeyle, kalıcı bir veritabanına yazılarak ve kötü durumlara karşı güvenli biçimde yürütülebildiği bir sistem tasarlamak ve çalışan bir asgari uygulanabilir sürümünü (MVP) internet üzerinden erişilebilir şekilde yayınlamak.

## 1.3 Kapsam

**Kapsam içi (asgari):**
- Kullanıcı girişi, en az 2 rol: **Depo Personeli** ve **Depo Sorumlusu**
- Ürün kartı, ürün kodu/adı ile arama
- Stok girişi, stok çıkışı
- Depo/raf transferi
- Güncel stok ve konum sorgulama
- Stok hareket geçmişi (kim, ne zaman, ne yaptı)
- Kritik stok seviyesi uyarı mekanizması
- Sayım/düzeltme (stok farkı) senaryosu
- Mobil uyumlu arayüz, kalıcı veritabanı, canlı yayın

**Kapsam dışı:**
- Muhasebe / tam ERP / satın alma entegrasyonu
- Barkod/karekod okutma zorunluluğu (isteğe bağlı ileri özellik olarak eklenebilir)
- Mobil mağaza (App Store/Play) yayını — mobil uyumlu web yeterli
- Gerçek işletme verisi — sentetik veri kullanılacak

## 1.4 Varsayımlar

- V1: Sistemde birden fazla depo/ambar tanımlıdır; her depo içinde raf/konum ayrımı yapılabilir.
- V2: Her ürün bir ölçü birimine sahiptir (adet, koli, kg vb.) ve birim dönüşümü bu MVP kapsamında yapılmaz — her hareket ürünün kayıtlı birimiyle girilir.
- V3: Depo Personeli kendi yetkili olduğu depo(lar) için stok hareketi girebilir; Depo Sorumlusu tüm depoları görebilir, sayım/düzeltme onaylayabilir ve kullanıcı bazlı geçmişi izleyebilir.
- V4: Test ortamında gerçek kullanıcı/kurumsal veri yerine sentetik veri ve test hesapları kullanılacaktır.

## 1.5 Paydaşlar ve İhtiyaçları

| Paydaş | Rolü | Temel İhtiyaçları |
|---|---|---|
| Depo Personeli | Birincil kullanıcı | Hızlıca ürün bulmak, stok giriş/çıkış/transfer işlemini az adımda tamamlamak, hata durumunda ne yapacağını net bir şekilde görmek |
| Depo Sorumlusu | Birincil kullanıcı / yönetici | Tüm depoların güncel stok durumunu görmek, kritik stok uyarılarını almak, sayım farklarını onaylamak/çözmek, kullanıcı bazlı işlem geçmişini denetlemek |
| Öğretim Elemanı (sistem değerlendiricisi) | Dış paydaş | Canlı sisteme kendi cihazından erişmek, test hesabıyla senaryoları deneyebilmek, kod ve veri modelini denetleyebilmek |
| (İleride) Satın Alma / Üretim Planlama | Dolaylı paydaş | Kritik stok uyarılarından haberdar olmak (MVP kapsamında bildirim isteğe bağlı ileri özellik) |

## 1.6 İşlevsel Gereksinimler (taslak liste)

- İG1: Sistem, kullanıcı adı/şifre ile giriş doğrulaması yapmalıdır.
- İG2: Sistem, kullanıcının rolüne göre (Depo Personeli / Depo Sorumlusu) farklı yetki ve ekranlar sunmalıdır.
- İG3: Kullanıcı, ürün kodu veya ürün adı ile ürün arayabilmelidir.
- İG4: Kullanıcı, seçtiği ürün için stok girişi işlemi yapabilmeli; miktar, hedef depo/raf ve açıklama girilmelidir.
- İG5: Kullanıcı, stok çıkışı işlemi yapabilmeli; sistem girilen miktarı mevcut stokla karşılaştırmalıdır.
- İG6: Kullanıcı, bir depo/raftan başka bir depo/rafa transfer başlatabilmelidir.
- İG7: Kullanıcı, bir ürünün güncel stok miktarını ve konumunu sorgulayabilmelidir.
- İG8: Sistem, her stok hareketini (tür, miktar, kullanıcı, zaman damgası, kaynak/hedef) kalıcı olarak kaydetmelidir.
- İG9: Depo Sorumlusu, stok hareket geçmişini kullanıcı/ürün/depo bazında filtreleyebilmelidir.
- İG10: Sistem, ürün bazında tanımlı kritik stok seviyesinin altına düşüldüğünde uyarı üretmelidir.
- İG11: Kullanıcı, sayım işlemi başlatıp sistemdeki miktar ile fiziksel sayım miktarı arasındaki farkı kayda geçirip düzeltme talebi oluşturabilmelidir.
- İG12: Sistem, en az 4 kötü/alternatif durumu (bkz. 1.8) güvenli biçimde ele almalıdır.

## 1.7 İşlevsel Olmayan Gereksinimler (taslak liste)

- İOG1: Arayüz mobil tarayıcıdan (telefon/tablet ekran genişliğinde) kullanılabilir olmalıdır.
- İOG2: Veriler kalıcı bir veritabanında saklanmalı; uygulama kapatılıp açıldığında veri korunmalıdır.
- İOG3: Gizli/service-role anahtarlar istemci koduna veya GitHub deposuna konulmamalıdır; rol bazlı erişim kuralları (örn. Supabase RLS) uygulanmalıdır.
- İOG4: Kritik işlemler (stok çıkışı, düzeltme) için veri doğrulama ve iş kuralı kontrolleri sunucu/veritabanı tarafında da uygulanmalıdır (yalnızca istemci tarafı doğrulama yeterli değildir).
- İOG5: Sistem, aynı anda birden fazla kullanıcının aynı ürün üzerinde işlem yapmasını güvenli biçimde (veri tutarsızlığı oluşturmadan) ele almalıdır.
- İOG6: Sistem internet üzerinden canlı bir URL ile erişilebilir olmalıdır.

## 1.8 Alternatif / Kötü Durum Senaryoları (en az 10)

Her senaryo için: Tetikleyen · Sistem ne bilir/bilmez · Kullanıcı ne görür · Engelleme/uyarı · Kayıt · Bilgilendirilen · Güvenli duruma dönüş.

### Doküman kaynaklı (en az 4 — hepsi dahil edildi)

**S1 — Ürün bulunamıyor / kod hatalı**
- Tetikleyen: Kullanıcı var olmayan/yanlış yazılmış bir ürün kodu girer.
- Sistem bilgisi: Ürün tablosunda eşleşen kayıt yoktur.
- Kullanıcı görür: "Ürün bulunamadı" mesajı + benzer ürün adı/kod önerileri (varsa).
- Davranış: İşlem **engellenir**; devam etmek için geçerli ürün seçimi zorunludur.
- Kayıt: Başarısız arama denemesi loglanmaz (gürültü); yalnızca tekrarlayan hatalar izlenebilir.
- Bilgilendirilen: Yalnızca kullanıcı (ekranda).
- Güvenli duruma dönüş: Kullanıcı aramaya devam eder, sistem durumu değişmez.

**S2 — Çıkış miktarı mevcut stoktan büyük**
- Tetikleyen: Kullanıcı stok çıkışı için mevcut miktardan fazla değer girer.
- Sistem bilgisi: Güncel stok miktarı bilinir.
- Kullanıcı görür: "Yetersiz stok: mevcut X, girilen Y" uyarısı.
- Davranış: İşlem **engellenir** (negatif stok oluşmasına izin verilmez); kullanıcı miktarı düzeltmeye yönlendirilir.
- Kayıt: Başarısız işlem denemesi kaydedilmez; onaylanmış hareket yoksa stok tablosu değişmez.
- Bilgilendirilen: Kullanıcı; tekrarlarsa Depo Sorumlusu'na gösterilecek anomali olabilir (ileri özellik).
- Güvenli duruma dönüş: Stok miktarı değişmeden kalır.

**S3 — Aynı stok hareketi iki kez gönderiliyor (çift kayıt)**
- Tetikleyen: Ağ gecikmesi/çift tıklama nedeniyle aynı işlem formu iki kez submit edilir.
- Sistem bilgisi: Aynı kullanıcı, aynı ürün, aynı miktar, çok kısa zaman aralığında ikinci bir istek gönderir (idempotency/zaman penceresi kontrolü).
- Kullanıcı görür: İlk işlem "başarılı" onayı; ikinci deneme için "Bu işlem az önce kaydedildi, tekrar mı eklensin?" uyarısı.
- Davranış: İkinci kayıt **otomatik engellenir** veya kullanıcı onayına sunulur (çift kayıt oluşturulmaz).
- Kayıt: Yalnızca tek stok hareketi kalıcı olarak yazılır.
- Bilgilendirilen: Kullanıcı.
- Güvenli duruma dönüş: Stok miktarı tek hareket kadar değişmiş olur.

**S4 — İnternet bağlantısı işlem sırasında kesiliyor / sunucu yanıtı gecikiyor**
- Tetikleyen: Kayıt gönderilirken ağ kopması veya zaman aşımı.
- Sistem bilgisi: İstemci, isteğin sunucuya ulaşıp ulaşmadığını veya işlenip işlenmediğini bilemeyebilir.
- Kullanıcı görür: "Bağlantı sorunu, işlem onaylanamadı" mesajı; sayfa kapatılmadan tekrar deneme seçeneği.
- Davranış: İşlem sunucu tarafında **atomik** şekilde ya tam uygulanır ya da hiç uygulanmaz (yarım kayıt oluşmaz); istemci kesin onay almadan "başarılı" göstermez.
- Kayıt: Sadece sunucu tarafında onaylanmış işlem kalıcı olur.
- Bilgilendirilen: Kullanıcı.
- Güvenli duruma dönüş: Kullanıcı stok sorgulama ekranından son durumu teyit eder, gerekirse işlemi tekrar dener.

**S5 — İki kullanıcı aynı ürünün son stoğu üzerinde eşzamanlı işlem yapıyor**
- Tetikleyen: Depo Personeli A ve B, aynı anda aynı üründen çıkış yapmaya çalışır (toplamda mevcut stoktan fazla).
- Sistem bilgisi: Veritabanı seviyesinde güncel stok miktarı tek doğruluk kaynağıdır.
- Kullanıcı görür: İkinci işlemi gönderen kullanıcı, güncel (düşmüş) stok miktarına göre "yetersiz stok" uyarısı alır.
- Davranış: Veritabanı işlemleri **atomik/sıralı** uygulanır (örn. transaction + kontrol); ikinci işlem otomatik reddedilir veya güncel veriyle yeniden değerlendirilir.
- Kayıt: Yalnızca geçerli olan ilk işlem kaydedilir.
- Bilgilendirilen: İkinci kullanıcı anında ekranda bilgilendirilir.
- Güvenli duruma dönüş: Stok miktarı tutarlı kalır, negatif stok oluşmaz.

### Ekip tarafından geliştirilen ek senaryolar (en az 6)

**S6 — Yanlış depo/raf seçiliyor**
- Tetikleyen: Kullanıcı transfer/giriş sırasında hedef depo/rafı yanlış seçer, işlemi onaylar.
- Sistem bilgisi: Seçilen konum geçerli bir konumdur (sistem "yanlış" olduğunu bilemez, sadece geçerliliğini bilir).
- Kullanıcı görür: Onay ekranında "X depo/raf → Y depo/raf, Z adet" özeti; işlem sonrası "geri al" seçeneği (kısa süreli).
- Davranış: İşlem **onay adımı ile engellenmez ama özetlenerek azaltılır**; işlem sonrası düzeltme (ters transfer) Depo Sorumlusu yetkisiyle yapılabilir.
- Kayıt: Hem hatalı işlem hem düzeltme işlemi ayrı hareketler olarak loglanır (iz silinmez).
- Bilgilendirilen: İlgili depo sorumluları.
- Güvenli duruma dönüş: Stok, düzeltme hareketiyle doğru konuma geri taşınır; geçmişte iz kalır.

**S7 — Fiziksel stok ile sistemdeki stok uyuşmuyor (sayım farkı)**
- Tetikleyen: Sayım işlemi sırasında girilen fiziksel miktar, sistemdeki miktardan farklıdır.
- Sistem bilgisi: Sistemdeki son kayıtlı miktarı bilir, fiziksel gerçeği bilmez.
- Kullanıcı görür: "Fark tespit edildi: sistem X, sayım Y, fark Z" uyarısı ve not girme alanı.
- Davranış: İşlem **engellenmez ama onay gerektirir**; fark, Depo Sorumlusu onayına düşen bir "düzeltme talebi" olarak kaydedilir, otomatik uygulanmaz.
- Kayıt: Sayım kaydı + düzeltme talebi (durum: beklemede/onaylandı/reddedildi).
- Bilgilendirilen: Depo Sorumlusu.
- Güvenli duruma dönüş: Onaylanana kadar sistemdeki resmi stok değişmez; onaylanırsa yeni miktar kayda geçer.

**S8 — Transfer başlatılıyor ama hedef depo teslim almıyor**
- Tetikleyen: Kaynak depo transferi "gönderildi" olarak işaretler, hedef depo bir süre "teslim alındı" onayı vermez.
- Sistem bilgisi: Transferin durumu (gönderildi/yolda/teslim alındı) bilinir.
- Kullanıcı görür: Kaynak depo için "beklemede" durumu; belirli bir süre sonra hatırlatma/uyarı.
- Davranış: Ürün, teslim alınana kadar **"transfer-de" (ne kaynakta ne hedefte serbest kullanılabilir)** ara durumda tutulur; otomatik olarak hedefe eklenmez.
- Kayıt: Transfer durum geçmişi (gönderildi zamanı, teslim alma zamanı veya iptal).
- Bilgilendirilen: Her iki depodan sorumlu kullanıcılar.
- Güvenli duruma dönüş: Teslim alma onaylanınca stok hedefe geçer; iptal edilirse kaynağa geri döner.

**S9 — Yetkisiz kullanıcı stok düzeltmesi yapmaya çalışıyor**
- Tetikleyen: Depo Personeli rolündeki kullanıcı, sadece Depo Sorumlusu'na açık bir düzeltme/onay işlemine erişmeye çalışır.
- Sistem bilgisi: Kullanıcının rolü ve yetki matrisi bilinir.
- Kullanıcı görür: "Bu işlem için yetkiniz yok" mesajı; ilgili buton/ekran zaten gizli veya devre dışı.
- Davranış: İşlem **tamamen engellenir** (hem arayüzde hem sunucu/veritabanı yetki kuralında — çift katman kontrol).
- Kayıt: Yetkisiz erişim denemesi (isteğe bağlı) güvenlik logu olarak tutulabilir.
- Bilgilendirilen: Gerekirse Depo Sorumlusu.
- Güvenli duruma dönüş: Sistem durumu değişmez, veri bütünlüğü korunur.

**S10 — Ürünün ölçü birimi yanlış kullanılıyor (adet/koli/kg)**
- Tetikleyen: Kullanıcı, koli bazında takip edilen bir ürün için "adet" girer veya birim seçmeden miktar girer.
- Sistem bilgisi: Ürüne tanımlı resmi ölçü birimi bilinir.
- Kullanıcı görür: İşlem formunda birim sabit/salt-okunur gösterilir ("Birim: Koli"); birim uyuşmazlığı varsa giriş engellenir.
- Davranış: Sistem, her üründe **tek ve sabit birim** kullanır; kullanıcı birim değiştiremez, sadece o birimde miktar girer — bu sayede birim hatası kaynağında engellenir.
- Kayıt: Hareket, her zaman ürünün resmi birimiyle kaydedilir.
- Bilgilendirilen: Yalnızca kullanıcı (anlık uyarı).
- Güvenli duruma dönüş: Stok miktarı her zaman tek birim cinsinden tutarlı kalır.

**S11 — Kritik stok seviyesinin altına düşülüyor**
- Tetikleyen: Bir stok çıkışı sonrası ürün miktarı, tanımlı kritik seviyenin altına iner.
- Sistem bilgisi: Ürüne tanımlı kritik seviye eşiği bilinir.
- Kullanıcı görür: İşlemi yapan kullanıcıya "Kritik seviyenin altına düşüldü" bildirimi; Depo Sorumlusu panelinde kırmızı/uyarı rozeti.
- Davranış: İşlem **engellenmez**, sadece uyarı üretilir (stok çıkışının kendisi geçerli bir iş akışıdır).
- Kayıt: Uyarı durumu ürün kartında görünür hale gelir (log tutulması isteğe bağlı).
- Bilgilendirilen: Depo Sorumlusu (ana ekranda/listede).
- Güvenli duruma dönüş: Stok seviyesi yeni girişle kritik eşiğin üstüne çıkınca uyarı otomatik kalkar.

**S12 — Oturum süresi doluyor / kullanıcı işlem ortasında çıkış yapıyor**
- Tetikleyen: Kullanıcı formu doldururken oturum süresi dolar veya bilerek/bilmeyerek çıkış yapar.
- Sistem bilgisi: Oturum geçerliliğini bilir, form içeriğini istemci tarafında tutar.
- Kullanıcı görür: "Oturumunuz sona erdi, lütfen tekrar giriş yapın" mesajı; mümkünse form verisi kaybolmaz.
- Davranış: Kaydedilmemiş işlem **gönderilmez**; yeniden giriş istenir.
- Kayıt: Hiçbir yarım işlem veritabanına yazılmaz.
- Bilgilendirilen: Kullanıcı.
- Güvenli duruma dönüş: Kullanıcı yeniden giriş yapıp işlemi baştan tamamlar.

## 1.9 Başarı / Kabul Ölçütleri ve Temel İş Kuralları

- Stok miktarı asla negatif olamaz (İK1).
- Her stok hareketi; kullanıcı, zaman damgası, ürün, miktar, kaynak/hedef konum bilgisiyle kalıcı olarak kayıt altına alınır ve geriye dönük değiştirilemez/silinemez (yalnızca ters hareketle düzeltilir) (İK2).
- Depo Personeli yalnızca yetkili olduğu depo(lar) üzerinde işlem yapabilir; Depo Sorumlusu tüm depoları görebilir ve düzeltme/onay işlemlerini yapabilir (İK3).
- Her ürün tek ve sabit bir ölçü birimine sahiptir (İK4).
- Sayım farkları doğrudan stok miktarını değiştirmez; Depo Sorumlusu onayı gerektirir (İK5).
- Kabul ölçütü: En az stok girişi, çıkışı ve transfer işlemleri uçtan uca çalışan sistemde test edilebilir; en az 4 kötü durum (S1–S12 arasından seçilen) canlı sistemde gösterilebilir olmalıdır.
