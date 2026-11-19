"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function TransferForm() {
  const router = useRouter();
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

    const { error } = await supabase.rpc("baslat_transfer", {
      p_product_code: String(form.get("urun_kodu") ?? "").trim(),
      p_quantity: Number(form.get("miktar")),
      p_src_warehouse_code: String(form.get("kaynak_depo") ?? "").trim(),
      p_src_location_code: String(form.get("kaynak_raf") ?? "").trim(),
      p_dst_warehouse_code: String(form.get("hedef_depo") ?? "").trim(),
      p_dst_location_code: String(form.get("hedef_raf") ?? "").trim(),
      p_note: String(form.get("not") ?? "") || null,
    });

    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }

    setBasari("Transfer başlatıldı, hedef depo teslim almayı bekliyor.");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
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
          name="kaynak_depo"
          placeholder="DEPO-A"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Kaynak raf kodu
        <input
          type="text"
          name="kaynak_raf"
          placeholder="RAF-3"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Hedef depo kodu
        <input
          type="text"
          name="hedef_depo"
          placeholder="DEPO-B"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Hedef raf kodu
        <input
          type="text"
          name="hedef_raf"
          placeholder="RAF-1"
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
        {yukleniyor ? "Gönderiliyor..." : "Transferi Başlat"}
      </button>
    </form>
  );
}
