# 3. Süreç Akış Diyagramı — Stok Çıkışı (uçtan uca kritik süreç)

> Kulvarlar: **Depo Personeli** (süreç) · **Sistem** (süreç/kontrol) · **Depo Sorumlusu** (sorumlu/onay) · **Kayıt/Belge** (veri deposu). Tetikleyiciler, karar noktaları, kayıtlar ve sonuçlar belirtilmiştir.

```mermaid
flowchart TD
    subgraph L1["Kulvar: Depo Personeli"]
        T0([Tetikleyici: Sevkiyat/üretim talebi için stok çıkışı gerekiyor]) --> P1[Ürünü kod/ad ile ara]
        P1 --> P2[Çıkış miktarı ve kaynak konum gir]
        P2 --> P3[İşlemi onayla / gönder]
    end

    subgraph L2["Kulvar: Sistem"]
        S1{Ürün ve konum geçerli mi?}
        S1 -->|Hayır| S1X[Hata göster: ürün/konum bulunamadı]
        S1 -->|Evet| S2{Kullanıcının bu depoda çıkış yetkisi var mı?}
        S2 -->|Hayır| S2X[İşlemi reddet: yetki hatası]
        S2 -->|Evet| S3{Miktar <= mevcut stok mu?}
        S3 -->|Hayır| S3X[İşlemi reddet: yetersiz stok]
        S3 -->|Evet| S4[(Veritabanı işlemi: stok hareketi yaz + stok miktarını güncelle)]
        S4 --> S5{Yeni miktar kritik seviye altında mı?}
        S5 -->|Evet| S5A[Kritik stok bayrağı/uyarısı oluştur]
        S5 -->|Hayır| S6[İşlemi onayla]
        S5A --> S6
    end

    subgraph REC["Kayıt/Belge (veri deposu)"]
        R1[(Stok Hareketleri tablosu: ürün, miktar, kullanıcı, zaman, kaynak konum, işlem türü=ÇIKIŞ)]
        R2[(Ürün tablosu: güncel stok miktarı)]
        R3[(Uyarılar: kritik stok bayrağı)]
    end

    subgraph L3["Kulvar: Depo Sorumlusu"]
        M1[Stok hareketi geçmişinde işlemi görür]
        M2[Kritik stok uyarısı varsa bildirim alır]
    end

    T0 --> L1
    P3 --> S1
    S1X --> P1
    S2X --> P1
    S3X --> P2
    S4 --> R1
    S4 --> R2
    S5A --> R3
    S6 --> E1([Sonuç: Çıkış tamamlandı, güncel stok gösterildi])
    R1 -.izlenir.-> M1
    R3 -.bildirilir.-> M2
```

## Süreç Özeti (madde madde)

| Adım | Tetikleyici / Girdi | Karar Noktası | Belge/Kayıt | Sorumlu | Sonuç |
|---|---|---|---|---|---|
| 1 | Sevkiyat/üretim ihtiyacı | — | — | Depo Personeli | Ürün aranır |
| 2 | Ürün + miktar girişi | Ürün/konum geçerli mi? | — | Sistem | Geçersizse engellenir (S1 senaryosu) |
| 3 | Yetki kontrolü | Kullanıcının yetkisi var mı? | — | Sistem | Yetkisizse engellenir (S9 senaryosu) |
| 4 | Stok kontrolü | Miktar ≤ mevcut stok mu? | — | Sistem | Yetersizse engellenir (S2 senaryosu) |
| 5 | Onaylanan çıkış | — | Stok Hareketleri kaydı yazılır (atomik) | Sistem | Stok miktarı güncellenir |
| 6 | Güncellenmiş miktar | Kritik seviyenin altında mı? | Uyarı bayrağı oluşturulur | Sistem | Depo Sorumlusu bilgilendirilir (S11 senaryosu) |
| 7 | Tamamlanan işlem | — | Geçmiş kaydı | Depo Sorumlusu | İzlenebilirlik sağlanır |

## Notlar

- Adım 2–4 arasındaki tüm kontroller **tek bir atomik veritabanı işlemi (transaction)** içinde yapılmalıdır; aksi halde S5 (eşzamanlılık) senaryosunda iki kullanıcı aynı anda geçerli kontrolü geçip negatif stok oluşturabilir.
- "Kayıt/Belge" kulvarındaki Stok Hareketleri tablosu **append-only** mantıkla çalışır: geçmiş hareketler silinmez/değiştirilmez, yalnızca yeni ters hareketlerle düzeltilir (bkz. İK2, `01-gereksinim-analizi.md`).
- Bu süreç, Stok Girişi ve Transfer süreçleri için de aynı iskelet (ara + doğrula + yetki/iş kuralı kontrolü + kalıcı kayıt + uyarı) ile uyarlanacaktır; aralarındaki fark yalnızca kontrol yönü (giriş: stok artar / çıkış: stok kontrollü azalır / transfer: iki konum birlikte güncellenir) ve ek durum alanlarıdır (örn. transferde "beklemede/teslim alındı" durumu — S8 senaryosu).
