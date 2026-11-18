# 4. Veri Akış Diyagramı (DFD)

## 4.1 Bağlam Diyagramı (Context Diagram)

Sistem sınırı ve dış varlıklar:

```mermaid
flowchart LR
    DP([Depo Personeli])
    DS([Depo Sorumlusu])
    OE([Öğretim Elemanı / Değerlendirici])

    SYS[["MOBİL DEPO VE STOK TAKİP SİSTEMİ"]]

    DP -- "Giriş bilgisi, ürün arama, stok giriş/çıkış/transfer/sayım isteği" --> SYS
    SYS -- "Ürün/stok bilgisi, işlem onayı/hata mesajı, uyarılar" --> DP

    DS -- "Giriş bilgisi, onay/red kararları, sorgu/filtre istekleri" --> SYS
    SYS -- "Stok raporu, hareket geçmişi, kritik stok uyarısı, düzeltme talepleri" --> DS

    OE -- "Test hesabıyla giriş, demo işlemleri" --> SYS
    SYS -- "Canlı sistem erişimi" --> OE
```

## 4.2 Seviye-0 DFD (Ana Süreçler)

**Veri depoları:** D1 Kullanıcılar · D2 Ürünler · D3 Depolar/Konumlar · D4 StokHareketleri · D5 DüzeltmeTalepleri (sayım farkları)

```mermaid
flowchart TD
    DP([Depo Personeli])
    DS([Depo Sorumlusu])

    P1(["P1 Kimlik Doğrulama ve Yetkilendirme"])
    P2(["P2 Ürün Arama"])
    P3(["P3 Stok Girişi"])
    P4(["P4 Stok Çıkışı"])
    P5(["P5 Depo/Raf Transferi"])
    P6(["P6 Sayım / Düzeltme"])
    P7(["P7 Stok ve Geçmiş Sorgulama"])
    P8(["P8 Kritik Stok Uyarısı"])

    D1[(D1 Kullanıcılar)]
    D2[(D2 Ürünler)]
    D3[(D3 Depolar/Konumlar)]
    D4[(D4 StokHareketleri)]
    D5[(D5 DüzeltmeTalepleri)]

    DP -- "kullanıcı adı/şifre" --> P1
    P1 -- "oturum + rol" --> D1
    D1 -- "rol/yetki bilgisi" --> P1
    P1 -- "doğrulama sonucu" --> DP

    DP -- "ürün kodu/adı" --> P2
    P2 -- "sorgu" --> D2
    D2 -- "ürün kaydı" --> P2
    P2 -- "ürün bilgisi" --> DP

    DP -- "giriş miktarı + konum" --> P3
    P3 <-- "stok oku/güncelle" --> D2
    P3 <-- "konum doğrula" --> D3
    P3 -- "hareket kaydı (GİRİŞ)" --> D4
    P3 -- "sonuç" --> DP

    DP -- "çıkış miktarı + konum" --> P4
    P4 <-- "stok oku/güncelle" --> D2
    P4 <-- "konum doğrula" --> D3
    P4 -- "hareket kaydı (ÇIKIŞ)" --> D4
    P4 -- "sonuç / yetersiz stok uyarısı" --> DP
    P4 -- "güncel miktar" --> P8

    DP -- "transfer isteği (kaynak/hedef + miktar)" --> P5
    P5 <-- "stok oku/güncelle" --> D2
    P5 <-- "konum doğrula" --> D3
    P5 -- "hareket kaydı (TRANSFER, durum)" --> D4
    P5 -- "sonuç" --> DP

    DP -- "fiziksel sayım miktarı" --> P6
    P6 <-- "sistem miktarını oku" --> D2
    P6 -- "düzeltme talebi" --> D5
    D5 -- "onay/red" --> P6
    DS -- "onay/red kararı" --> P6
    P6 -- "onaylanmış düzeltme" --> D2
    P6 -- "sonuç" --> DP

    DS -- "sorgu/filtre" --> P7
    P7 <-- "oku" --> D4
    P7 <-- "oku" --> D2
    P7 -- "stok raporu / geçmiş" --> DS

    P8 -- "kritik seviye kontrolü" --> D2
    P8 -- "uyarı" --> DS
```

## 4.3 Seviye-1 DFD — P4 Stok Çıkışı (ayrıntılandırma)

```mermaid
flowchart TD
    DP([Depo Personeli])
    DS([Depo Sorumlusu])

    P4_1(["P4.1 Ürün + Konum Doğrula"])
    P4_2(["P4.2 Yetki Kontrolü"])
    P4_3(["P4.3 Stok Yeterlilik Kontrolü"])
    P4_4(["P4.4 Hareketi Kaydet ve Stok Güncelle"])
    P4_5(["P4.5 Kritik Seviye Kontrolü"])

    D2[(D2 Ürünler)]
    D3[(D3 Depolar/Konumlar)]
    D4[(D4 StokHareketleri)]
    D1[(D1 Kullanıcılar)]

    DP -- "ürün kodu, konum, miktar" --> P4_1
    P4_1 <-- "doğrula" --> D2
    P4_1 <-- "doğrula" --> D3
    P4_1 -- "geçersizse hata (S1)" --> DP
    P4_1 -- "geçerli istek" --> P4_2

    P4_2 <-- "rol/yetki oku" --> D1
    P4_2 -- "yetkisizse hata (S9)" --> DP
    P4_2 -- "yetkili istek" --> P4_3

    P4_3 <-- "güncel stok oku" --> D2
    P4_3 -- "yetersizse uyarı (S2)" --> DP
    P4_3 -- "yeterli stok" --> P4_4

    P4_4 -- "stok miktarını düşür" --> D2
    P4_4 -- "hareket kaydı yaz (append-only)" --> D4
    P4_4 -- "işlem onayı" --> DP
    P4_4 -- "yeni miktar" --> P4_5

    P4_5 <-- "kritik eşik oku" --> D2
    P4_5 -- "eşik altındaysa uyarı" --> DS
```

## 4.4 Notlar / İzlenebilirlik

- P1–P8 süreçleri, `01-gereksinim-analizi.md` içindeki İG1–İG12 ile birebir eşleşir (örn. P4 ↔ İG5, P8 ↔ İG10, P6 ↔ İG11).
- D4 (StokHareketleri) veri deposu **append-only**'dir; bu kural İK2 ile tutarlıdır.
- Seviye-1 ayrıntısındaki P4.1–P4.3 sırası, `03-surec-akis-diyagrami.md`'deki Stok Çıkışı sürecinin S1→S2→S3 karar noktalarıyla aynıdır — böylece gereksinim → senaryo → süreç → veri akışı arasında izlenebilirlik korunur.
