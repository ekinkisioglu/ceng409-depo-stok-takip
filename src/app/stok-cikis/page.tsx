"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type FormAlanlari = {
  urun_kodu: string;
  depo_kodu: string;
  raf_kodu: string;
  miktar: string;
  not: string;
};

const BOS_FORM: FormAlanlari = {
  urun_kodu: "",
  depo_kodu: "",
  raf_kodu: "",
  miktar: "",
  not: "",
};

export default function StokCikisPage() {
  const [form, setForm] = useState<FormAlanlari>(BOS_FORM);
  const [onayEkraninda, setOnayEkraninda] = useState(false);
  const [idemKey, setIdemKey] = useState<string>(() => crypto.randomUUID());
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  function alanDegisti(alan: keyof FormAlanlari, deger: string) {
    setForm((f) => ({ ...f, [alan]: deger }));
  }

  function handleDevamEt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setOnayEkraninda(true);
  }

  async function handleOnayla() {
    setYukleniyor(true);
    const supabase = createClient();

    // Aynı istek yanlışlıkla iki kez gönderilirse (S3 senaryosu) sunucu
    // aynı idempotency anahtarıyla ikinci bir hareket oluşturmaz.
    const { data, error } = await supabase.rpc("kayit_stok_hareketi", {
      p_product_code: form.urun_kodu.trim(),
      p_movement_type: "CIKIS",
      p_quantity: Number(form.miktar),
      p_warehouse_code: form.depo_kodu.trim(),
      p_location_code: form.raf_kodu.trim(),
      p_note: form.not || null,
      p_idempotency_key: idemKey,
    });

    setYukleniyor(false);

    if (error) {
      // "Yetersiz stok: mevcut X, girilen Y" mesajı veritabanı fonksiyonundan
      // doğrudan gelir (S2 senaryosu).
      setHata(error.message);
      setOnayEkraninda(false);
      return;
    }

    setBasari(`Stok çıkışı kaydedildi. Yeni miktar: ${data}`);
    setForm(BOS_FORM);
    setOnayEkraninda(false);
    setIdemKey(crypto.randomUUID());
  }

  function handleVazgec() {
    setOnayEkraninda(false);
  }

  return (
    <AppShell title="Stok Çıkışı" backHref="/ana-sayfa">
      {!onayEkraninda ? (
        <form onSubmit={handleDevamEt} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Ürün kodu
            <input
              type="text"
              placeholder="P-1001"
              required
              value={form.urun_kodu}
              onChange={(e) => alanDegisti("urun_kodu", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Kaynak depo kodu
            <input
              type="text"
              placeholder="DEPO-A"
              required
              value={form.depo_kodu}
              onChange={(e) => alanDegisti("depo_kodu", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Kaynak raf kodu
            <input
              type="text"
              placeholder="RAF-3"
              required
              value={form.raf_kodu}
              onChange={(e) => alanDegisti("raf_kodu", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Miktar
            <input
              type="number"
              min={0.01}
              step="any"
              required
              value={form.miktar}
              onChange={(e) => alanDegisti("miktar", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Not (opsiyonel)
            <input
              type="text"
              value={form.not}
              onChange={(e) => alanDegisti("not", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>

          {hata ? <p className="text-sm text-red-600">{hata}</p> : null}
          {basari ? (
            <p className="text-sm text-green-600">✅ {basari}</p>
          ) : null}

          <button
            type="submit"
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Devam Et
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Lütfen kontrol edin:</p>
            <p className="mt-1">
              <b>{form.urun_kodu}</b> ürününden <b>{form.depo_kodu}/{form.raf_kodu}</b>{" "}
              konumundan <b>{form.miktar}</b> birim çıkış yapılacak.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Ürün kodu ve depo/raf kodu doğru mu? Yanlışsa &quot;Vazgeç&quot;e basıp düzeltin (S6 senaryosu).
            </p>
          </div>

          {hata ? <p className="text-sm text-red-600">{hata}</p> : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVazgec}
              disabled={yukleniyor}
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleOnayla}
              disabled={yukleniyor}
              className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {yukleniyor ? "Kaydediliyor..." : "Onayla"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
