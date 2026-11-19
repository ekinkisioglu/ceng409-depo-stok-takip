"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function SayimPage() {
  const [hata, setHata] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setSonuc(null);
    setYukleniyor(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("kayit_sayim", {
      p_product_code: String(form.get("urun_kodu") ?? "").trim(),
      p_warehouse_code: String(form.get("depo_kodu") ?? "").trim(),
      p_location_code: String(form.get("raf_kodu") ?? "").trim(),
      p_counted_quantity: Number(form.get("miktar")),
      p_note: String(form.get("not") ?? "") || null,
    });

    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }

    if (Number(data) === 0) {
      setSonuc("Fark yok — sistemdeki stok fiziksel sayımla uyumlu.");
    } else {
      setSonuc(
        `Fark tespit edildi (${data}). Düzeltme talebi Depo Sorumlusu onayına gönderildi; stok miktarı onaylanana kadar değişmeyecek.`,
      );
    }
    e.currentTarget.reset();
  }

  return (
    <AppShell title="Sayım" backHref="/ana-sayfa">
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
          Depo kodu
          <input
            type="text"
            name="depo_kodu"
            placeholder="DEPO-A"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Raf kodu
          <input
            type="text"
            name="raf_kodu"
            placeholder="RAF-3"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Fiziksel sayım miktarı
          <input
            type="number"
            name="miktar"
            min={0}
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
        {sonuc ? <p className="text-sm text-green-600">✅ {sonuc}</p> : null}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Sayımı Kaydet"}
        </button>
      </form>
    </AppShell>
  );
}
