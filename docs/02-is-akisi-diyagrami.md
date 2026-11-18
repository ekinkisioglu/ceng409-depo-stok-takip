# 2. İş Akış Diyagramı (Workflow Diagram)

> Roller: **Depo Personeli**, **Sistem**, **Depo Sorumlusu**. Ana akış (yeşil/varsayılan yol) ile seçilen kritik kötü durumlar (S2, S5, S7, S9, S11 — bkz. `01-gereksinim-analizi.md`) aynı yapı içinde gösterilmiştir.

```mermaid
flowchart TD
    subgraph DP["Depo Personeli"]
        A1([Başla: Giriş yap]) --> A2[Depo/ambar seç]
        A2 --> A3[Ürün kodu/adı ile ara]
        A3 --> A4{İşlem türü seç}
        A4 -->|Stok Girişi| A5[Miktar + hedef konum gir]
        A4 -->|Stok Çıkışı| A6[Miktar + kaynak konum gir]
        A4 -->|Transfer| A7[Miktar + kaynak/hedef depo gir]
        A4 -->|Sayım| A8[Fiziksel sayım miktarı gir]
        A4 -->|Sorgulama| A9[Güncel stok/konum görüntüle]
        A5 --> B1
        A6 --> B1
        A7 --> B1
        A8 --> B1
    end

    subgraph SYS["Sistem"]
        B1{Yetki kontrolü geçti mi?}
        B1 -->|Hayır - S9| B1X[İşlemi engelle: yetki hatası göster]
        B1 -->|Evet| B2{İş kuralı / stok kontrolü}
        B2 -->|Çıkış miktarı > mevcut stok - S2| B2X[İşlemi engelle: yetersiz stok uyarısı]
        B2 -->|Eşzamanlı işlem çakışması - S5| B2Y[İkinci isteği reddet / güncel veriyle tekrar değerlendir]
        B2 -->|Sayım farkı tespit edildi - S7| B2Z[Düzeltme talebi oluştur → Sorumlu onayına gönder]
        B2 -->|Geçerli| B3[Stok hareketini kalıcı veritabanına yaz]
        B3 --> B4{Yeni miktar kritik seviye altında mı? - S11}
        B4 -->|Evet| B4X[Kritik stok uyarısı üret]
        B4 -->|Hayır| B5[Güncel stok/konum bilgisini güncelle]
        B4X --> B5
    end

    subgraph DS["Depo Sorumlusu"]
        C1[Stok hareketlerini izle]
        C2[Kritik stok uyarılarını gör]
        C3[Sayım/düzeltme taleplerini onayla veya reddet]
        C4[Kullanıcı bazlı işlem geçmişini denetle]
    end

    B1X --> A1
    B2X --> A6
    B2Y --> A6
    B5 --> A3
    A9 --> A3
    B4X -.bildirim.-> C2
    B3 -.kayıt.-> C1
    B2Z -.onay bekliyor.-> C3
    C3 -->|onay| B3
    C3 -->|red| A1
    B3 -.her hareket.-> C4
```

## Notlar

- **S9 (yetkisiz erişim):** Yetki kontrolü, ürün/konuma erişmeden önce en ilk adımda yapılır — engellenen kullanıcı hiçbir stok verisini değiştiremez.
- **S2 (yetersiz stok):** İş kuralı kontrolü veritabanı/sunucu tarafında yapılır, yalnızca arayüzde değil.
- **S5 (eşzamanlılık):** İkinci istek, ilkinin işlenmesinden sonra güncel stok değeriyle yeniden değerlendirilir; bu nedenle B2 adımı atomik bir veritabanı işlemi (transaction) içinde çalışmalıdır.
- **S7 (sayım farkı):** Otomatik stok güncellemesi yapılmaz; Depo Sorumlusu onayı akışa dahildir (C3).
- **S11 (kritik seviye):** İşlemi engellemez, yalnızca Depo Sorumlusu'na bildirim üretir.
- Her stok hareketi (B3), rolünden bağımsız olarak Depo Sorumlusu'nun izleyebileceği geçmişe (C4) otomatik olarak düşer.
