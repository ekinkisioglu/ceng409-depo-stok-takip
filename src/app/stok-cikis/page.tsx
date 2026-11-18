"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function StokCikisPage() {
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setYukleniyor(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("kayit_stok_hareketi", {
      p_product_code: String(form.get("urun_kodu") ?? "").trim(),
      p_movement_type: "CIKIS",
      p_quantity: Number(form.get("miktar")),
      p_warehouse_code: String(form.get("depo_kodu") ?? "").trim(),
      p_location_code: String(form.get("raf_kodu") ?? "").trim(),
      p_note: String(form.get("not") ?? "") || null,
    });

    setYukleniyor(false);

    if (error) {
      // "Yetersiz stok: mevcut X, girilen Y" mesajı veritabanı fonksiyonundan
      // doğrudan gelir (S2 senaryosu).
      setHata(error.message);
      return;
    }

    setBasari(`Stok çıkışı kaydedildi. Yeni miktar: ${data}`);
    e.currentTarget.reset();
  }

  return (
    <AppShell title="Stok Çıkışı" backHref="/ana-sayfa">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün kodu
          <input
            type="text"
            name="urun_kodu"
            placeholder="P-1001"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Kaynak depo kodu
          <input
            type="text"
            name="depo_kodu"
            placeholder="DEPO-A"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Kaynak raf kodu
          <input
            type="text"
            name="raf_kodu"
            placeholder="RAF-3"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Miktar
          <input
            type="number"
            name="miktar"
            min={0.01}
            step="any"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Not (opsiyonel)
          <input
            type="text"
            name="not"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        {hata ? <p className="text-sm text-red-600">{hata}</p> : null}
        {basari ? <p className="text-sm text-green-600">✅ {basari}</p> : null}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Onayla"}
        </button>
      </form>
    </AppShell>
  );
}
